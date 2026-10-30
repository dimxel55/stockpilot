
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import text

from database import engine

router = APIRouter()


class ProductCreate(BaseModel):
    sku: str
    name: str
    category: str | None = None
    description: str | None = None


@router.get("/products")
def get_products():
    query = text("""
        SELECT
            p.product_id,
            p.sku AS product_sku,
            p.name,
            p.category,
            p.description,
            p.is_active,

            pv.variant_id,
            pv.sku AS variant_sku,
            pv.size,
            pv.color,

            COALESCE(inv.total_stock, 0) AS stock

        FROM products p

        LEFT JOIN product_variants pv
            ON p.product_id = pv.product_id

        LEFT JOIN (
            SELECT
                variant_id,
                SUM(quantity_on_hand) AS total_stock
            FROM variant_inventory
            GROUP BY variant_id
        ) inv
            ON pv.variant_id = inv.variant_id

        ORDER BY p.product_id, pv.variant_id
    """)

    with engine.connect() as connection:
        rows = connection.execute(query).mappings().all()

    products = {}

    for row in rows:
        product_id = row["product_id"]

        if product_id not in products:
            products[product_id] = {
                "product_id": product_id,
                "sku": row["product_sku"],
                "name": row["name"],
                "category": row["category"],
                "description": row["description"],
                "is_active": row["is_active"],
                "stock": 0,
                "variants": [],
            }

        if row["variant_id"] is not None:
            variant = {
                "variant_id": row["variant_id"],
                "sku": row["variant_sku"],
                "size": row["size"],
                "color": row["color"],
                "stock": row["stock"],
            }

            products[product_id]["variants"].append(variant)
            products[product_id]["stock"] += row["stock"]

    return list(products.values())


@router.post("/products", status_code=201)
def create_product(product: ProductCreate):
    query = text("""
        INSERT INTO products (
            sku,
            name,
            category,
            description
        )
        VALUES (
            :sku,
            :name,
            :category,
            :description
        )
        RETURNING
            product_id,
            sku,
            name,
            category,
            description,
            is_active,
            created_at
    """)

    try:
        with engine.begin() as connection:
            result = connection.execute(
                query,
                {
                    "sku": product.sku.strip().upper(),
                    "name": product.name.strip(),
                    "category": product.category,
                    "description": product.description,
                },
            )

            new_product = dict(result.mappings().one())

        return new_product

    except Exception as error:
        if "unique" in str(error).lower():
            raise HTTPException(
                status_code=409,
                detail="A product with this SKU already exists.",
            )

        raise
