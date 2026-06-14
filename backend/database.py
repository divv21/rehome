import sqlite3
from datetime import datetime


def get_db():
    conn = sqlite3.connect('rehome.db')
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS returns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT,
            product_name TEXT,
            return_reason TEXT,
            category TEXT,
            customer_condition TEXT,
            notes TEXT,
            image_paths TEXT,
            ai_condition_tier TEXT,
            ai_confidence INTEGER,
            ai_damage_notes TEXT,
            routing_decision TEXT,
            routing_reason TEXT,
            suggested_resale_price INTEGER,
            original_mrp INTEGER DEFAULT 2000,
            warranty_status TEXT DEFAULT '6 months remaining',
            refurbishment_notes TEXT,
            status TEXT DEFAULT 'pending_grading',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    if conn.execute('SELECT COUNT(*) FROM returns').fetchone()[0] == 0:
        conn.execute('''
            INSERT INTO returns (
                order_id, product_name, return_reason, customer_condition,
                notes, image_paths, ai_condition_tier, ai_confidence,
                ai_damage_notes, routing_decision, routing_reason,
                suggested_resale_price, original_mrp, warranty_status, status
            ) VALUES (
                'ORD-0001', 'Sony WH-1000XM4 Headphones', 'No Longer Needed', 'Like New',
                'Used twice only', 'placeholder.jpg', 'Like New', 96,
                'No visible damage found. Product is in pristine condition.',
                'Resell on Amazon Rehome',
                'Net recovery exceeds liquidation floor. Listed regionally first.',
                1600, 2000, '10 months remaining', 'listed'
            )
        ''')
        conn.execute('''
            INSERT INTO returns (
                order_id, product_name, return_reason, customer_condition,
                notes, image_paths, ai_condition_tier, ai_confidence,
                ai_damage_notes, routing_decision, routing_reason,
                suggested_resale_price, original_mrp, warranty_status, status
            ) VALUES (
                'ORD-0002', 'Philips Air Fryer HD9200', 'Defective', 'Fair',
                'Minor crack on handle', 'placeholder.jpg', 'Acceptable', 82,
                'Minor crack on handle, functional', 'Refurbish Then Resell',
                'Post refurbishment recovery viable',
                900, 1800, '4 months remaining', 'graded'
            )
        ''')
        conn.execute('''
            INSERT INTO returns (
                order_id, product_name, return_reason, customer_condition,
                notes, image_paths, ai_condition_tier, ai_confidence,
                ai_damage_notes, routing_decision, routing_reason,
                suggested_resale_price, original_mrp, warranty_status, status
            ) VALUES (
                'ORD-0003', 'Wildcraft Backpack 45L', 'Wrong Item', 'Good',
                'Received wrong colour', 'placeholder.jpg', NULL, NULL,
                NULL, NULL, NULL,
                NULL, 1200, '12 months remaining', 'pending_grading'
            )
        ''')
        conn.commit()

    conn.close()


init_db()
