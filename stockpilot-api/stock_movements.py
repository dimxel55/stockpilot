
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal
from sqlalchemy import text
from database import engine

router = APIRouter()


class StockMovementCreate(BaseModel):
    product_id: int
    warehouse_id: int
    quantity_change: int
    movement_type: Literal["receipt", "shipment", "correction"]
    reason: str | None = None


@router.post("/stock-movements", status_code=201)
def create_stock_movement(movement: StockMovementCreate):

    if movement.quantity_change == 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity change cannot be zero."
        )

    try:
        with engine.begin() as connection:

            # Check that the product and warehouse exist
            product = connection.execute(
                text("""
                    SELECT product_id
                    FROM products
                    WHERE product_id = :product_id
                """),
                {"product_id": movement.product_id}
            ).first()

            warehouse = connection.execute(
                text("""
                    SELECT warehouse_id
                    FROM warehouses
                    WHERE warehouse_id = :warehouse_id
                      AND is_active = TRUE
                """),
                {"warehouse_id": movement.warehouse_id}
            ).first()

            if not product:
                raise HTTPException(status_code=404, detail="Product not found.")

            if not warehouse:
                raise HTTPException(status_code=404, detail="Active warehouse not found.")

            # Create an inventory record if one does not exist
            connection.execute(
                text("""
                    INSERT INTO inventory (
                        product_id, warehouse_id, quantity_on_hand
                    )
                    VALUES (
                        :product_id, :warehouse_id, 0
                    )
                    ON CONFLICT (product_id, warehouse_id) DO NOTHING
                """),
                {
                    "product_id": movement.product_id,
                    "warehouse_id": movement.warehouse_id,
                }
            )

            # Update inventory only if the result will not be negative
            inventory = connection.execute(
                text("""
                    UPDATE inventory
                    SET quantity_on_hand = quantity_on_hand + :quantity_change
                    WHERE product_id = :product_id
                      AND warehouse_id = :warehouse_id
                      AND quantity_on_hand + :quantity_change >= 0
                    RETURNING quantity_on_hand
                """),
                {
                    "product_id": movement.product_id,
                    "warehouse_id": movement.warehouse_id,
                    "quantity_change": movement.quantity_change,
                }
            ).first()

            if not inventory:
                raise HTTPException(
                    status_code=400,
                    detail="Insufficient stock for this movement."
                )

            # Save the movement history
            result = connection.execute(
                text("""
                    INSERT INTO stock_movements (
                        product_id,
                        warehouse_id,
                        quantity_change,
                        movement_type,
                        reason
                    )
                    VALUES (
                        :product_id,
                        :warehouse_id,
                        :quantity_change,
                        :movement_type,
                        :reason
                    )
                    RETURNING *
                """),
                {
                    "product_id": movement.product_id,
                    "warehouse_id": movement.warehouse_id,
                    "quantity_change": movement.quantity_change,
                    "movement_type": movement.movement_type,
                    "reason": movement.reason,
                }
            )

            return dict(result.mappings().one())

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/stock-movements")
def get_stock_movements():

    query = text("""
        SELECT
            sm.stock_movement_id,
            sm.product_id,
            p.name AS product_name,
            p.sku AS product_sku,
            sm.warehouse_id,
            w.name AS warehouse_name,
            sm.quantity_change,
            sm.movement_type,
            sm.reason,
            sm.created_at
        FROM stock_movements sm
        JOIN products p
            ON sm.product_id = p.product_id
        JOIN warehouses w
            ON sm.warehouse_id = w.warehouse_id
        ORDER BY sm.created_at DESC
    """)

    with engine.connect() as connection:
        result = connection.execute(query).mappings().all()

    return [dict(row) for row in result]

