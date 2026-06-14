from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import init_db, get_db
from grader import grade_product
from router import decide_route
import uvicorn, os, uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=False,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.mount('/uploads', StaticFiles(directory='uploads'), name='uploads')

init_db()


@app.get('/health')
def health():
    return {'status': 'Amazon Rehome API running'}


@app.post('/api/returns')
async def submit_return(
    product_name: str = Form(...),
    return_reason: str = Form(...),
    customer_condition: str = Form(...),
    category: str = Form('Other'),
    notes: str = Form(''),
    images: list[UploadFile] = File([]),
):
    order_id = f'ORD-{str(uuid.uuid4())[:4].upper()}'

    image_filenames = []
    for image in images:
        filename = f'{uuid.uuid4()}_{image.filename}'
        filepath = f'uploads/{filename}'
        with open(filepath, 'wb') as f:
            f.write(await image.read())
        image_filenames.append(filename)

    image_paths = ','.join(image_filenames) if image_filenames else 'placeholder.jpg'

    conn = get_db()
    cursor = conn.execute(
        '''
        INSERT INTO returns
            (order_id, product_name, return_reason, category, customer_condition, notes, image_paths, status)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, 'pending_grading')
        ''',
        (order_id, product_name, return_reason, category, customer_condition, notes, image_paths),
    )
    conn.commit()
    return_id = cursor.lastrowid
    conn.close()

    return {'id': return_id, 'order_id': order_id}


@app.get('/api/returns')
def get_returns():
    conn = get_db()
    rows = conn.execute('SELECT * FROM returns ORDER BY created_at DESC').fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.get('/api/returns/{id}')
def get_return(id: int):
    conn = get_db()
    row = conn.execute('SELECT * FROM returns WHERE id = ?', (id,)).fetchone()
    conn.close()
    if not row:
        return {'error': 'Not found'}
    return dict(row)


@app.post('/api/grade/{id}')
def grade_return(id: int):
    conn = get_db()
    row = conn.execute('SELECT * FROM returns WHERE id = ?', (id,)).fetchone()
    if not row:
        conn.close()
        return {'error': 'Return not found'}

    record = dict(row)
    image_paths = [f'uploads/{p}' for p in record['image_paths'].split(',')]

    grade = grade_product(image_paths, record['return_reason'], record['product_name'])
    route = decide_route(
        grade['condition_tier'],
        grade['confidence'],
        grade['suggested_resale_price'],
        grade.get('refurbishment_needed', False),
        grade.get('functional_testing_required', False),
        grade.get('functional_testing_notes'),
        record['category']
    )

    conn.execute('''
        UPDATE returns SET
            ai_condition_tier = ?,
            ai_confidence = ?,
            ai_damage_notes = ?,
            suggested_resale_price = ?,
            routing_decision = ?,
            routing_reason = ?,
            refurbishment_notes = ?,
            status = 'graded'
        WHERE id = ?
    ''', (
        grade['condition_tier'],
        grade['confidence'],
        grade['damage_notes'],
        grade['suggested_resale_price'],
        route['routing_decision'],
        route['routing_reason'],
        grade.get('refurbishment_notes') or grade.get('functional_testing_notes'),
        id
    ))
    conn.commit()
    conn.close()

    return {**grade, **route, 'status': 'graded'}


@app.get('/api/marketplace')
def get_marketplace():
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM returns WHERE status = 'listed' ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.get('/api/health/{id}')
def get_health_card(id: int):
    conn = get_db()
    row = conn.execute('SELECT * FROM returns WHERE id = ?', (id,)).fetchone()
    conn.close()
    if not row:
        return {'error': 'Not found'}

    record = dict(row)
    original_mrp = record['original_mrp'] or 2000
    resale_price = record['suggested_resale_price'] or 0
    price_deduction = round(((original_mrp - resale_price) / original_mrp) * 100) if resale_price else 0

    star_map = {
        'Like New': 5,
        'Good': 4,
        'Acceptable': 3,
        'Liquidate': 1,
    }
    star_rating = star_map.get(record['ai_condition_tier'], 0)

    return {
        **record,
        'price_deduction_percentage': price_deduction,
        'star_rating': star_rating,
        'lifecycle': [
            {'event': 'Original Sale',          'date': 'March 2026'},
            {'event': 'Returned to Warehouse',  'date': 'June 2026'},
            {'event': 'AI Graded',              'date': 'June 2026'},
            {'event': 'Listed on Amazon Rehome','date': 'June 2026'},
        ],
    }


@app.get('/api/health/customer/{id}')
def get_customer_health_card(id: int):
    conn = get_db()
    row = conn.execute('SELECT * FROM returns WHERE id = ?', (id,)).fetchone()
    conn.close()
    if not row:
        return {'error': 'Not found'}

    record = dict(row)

    # Customer cannot see liquidated products
    if record.get('routing_decision') and 'liquidat' in record['routing_decision'].lower():
        return {'error': 'This product is not available for viewing'}

    if record.get('ai_condition_tier') == 'Liquidate':
        return {'error': 'This product is not available for viewing'}

    original_mrp = record['original_mrp'] or 2000
    resale_price = record['suggested_resale_price'] or 0
    price_deduction = round(((original_mrp - resale_price) / original_mrp) * 100) if resale_price else 0

    star_map = {
        'Like New': 5,
        'Good': 4,
        'Acceptable': 3,
    }
    star_rating = star_map.get(record['ai_condition_tier'], 0)

    # Remove sensitive warehouse fields
    safe_record = {k: v for k, v in record.items() if k not in [
        'routing_reason', 'refurbishment_notes',
    ]}

    return {
        **safe_record,
        'price_deduction_percentage': price_deduction,
        'star_rating': star_rating,
        'lifecycle': [
            {'event': 'Original Sale',          'date': 'March 2026'},
            {'event': 'Returned to Warehouse',  'date': 'June 2026'},
            {'event': 'AI Graded',              'date': 'June 2026'},
            {'event': 'Listed on Amazon Rehome','date': 'June 2026'},
        ],
    }


@app.post('/api/approve/{id}')
def approve_listing(id: int):
    conn = get_db()
    conn.execute("UPDATE returns SET status = 'listed' WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return {'status': 'listed'}


@app.post('/api/update-condition/{id}')
def update_condition(id: int, condition: str = Form(...), notes: str = Form('')):
    conn = get_db()
    conn.execute(
        '''
        UPDATE returns
        SET ai_condition_tier = ?,
            ai_damage_notes = ?,
            status = 'graded',
            routing_decision = 'Resell on Amazon Rehome',
            routing_reason = 'Manually verified via functional testing'
        WHERE id = ?
        ''',
        (condition, notes, id),
    )
    conn.commit()
    conn.close()
    return {'status': 'graded', 'condition': condition, 'notes': notes}

@app.post('/api/update-condition/{id}')
def update_condition_after_testing(id: int, payload: dict):
    new_condition = payload.get('condition_tier')
    testing_notes = payload.get('testing_notes')
    
    conn = get_db()
    record = dict(conn.execute('SELECT * FROM returns WHERE id = ?', (id,)).fetchone())
    
    from router import decide_route
    route = decide_route(
        new_condition,
        95,
        record['suggested_resale_price'] or 1000,
        new_condition == 'Acceptable',
        False,
        None,
        record['category']
    )
    
    conn.execute('''
        UPDATE returns SET
            ai_condition_tier = ?,
            routing_decision = ?,
            routing_reason = ?,
            refurbishment_notes = ?,
            status = 'graded'
        WHERE id = ?
    ''', (
        new_condition,
        route['routing_decision'],
        route['routing_reason'],
        testing_notes,
        id
    ))
    conn.commit()
    conn.close()
    return {'status': 'updated', **route}


if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)
