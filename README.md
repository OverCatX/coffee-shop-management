# Coffee Shop Management System

A full-stack coffee shop management system with a FastAPI backend and Next.js frontend, featuring comprehensive database design with normalization, constraints, indexes, and transaction management.

## 🚀 Features

### Backend (FastAPI)

- **Database Design**: Normalization (3NF), SQL DDL with Constraints and Indexes
- **Transaction Management**: ACID compliance with rollback mechanisms
- **Query Optimization**: Proper indexing strategy, eager loading, pagination
- **RESTful API**: Complete CRUD operations for all entities
- **Database Migrations**: Alembic for version control
- **Physical Storage**: Optimized data types and index structures

### Frontend (Next.js)

- Modern React-based UI
- TypeScript for type safety
- Server-side rendering capabilities

## 📁 Project Structure

```
coffee-shop-management/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core configuration
│   │   ├── models/         # SQLAlchemy models
│   │   ├── repositories/   # Repository pattern
│   │   ├── schemas/        # Pydantic schemas
│   │   └── main.py         # FastAPI application
│   ├── alembic/            # Database migrations
│   ├── database/           # SQL scripts
│   │   ├── schema.sql      # Database schema
│   │   ├── constraints.sql # Constraints
│   │   ├── indexes.sql     # Indexes
│   │   └── seed_data.sql   # Sample data
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # Backend documentation
│
└── frontend/               # Next.js frontend
    ├── src/
    │   └── app/            # Next.js app directory
    ├── package.json        # Node.js dependencies
    └── README.md           # Frontend documentation
```

## 🗄️ Database Schema

The system includes the following entities:

- **Employees**: `employees`, `managers`, `baristas`
- **Customers**: `customers`
- **Menu**: `menu_items`, `ingredients`, `menu_item_ingredients`
- **Inventory**: `inventory`
- **Orders**: `orders`, `order_details`
- **Payments**: `payments`
- **Relationships**: `barista_menu_items` (many-to-many)

## 🛠️ Prerequisites

### Backend

- Python 3.8 or higher
- PostgreSQL 12 or higher
- pip (Python package manager)

### Frontend

- Node.js 18 or higher
- npm or yarn

## 📦 Installation & Setup

### Backend Setup

1. **Navigate to backend directory:**

```bash
cd backend
```

2. **Create virtual environment:**

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
psql -U postgres
CREATE DATABASE coffee_shop_db;
\q
```

5. **Configure environment variables:**

```bash
cp .env.example .env
```

Edit `.env` file with your database credentials:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/coffee_shop_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=coffee_shop_db
```

6. **Run database migrations:**

```bash
alembic upgrade head
```

7. **(Optional) Load seed data:**

```bash
psql -U postgres -d coffee_shop_db -f database/seed_data.sql
```

8. **Start the backend server:**

```bash
uvicorn app.main:app --reload
```

Backend API will be available at:

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Frontend Setup

1. **Navigate to frontend directory:**

```bash
cd frontend
```

2. **Install dependencies:**

```bash
npm install
# or
yarn install
```

3. **Start the development server:**

```bash
npm run dev
# or
yarn dev
```

Frontend will be available at: http://localhost:3000

## 🚀 Quick Start (Both Services)

### Terminal 1 - Backend:

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

### Terminal 2 - Frontend:

```bash
cd frontend
npm run dev
```

## 📚 API Documentation

Once the backend is running, you can access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### API Endpoints

- `/api/v1/employees` - Employee management
- `/api/v1/customers` - Customer management
- `/api/v1/menu-items` - Menu item management
- `/api/v1/orders` - Order management
- `/api/v1/payments` - Payment processing
- `/api/v1/inventory` - Inventory management

## 🗃️ Database Design Principles

### Normalization

- **3NF Compliance**: All tables are normalized to Third Normal Form
- **Junction Tables**: Many-to-many relationships properly handled

### Constraints

- **Primary Keys**: All tables have primary keys
- **Foreign Keys**: Referential integrity with CASCADE rules
- **Check Constraints**: Data validation (price > 0, quantity >= 0, etc.)
- **Unique Constraints**: Email, phone number uniqueness

### Indexes

- **Primary Key Indexes**: Automatic
- **Foreign Key Indexes**: For join optimization
- **Composite Indexes**: For frequently queried columns
- **Date/Status Indexes**: For filtering and sorting

### Transactions

- **ACID Compliance**: All critical operations use transactions
- **Rollback Mechanisms**: Error handling with transaction rollback
- **Order Processing**: Atomic order creation with details and payment

### Query Optimization

- **Eager Loading**: Using `joinedload` and `selectinload`
- **Pagination**: All list endpoints support pagination
- **Indexed Queries**: Optimized for common query patterns

## 📝 Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/coffee_shop_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=coffee_shop_db
APP_NAME=Coffee Shop Management API
APP_VERSION=1.0.0
DEBUG=True
LOG_LEVEL=INFO
HOST=0.0.0.0
PORT=8000
```

## 🔧 Development

### Database Migrations

Create a new migration:

```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:

```bash
alembic upgrade head
```

Rollback migration:

```bash
alembic downgrade -1
```

### Code Formatting

Backend (using black):

```bash
cd backend
black app/
```

## 📄 License

## This project is for educational purposes.

**Note**: Make sure PostgreSQL is running before starting the backend server.
