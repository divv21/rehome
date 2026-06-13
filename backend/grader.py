import os, json, re, base64
from dotenv import load_dotenv

load_dotenv()

DEMO_MODE = os.getenv('DEMO_MODE', 'true').lower() == 'true'


def grade_product(image_paths: list[str], return_reason: str, product_name: str) -> dict:
    if DEMO_MODE:
        return {
            'condition_tier': 'Good',
            'confidence': 91,
            'damage_notes': 'Minor scuff on bottom edge, all functional components intact.',
            'suggested_resale_price': 1200,
        }

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

        prompt = f'''You are a product condition grading assistant for Amazon Rehome, Amazon's intelligent returns resale platform.

Product: {product_name}
Customer return reason: {return_reason}

Analyze the product images carefully and respond with ONLY a JSON object, no other text, no markdown, no backticks:
{{
  "condition_tier": "one of: Like New / Good / Acceptable / Liquidate",
  "confidence": integer between 0 and 100,
  "damage_notes": "one clear sentence describing condition",
  "suggested_resale_price": integer in INR based on condition
}}'''

        contents = []

        image_added = False
        for path in image_paths:
            full_path = path if os.path.exists(path) else f'uploads/{os.path.basename(path)}'
            print(f'Checking image path: {full_path}, exists: {os.path.exists(full_path)}')
            if os.path.exists(full_path) and 'placeholder' not in full_path:
                with open(full_path, 'rb') as f:
                    raw_bytes = f.read()
                contents.append(
                    types.Part.from_bytes(
                        data=raw_bytes,
                        mime_type='image/jpeg',
                    )
                )
                image_added = True

        contents.append(types.Part.from_text(text=prompt))

        print(f'Sending to Gemini: {len(contents)} parts, image_added: {image_added}')

        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=contents,
        )

        print(f'Gemini raw response: {response.text}')

        text = re.sub(r'```json|```', '', response.text).strip()
        return json.loads(text)

    except Exception as e:
        print(f'GRADING ERROR: {str(e)}')
        return {
            'condition_tier': 'Good',
            'confidence': 85,
            'damage_notes': f'Grading error: {str(e)}',
            'suggested_resale_price': 1000,
        }
