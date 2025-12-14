# Coffee Shop Management System

Coffee Shop Management System (POS) is a comprehensive Point of Sale and management system designed for coffee shops. It provides a complete solution for managing orders, inventory, menu items, employees, customers, and business operations.

## 1. Project Overview & Features

### Key Features

- **Point of Sale (POS)**: Create and manage orders with real-time inventory checking
- **Order Management**: Track orders from creation to completion with status tracking
- **Inventory Management**: Monitor ingredient stock levels with low stock alerts
- **Menu Management**: Manage menu items, recipes, and pricing
- **Customer Management**: Track customer information and loyalty points
- **Employee Management**: Role-based access control for different employee types
- **Stock Availability**: Real-time checking of ingredient availability for menu items and orders
- **Loyalty Points System**: Customer loyalty program with points redemption
- **Dashboard & Analytics**: Manager dashboard with revenue statistics and order analytics

### User Roles

**👔 Manager** - Full system access, dashboard, manage employees/menu/inventory, view all orders and reports

**☕ Barista** - View and manage pending orders, mark orders as completed, view recipes, check stock availability

**💰 Cashier** - Create orders (POS), process payments, manage customers, redeem loyalty points

### Project Scope

This project demonstrates advanced **database design and management techniques**: Normalized schema (3NF), transactions (ACID), constraints (PK, FK, CHECK, UNIQUE), query optimization (eager loading, indexing), migrations (Alembic), and physical storage optimization.

---

## 2. Tech Stack

**Backend:** FastAPI, SQLAlchemy, PostgreSQL, Alembic, JWT Authentication

**Frontend:** Next.js 16, TypeScript, Tailwind CSS, SWR, Axios

**Database:** PostgreSQL with 3NF normalization, constraints, indexes, transactions, and query optimization

---

## 3. Quick Start

### Prerequisites

- **Python 3.11 or 3.12** (Python 3.13 may have compatibility issues)
- **PostgreSQL 12+**
- **Node.js 18+**
- **npm or yarn**

### Installation Steps

1. **Clone the repository** (if applicable)

2. **Backend Setup:**

   ```bash
   cd backend
   python3 -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   createdb coffee_shop_db
   ```

3. **Configure Environment:**
   Create `.env` file in `backend/` with database credentials and settings (see [Setup Guide](docs/setup.md) for details)

4. **Database Setup:**

   ```bash
   alembic upgrade head
   python scripts/seed_mock_data.py
   ```

5. **Start Backend:**

   ```bash
   uvicorn app.main:app --reload
   ```

6. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
   npm run dev
   ```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Demo Credentials

After seeding mock data:

- **Manager**: `john.smith@coffeeshop.com` / `password123`
- **Barista**: `sarah.j@coffeeshop.com` / `password123`
- **Cashier**: `emma.w@coffeeshop.com` / `password123`

> 📚 **For complete installation instructions and detailed configuration, see [Setup Guide](docs/setup.md)**

---

## 4. Project Structure

```
coffee-shop-management/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── models/            # SQLAlchemy ORM models (database entities)
│   │   ├── repositories/      # Repository pattern (data access layer)
│   │   ├── schemas/           # Pydantic schemas (API validation)
│   │   ├── api/               # API endpoints
│   │   ├── core/              # Core configuration (database, security, transactions)
│   │   └── main.py            # FastAPI application entry
│   ├── alembic/               # 🗄️ Database migrations (Alembic)
│   ├── database/              # 🗄️ SQL scripts (schema, constraints, indexes, seed data)
│   │   ├── 01_schema.sql     # Table definitions
│   │   ├── 02_constraints.sql # Constraints and validation rules
│   │   ├── 03_indexes.sql    # Performance indexes
│   │   ├── 04_seed_data.sql  # Sample seed data
│   │   ├── 05_add_password_hash.sql # Password hash migration
│   │   └── 06_seed_mock_data.sql # Mock data for development
│   └── scripts/               # Utility scripts
│
├── frontend/                  # Next.js Frontend
│   └── src/                   # Next.js App Router pages
│
└── docs/                      # 📚 Documentation
    ├── database/              # 🗄️ Database documentation (schema, normalization, constraints, migrations, transactions, optimization)
    ├── setup.md               # Installation guide
    └── api.md                 # API documentation
```

---

## 5. System Architecture

The system follows a three-tier architecture: Frontend (Next.js), Backend (FastAPI), and Database (PostgreSQL).

**Key Features:**

- RESTful API with JWT authentication
- Repository pattern for data access
- ORM-based database operations
- Real-time data updates with SWR

> 📚 **For complete architecture documentation including request flow, component design, and data flow examples, see [System Architecture](docs/architecture.md)**

---

## 6. Database Design & Techniques

This project demonstrates advanced database management techniques. All database-related documentation is available in the [`docs/database/`](docs/database/) directory.

### Database Techniques Implemented

| Technique               | Description                                                       | Documentation                                                 |
| ----------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------- |
| **Schema (SQL DDL)**    | Complete database structure with 9 core tables                    | [Schema Documentation](docs/database/schema.md)               |
| **Normalization (3NF)** | Third Normal Form eliminates data redundancy                      | [Normalization Guide](docs/database/normalization.md)         |
| **Constraints**         | Primary keys, foreign keys, check constraints, unique constraints | [Constraints & Indexes](docs/database/constraints-indexes.md) |
| **Indexes**             | Strategic indexing for query performance                          | [Constraints & Indexes](docs/database/constraints-indexes.md) |
| **Transactions**        | ACID properties for data consistency                              | [Transactions Guide](docs/database/transactions.md)           |
| **Query Optimization**  | Eager loading, N+1 prevention, query performance                  | [Query Optimization](docs/database/query-optimization.md)     |
| **Migrations**          | Schema versioning with Alembic                                    | [Migrations Guide](docs/database/migrations.md)               |

### Quick Examples

#### Transactions

**File:** `backend/app/repositories/order_repository.py`

```python
def create(self, order_data: OrderCreate):
    try:
        order = Order(...)
        self.db.add(order)
        self.db.flush()
        # Create order details and payment
        self.db.commit()  # All or nothing
    except Exception:
        self.db.rollback()  # Rollback on error
```

#### Query Optimization

**File:** `backend/app/repositories/order_repository.py`

```python
def get(self, order_id: int):
    return self.db.query(Order).options(
        joinedload(Order.customer),  # Prevents N+1 queries
        selectinload(Order.order_details)
    ).first()
```

#### Constraints

**File:** `backend/database/02_constraints.sql`

```sql
ALTER TABLE menu_items
    ADD CONSTRAINT check_price_positive CHECK (price > 0);
```

#### Indexes

**File:** `backend/database/03_indexes.sql`

```sql
CREATE INDEX idx_menu_item_category_available
    ON menu_items(category, is_available);
```

### Database SQL Scripts

The `backend/database/` directory contains SQL scripts for manual database setup (alternative to Alembic migrations):

| File                       | Description                                                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `01_schema.sql`            | Complete DDL for creating all tables (employees, customers, menu_items, ingredients, menu_item_ingredients, inventory, orders, order_details, payments) |
| `02_constraints.sql`       | Check constraints, foreign key constraints, and data validation rules                                                                                   |
| `03_indexes.sql`           | Performance indexes for query optimization                                                                                                              |
| `04_seed_data.sql`         | Sample seed data for initial testing                                                                                                                    |
| `05_add_password_hash.sql` | Migration script to add password_hash column to employees table                                                                                         |
| `06_seed_mock_data.sql`    | Mock data matching frontend dev-mocks (includes hashed passwords)                                                                                       |

**Note:** These SQL scripts are provided for reference and manual setup. The recommended approach is to use Alembic migrations (`alembic upgrade head`) which automatically manages schema changes and versioning.

### Database Documentation Links

- **[Database Documentation Index](docs/database/)** - Complete database documentation
- **[Schema & ERD](docs/database/schema.md)** - Entity-Relationship Diagram and table structures
- **[Normalization (3NF)](docs/database/normalization.md)** - How normalization is implemented
- **[Constraints & Indexes](docs/database/constraints-indexes.md)** - All constraints and indexes
- **[Transactions](docs/database/transactions.md)** - Transaction management and ACID properties
- **[Query Optimization](docs/database/query-optimization.md)** - Query processing and optimization techniques
- **[Migrations](docs/database/migrations.md)** - Database schema versioning

---

## 7. API Documentation

RESTful API with JWT authentication. Base URL: `http://localhost:8000/api/v1`

**Interactive API Documentation** (when server is running):

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

> 📚 **For complete API documentation including all endpoints, authentication, request/response schemas, and examples, see [API Documentation](docs/api.md)**

---

## 📚 Additional Documentation

- **[🔧 Setup Guide](docs/setup.md)** - Complete installation and configuration guide
- **[📖 Documentation Index](docs/README.md)** - Complete documentation navigation

---

## 📄 License

This project is for educational purposes.
