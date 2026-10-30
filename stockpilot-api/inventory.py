
from fastapi import APIRouter
from sqlalchemy import text
from database import engine

router = APIRouter()


@router.get("/inventory")
def get_inventory():
    query = text("""
        SELECT
            p.product_id,
            p.name AS product_name,
            p.sku AS product_sku,
            p.category,
            w.name AS warehouse_name,
            COALESCE(i.quantity_on_hand, 0) AS quantity_on_hand
        FROM products p
        LEFT JOIN inventory i
            ON p.product_id = i.product_id
        LEFT JOIN warehouses w
            ON i.warehouse_id = w.warehouse_id
        ORDER BY p.product_id;
    """)

    with engine.connect() as connection:
        result = connection.execute(query)
        return [dict(row) for row in result.mappings().all()]
