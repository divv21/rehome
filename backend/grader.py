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

        parts = []
        for path in image_paths:
            if os.path.exists(path) and 'placeholder' not in path:
                with open(path, 'rb') as f:
                    image_data = base64.b64encode(f.read()).decode()
                parts.append(
                    types.Part.from_bytes(
                        data=base64.b64decode(image_data),
                        mime_type='image/jpeg',
                    )
                )

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

        parts.append(prompt)
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=parts,
        )
        text = re.sub(r'```json|```', '', response.text).strip()
        return json.loads(text)

    except Exception as e:
        return {
            'condition_tier': 'Good',
            'confidence': 85,
            'damage_notes': 'AI grading unavailable, manual review recommended.',
            'suggested_resale_price': 1000,
        }
