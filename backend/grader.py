import os, json, base64
from pathlib import Path
from dotenv import load_dotenv
import requests

load_dotenv(dotenv_path=Path(__file__).parent / '.env')

DEMO_MODE = os.getenv('DEMO_MODE', 'false').lower() == 'true'

# ── Keys ──────────────────────────────────────────────────────────────────────

GOOGLE_KEYS = [v for k in [
    'GOOGLE_API_KEY', 'GOOGLE_API_KEY_1', 'GOOGLE_API_KEY_2',
    'GOOGLE_API_KEY_3', 'GOOGLE_API_KEY_4',
] if (v := os.getenv(k, '').strip()) and v.startswith('AIza')]

MISTRAL_KEYS = [v for k in [
    'MISTRAL_API_KEY', 'MISTRAL_API_KEY_1', 'MISTRAL_API_KEY_2',
    'MISTRAL_API_KEY_3', 'MISTRAL_API_KEY_4', 'MISTRAL_API_KEY_5',
] if (v := os.getenv(k, '').strip())]

print(f'[grader] DEMO_MODE={DEMO_MODE} | Google keys={len(GOOGLE_KEYS)} | Mistral keys={len(MISTRAL_KEYS)}')

# ── Model config ──────────────────────────────────────────────────────────────

GEMINI_MODELS   = ['gemini-2.0-flash-lite', 'gemini-2.0-flash']
GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
MISTRAL_MODEL   = 'pixtral-12b-2409'
MISTRAL_URL     = 'https://api.mistral.ai/v1/chat/completions'

# ── Prompt ────────────────────────────────────────────────────────────────────

GRADING_PROMPT = '''You are a strict product condition grading inspector for Amazon Rehome.

Be BRUTALLY HONEST. Do not be generous. Judge only what you can see.

IMPORTANT — Category specific rules:
- Electronics (phones, laptops, headphones, appliances with circuits): Visual grading covers cosmetics ONLY. You cannot assess functional condition from images. Cap your confidence at 60 maximum for electronics regardless of visual condition. Flag functional_testing_required as true always for electronics.
- Clothing and accessories: Visual grading is sufficient. Check for stains, tears, missing parts.
- Kitchen and home appliances: Visual grading covers physical damage. Flag functional_testing_required as true.
- Books, toys, furniture, sports: Visual grading is sufficient.

Grading tiers — apply strictly:
- "Like New": Zero visible damage. Factory fresh. No scratches, dents, or marks whatsoever.
- "Good": Minor cosmetic issues only (light scratches, small scuffs). Fully functional appearance. Nothing visibly broken.
- "Acceptable": Noticeable damage but still usable appearance. Moderate scratches, dents, or wear. Requires refurbishment before resale. NOT for cracked screens or broken parts.
- "Liquidate": Cracked or shattered screen, broken casing, exposed internals, severe structural damage. No resale value even after refurbishment. Parts only.

Hard rules:
- Cracked or shattered screen = ALWAYS Liquidate
- Broken casing or exposed internals = ALWAYS Liquidate
- Acceptable items ALWAYS require refurbishment before resale
- When in doubt between two tiers always pick the LOWER (worse) one
- confidence is how certain you are of your condition_tier based on what is VISIBLE only
- suggested_resale_price must reflect POST refurbishment value where applicable:
  Liquidate = INR 200-800 (parts only)
  Acceptable = INR 800-2500 (post refurbishment estimate)
  Good = INR 1500-5000
  Like New = INR 3000+

Respond with ONLY a JSON object, no markdown, no backticks, no extra text:
{
  "condition_tier": "Like New / Good / Acceptable / Liquidate",
  "confidence": <integer 0-100>,
  "damage_notes": "one brutally honest sentence describing exactly what damage is visible",
  "suggested_resale_price": <integer in INR>,
  "refurbishment_needed": <true or false>,
  "refurbishment_notes": "specific actions needed to restore this item, or null if not needed",
  "functional_testing_required": <true or false>,
  "functional_testing_notes": "what specifically needs to be tested, or null if not required"
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
    text = text.strip()
    # Strip backtick fences
    if text.startswith('`'):
        lines = [l for l in text.splitlines() if not l.strip().startswith('`')]
        text = '\n'.join(lines)
    # Extract just the JSON object
    start, end = text.find('{'), text.rfind('}')
    if start != -1 and end != -1:
        text = text[start:end+1]
    return json.loads(text.strip())

def is_quota_error(status: int, body: str) -> bool:
    return status == 429 or (status == 403 and 'quota' in body.lower())

TIER_TO_GRADE = {
    'Like New':  'A+',
    'Good':      'B',
    'Acceptable':'C',
    'Liquidate': 'F',
}

def log_result(parsed: dict, provider: str) -> None:
    tier  = parsed.get('condition_tier', '?')
    grade = TIER_TO_GRADE.get(tier, '?')
    conf  = parsed.get('confidence', '?')
    price = parsed.get('suggested_resale_price', '?')
    notes = parsed.get('damage_notes', '')
    print(f'  ✔  {provider}')
    print(f'  ┌─ Condition : {tier} (Grade {grade})')
    print(f'  ├─ Confidence: {conf}%')
    print(f'  ├─ Price     : ₹{price}')
    print(f'  └─ Notes     : {notes}')

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
        'generationConfig': {'temperature': 0.2, 'maxOutputTokens': 500},
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
                    parsed = parse_json(text)
                    log_result(parsed, tag)
                    return parsed
                if resp.status_code == 404:
                    print(f'  Model not available, skipping'); continue
                if resp.status_code == 401:
                    print(f'  Invalid key, trying next key'); break
                if is_quota_error(resp.status_code, resp.text):
                    print(f'  Quota exhausted, trying next...'); continue
                print(f'  Unexpected {resp.status_code}, skipping')
            except Exception as e:
                print(f'  Exception: {e}, skipping')

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
                {'type': 'text', 'text': f'Product: {product_name}\nReturn reason: {return_reason}\n\n{GRADING_PROMPT}'},
                {'type': 'image_url', 'image_url': f'data:{mime};base64,{b64}'}
            ]
        }],
        'temperature': 0.2,
        'max_tokens': 500
    }

    for i, key in enumerate(MISTRAL_KEYS):
        print(f'  Trying Mistral key {i+1} of {len(MISTRAL_KEYS)}...')
        try:
            resp = requests.post(
                MISTRAL_URL,
                headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'},
                json=payload, timeout=60,
            )
            if resp.status_code == 200:
                text = resp.json()['choices'][0]['message']['content']
                parsed = parse_json(text)
                log_result(parsed, f'Mistral key {i+1}')
                return parsed
            if resp.status_code == 429:
                print(f'  Key {i+1} rate limited, trying next...'); continue
            if resp.status_code == 401:
                print(f'  Key {i+1} invalid, trying next...'); continue
            print(f'  Key {i+1} returned {resp.status_code}, trying next...')
        except Exception as e:
            print(f'  Key {i+1} threw exception: {e}, trying next...')

    print('  All Mistral attempts exhausted.')
    return None

# ── Public API ────────────────────────────────────────────────────────────────

def grade_product(image_paths: list[str], return_reason: str, product_name: str) -> dict:
    if DEMO_MODE:
        print('  [DEMO MODE] Set DEMO_MODE=false in .env to use real AI.')
        return {
            'condition_tier': 'Good',
            'confidence': 91,
            'damage_notes': 'Minor scuff on bottom edge, all functional components intact.',
            'suggested_resale_price': 1200
        }

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