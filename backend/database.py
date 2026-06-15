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
    conn.close()
init_db()
