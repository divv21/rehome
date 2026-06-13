import os, json, re, base64
from pathlib import Path
from dotenv import load_dotenv
import requests

load_dotenv()

DEMO_MODE = os.getenv('DEMO_MODE', 'true').lower() == 'true'

# ── Keys ──────────────────────────────────────────────────────────────────────

# Only real Gemini keys start with "AIza" — silently skip OAuth tokens (AQ.*)
GOOGLE_KEYS = [v for k in [
    'GOOGLE_API_KEY', 'GOOGLE_API_KEY_1', 'GOOGLE_API_KEY_2',
    'GOOGLE_API_KEY_3', 'GOOGLE_API_KEY_4',
] if (v := os.getenv(k, '').strip()) and v.startswith('AIza')]

MISTRAL_KEYS = [v for k in [
    'MISTRAL_API_KEY', 'MISTRAL_API_KEY_1', 'MISTRAL_API_KEY_2',
    'MISTRAL_API_KEY_3', 'MISTRAL_API_KEY_4', 'MISTRAL_API_KEY_5',
] if (v := os.getenv(k, '').strip())]

# ── Model config ──────────────────────────────────────────────────────────────

GEMINI_MODELS   = ['gemini-2.0-flash-lite', 'gemini-2.0-flash']
GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

MISTRAL_MODEL = 'pixtral-12b-2409'
MISTRAL_URL   = 'https://api.mistral.ai/v1/chat/completions'

# ── Prompt ────────────────────────────────────────────────────────────────────

GRADING_PROMPT = '''You are a product condition grading assistant for Amazon Rehome, Amazon's intelligent returns resale platform.

Analyze the product image carefully and respond with ONLY a JSON object, no markdown, no backticks, no extra text:
{
  "condition_tier": "one of: Like New / Good / Acceptable / Liquidate",
  "confidence": integer between 0 and 100,
  "damage_notes": "one clear sentence describing the product condition",
  "suggested_resale_price": integer in INR based on condition and visible product type
}'''

# ── Helpers ───────────────────────────────────────────────────────────────────

def image_to_b64(path: str) -> tuple[str, str]:
    ext = Path(path).suffix.lower()
    mime = {
        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
        '.png': 'image/png',  '.webp': 'image/webp'
    }.get(ext, 'image/jpeg')
    with open(path, 'rb') as f:
        return base64.b64encode(f.read()).decode(), mime

def parse_json(text: str) -> dict:
    # Strip markdown fences if model wraps with them
    text = text.strip()
    if text.startswith(''):
        parts = text.split('')
        text = parts[1] if len(parts) > 1 else text
        if text.startswith('json'):
            text = text[4:]
    return json.loads(text.strip())

def is_quota_error(status: int, body: str) -> bool:
    return status == 429 or (status == 403 and 'quota' in body.lower())

# ── Providers ─────────────────────────────────────────────────────────────────

def try_gemini(image_path: str, return_reason: str, product_name: str) -> dict | None:
    if not GOOGLE_KEYS:
        print('  [skip] No valid Google API keys (need keys starting with AIza)')
        return None

    b64, mime = image_to_b64(image_path)
    payload = {
        'contents': [{'parts': [
            {'text': f'Product: {product_name}\nReturn reason: {return_reason}\n\n{GRADING_PROMPT}'},
            {'inline_data': {'mime_type': mime, 'data': b64}},
        ]}],
        'generationConfig': {'temperature': 0.4, 'maxOutputTokens': 500},
    }

    for key in GOOGLE_KEYS:
        for model in GEMINI_MODELS:
            tag = f'Gemini/{model} (key ...{key[-6:]})'
            print(f'  Trying {tag}...')
            try:
                resp = requests.post(
                    f'{GEMINI_API_BASE}/{model}:generateContent',
                    params={'key': key},
                    headers={'Content-Type': 'application/json'},
                    json=payload, timeout=60,
                )
                if resp.status_code == 200:
                    text = resp.json()['candidates'][0]['content']['parts'][0]['text']
                    print(f'  Success with {tag}')
                    return parse_json(text)
                if resp.status_code == 404:
                    print(f'  Model not available, skipping')
                    continue
                if resp.status_code == 401:
                    print(f'  Invalid key, trying next key')
                    break   # skip remaining models for this bad key
                if is_quota_error(resp.status_code, resp.text):
                    print(f'  Quota exhausted, trying next...')
                    continue
                print(f'  Unexpected {resp.status_code}, skipping')
                continue
            except Exception as e:
                print(f'  Exception: {e}, skipping')
                continue

    print('  All Gemini attempts exhausted.')
    return None


def try_mistral(image_path: str, return_reason: str, product_name: str) -> dict | None:
    if not MISTRAL_KEYS:
        print('  [skip] No Mistral API keys found in .env')
        return None

    b64, mime = image_to_b64(image_path)
    payload = {
        'model': MISTRAL_MODEL,
        'messages': [{
            'role': 'user',
            'content': [
                {
                    'type': 'text',
                    'text': f'Product: {product_name}\nReturn reason: {return_reason}\n\n{GRADING_PROMPT}'
                },
                {
                    'type': 'image_url',
                    'image_url': f'data:{mime};base64,{b64}'
                }
            ]
        }],
        'temperature': 0.4,
        'max_tokens': 500
    }

    for i, key in enumerate(MISTRAL_KEYS):
        print(f'  Trying Mistral key {i+1} of {len(MISTRAL_KEYS)}...')
        try:
            resp = requests.post(
                MISTRAL_URL,
                headers={
                    'Authorization': f'Bearer {key}',
                    'Content-Type': 'application/json'
                },
                json=payload, timeout=60,
            )
            if resp.status_code == 200:
                text = resp.json()['choices'][0]['message']['content']
                print(f'  Success with Mistral key {i+1}')
                return parse_json(text)
            if resp.status_code == 429:
                print(f'  Key {i+1} rate limited, trying next...')
                continue
            if resp.status_code == 401:
                print(f'  Key {i+1} invalid, trying next...')
                continue
            print(f'  Key {i+1} returned {resp.status_code}, trying next...')
            continue
        except Exception as e:
            print(f'  Key {i+1} threw exception: {e}, trying next...')
            continue

    print('  All Mistral keys exhausted.')
    return None

# ── Public API ────────────────────────────────────────────────────────────────

def grade_product(image_paths: list[str], return_reason: str, product_name: str) -> dict:
    if DEMO_MODE:
        return {
            'condition_tier': 'Good',
            'confidence': 91,
            'damage_notes': 'Minor scuff on bottom edge, all functional components intact.',
            'suggested_resale_price': 1200
        }

    # Find the first real image file
    resolved_path = None
    for path in image_paths:
        full_path = path if os.path.exists(path) else f'uploads/{os.path.basename(path)}'
        print(f'  Checking path: {full_path}, exists: {os.path.exists(full_path)}')
        if os.path.exists(full_path) and 'placeholder' not in full_path:
            resolved_path = full_path
            break

    if not resolved_path:
        print('  No valid image found, using fallback.')
        return {
            'condition_tier': 'Good',
            'confidence': 85,
            'damage_notes': 'AI grading unavailable — no valid image found.',
            'suggested_resale_price': 1000
        }

    # Try Gemini first, then Mistral
    result = (
        try_gemini(resolved_path, return_reason, product_name) or
        try_mistral(resolved_path, return_reason, product_name)
    )

    if result:
        return result

    print('  All providers failed, using fallback.')
    return {
        'condition_tier': 'Good',
        'confidence': 85,
        'damage_notes': 'AI grading unavailable — all providers exhausted.',
        'suggested_resale_price': 1000
    }