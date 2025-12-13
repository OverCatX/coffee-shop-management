# Coffee Shop Management Database System

A comprehensive database management system for coffee shops built with FastAPI and PostgreSQL

## Features

- Database design with Normalization (3NF)
- SQL DDL with Constraints and Indexes
- Transaction Management
- Query Processing and Optimization
- Physical Storage & Index Structures
- RESTful API with FastAPI
- Database Migrations with Alembic

## Project Structure

```
backend/
├── app/
│   ├── api/           # API endpoints
│   ├── core/          # Core configuration
│   ├── models/        # SQLAlchemy models
│   ├── repositories/  # Repository pattern
│   ├── schemas/       # Pydantic schemas
│   └── main.py        # FastAPI application
├── alembic/           # Database migrations
├── database/          # SQL scripts
└── tests/             # Test files
```

## Setup

### Prerequisites

- Python 3.11 or 3.12 (Python 3.13 may have compatibility issues)
- PostgreSQL 12 or higher
- pip (Python package manager)

**Note**: If you're using Python 3.13, you may encounter compatibility issues. It's recommended to use Python 3.11 or 3.12.

### Step-by-Step Setup

1. **Navigate to the backend directory:**

```bash
cd backend
```

2. **Create a virtual environment (recommended):**

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**

```bash
pip install -r requirements.txt
```

4. **Create PostgreSQL database:**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE coffee_shop_db;

# Exit psql
\q
```

5. **Create `.env` file from `.env.example`:**

```bash
cp .env.example .env
```

6. **Update database credentials in `.env`:**

Edit the `.env` file and update the following values:

- `DB_USER`: Your PostgreSQL username (default: `postgres`)
- `DB_PASSWORD`: Your PostgreSQL password
- `DB_NAME`: Database name (default: `coffee_shop_db`)
- `DATABASE_URL`: Full connection string (format: `postgresql://user:password@localhost:5432/dbname`)

**Note**: The code will automatically convert `postgresql://` to `postgresql+psycopg://` to use psycopg (v3) driver.

Example `.env`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/coffee_shop_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=coffee_shop_db
```

7. **Run database migrations:**

```bash
alembic upgrade head
```

8. **(Optional) Load seed data:**

```bash
psql -U postgres -d coffee_shop_db -f database/seed_data.sql
```

9. **Run the application:**

```bash
uvicorn app.main:app --reload
```

The API will be available at:

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database Schema

The system includes the following tables:

- employees, managers, baristas
- customers
- ingredients, menu_items, inventory
- menu_item_ingredients, barista_menu_items
- orders, order_details
- payments

## API Documentation

Once the server is running, visit:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
