# StockPilot – Warehouse & Inventory Management System

StockPilot is a mini ERP-style warehouse and inventory management application designed for a fashion business.

The system helps manage product records, monitor warehouse stock levels, record stock movements, and track inventory activity through a centralized dashboard.

The project focuses on backend development, relational database management, REST API development, and frontend-backend integration.

**GitHub Repository:** [StockPilot](https://github.com/dimxel55/stockpilot)

## Features

- **Dashboard:** Overview of products, total stock, low-stock alerts, out-of-stock items, and recent stock movements.
- **Product Management:** Create and retrieve product records.
- **Inventory Management:** View current stock quantities and warehouse inventory.
- **Stock Movements:** Record stock receipts, shipments, and corrections.
- **Database Integration:** Store and retrieve business data using PostgreSQL.
- **REST API:** Connect the React frontend to the backend through FastAPI endpoints.

## Tech Stack

**Frontend**
- React
- JavaScript
- Vite
- CSS

**Backend**
- Python
- FastAPI
- SQLAlchemy

**Database**
- PostgreSQL

**Development Tools**
- Visual Studio Code
- pgAdmin
- Git & GitHub

## Project Structure

```text
StockPilot/
│
├── stockpilot-api/
│   ├── main.py
│   ├── database.py
│   ├── products.py
│   ├── inventory.py
│   ├── stock_movements.py
│   └── .env.example
│
├── stockpilot-ui/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

## Database Design

The application uses a relational PostgreSQL database.

Main database tables include:

- `products` – Stores product information.
- `warehouses` – Stores warehouse information.
- `inventory` – Tracks quantities of products in warehouses.
- `stock_movements` – Records inventory changes over time.

Relationships between tables allow inventory quantities and stock movement records to be associated with products and warehouses.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | Retrieve products |
| POST | `/products` | Create a product |
| GET | `/inventory` | Retrieve warehouse inventory |
| GET | `/stock-movements` | Retrieve stock movement history |
| POST | `/stock-movements` | Record a stock movement |
| GET | `/health` | Check API status |
| GET | `/db-test` | Test database connection |

Interactive API documentation is available through Swagger UI at `/docs`.

## Installation & Setup

### Prerequisites

- Python
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/dimxel55/stockpilot.git
cd stockpilot
```

### 2. Backend Setup

```bash
cd stockpilot-api

python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
python -m pip install fastapi "uvicorn[standard]" sqlalchemy "psycopg[binary]" python-dotenv
```

Create a PostgreSQL database named `StockUp` and configure the required tables.

Create a `.env` file inside `stockpilot-api` with your own database credentials:

```env
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=StockUp
```

Start the backend:

```bash
python -m uvicorn main:app --reload
```

Backend address:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

### 3. Frontend Setup

Open a second terminal:

```bash
cd stockpilot-ui
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Key Technical Concepts Demonstrated

- RESTful API development
- CRUD operations
- Relational database design
- SQL queries and table joins
- SQLAlchemy database connectivity
- Inventory tracking
- Transaction-based stock updates
- React hooks and state management
- Frontend-backend communication

## Project Status

StockPilot is a portfolio project focused on warehouse and inventory management.

The core functionality for product management, inventory tracking, stock movements, and dashboard reporting has been implemented.

Additional modules, including Suppliers, Purchase Orders, and Sales Orders, are not currently implemented in the application. Their corresponding database tables have been created, leaving room for future development.

The main objective of the project is to demonstrate backend development, database design, SQL relationships, and inventory management logic.

## Author

Developed as a personal software development portfolio project.