
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from database import engine
from products import router as products_router
from stock_movements import router as stock_movements_router
from inventory import router as inventory_router

app = FastAPI(
    title="StockPilot API",
    description="Backend API for StockPilot Warehouse Management",
    version="1.0.0",
)
app.include_router(products_router)
app.include_router(stock_movements_router)
app.include_router(inventory_router)

# Allow our React frontend to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to StockPilot API!",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }

@app.get("/db-test")
def test_database():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version()"))
            version = result.scalar()

        return {
            "status": "connected",
            "database": "StockUp",
            "postgresql_version": version,
        }

    except Exception as error:
        return {
            "status": "error",
            "message": str(error),
        }