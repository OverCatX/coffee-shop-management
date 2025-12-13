# Coffee Shop Management System

> **A comprehensive database project** demonstrating advanced database management techniques with complete documentation.

A full-stack coffee shop management system built with **FastAPI** (backend) and **Next.js** (frontend), featuring extensive database documentation covering **Normalization (3NF)**, **SQL-DDL**, **Constraints**, **Indexes**, **Transactions**, **Query Processing and Optimization**, and **Physical Storage & Index Structures**.

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11 or 3.12** (Python 3.13 may have compatibility issues)
- **PostgreSQL 12+**
- **Node.js 18+**
- **npm or yarn**

### Installation

**Backend:**

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
createdb coffee_shop_db

# Create .env file (see Configuration below)
cat > .env << EOF
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/coffee_shop_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=coffee_shop_db
SECRET_KEY=your-secret-key-change-in-production
CORS_ORIGINS=http://localhost:3000
CORS_ALLOW_CREDENTIALS=true
CORS_ALLOW_METHODS=*
CORS_ALLOW_HEADERS=*
EOF

alembic upgrade head
python scripts/seed_mock_data.py
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
npm run dev
```

**Access:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

**Demo Credentials:**

- Manager: `john.smith@coffeeshop.com` / `password123`
- Barista: `sarah.j@coffeeshop.com` / `password123`
- Cashier: `emma.w@coffeeshop.com` / `password123`

> 📚 **For detailed installation guide, see [docs/setup.md](docs/setup.md)**

---

## 📚 Database Documentation

This project implements advanced database techniques. See what techniques are used, how they're implemented, and where they're located in the code:

### 🗄️ Database Techniques & Implementation

| Technique               | What It Does                       | Where It's Used                                         | Code Example                                                  |
| ----------------------- | ---------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------- |
| **Schema (SQL DDL)**    | Defines database structure         | `backend/app/models/`, `backend/database/01_schema.sql` | `models/order.py`: `Column(Integer, primary_key=True)`        |
| **Normalization (3NF)** | Eliminates data redundancy         | Table design in `backend/app/models/`                   | `models/employee.py`: Separate `managers`, `baristas` tables  |
| **Constraints**         | Enforces data integrity            | `backend/database/02_constraints.sql`                   | `02_constraints.sql`: `CHECK (price > 0)`                     |
| **Indexes**             | Improves query performance         | `backend/database/03_indexes.sql`                       | `03_indexes.sql`: `CREATE INDEX ix_orders_status`             |
| **Transactions**        | Ensures ACID properties            | `backend/app/repositories/order_repository.py`          | `order_repository.py`: `db.commit()` / `db.rollback()`        |
| **Query Optimization**  | Reduces queries with eager loading | `backend/app/repositories/*.py`                         | `order_repository.py`: `.options(joinedload(Order.customer))` |
| **Migrations**          | Manages schema versioning          | `backend/alembic/versions/`                             | `alembic/versions/`: Migration files                          |

**📖 Complete documentation with code examples:** [Database Documentation](docs/README.md)

### 📖 Additional Documentation

- **[📖 Documentation Index](docs/README.md)** - Complete documentation navigation
- **[🔧 Setup Guide](docs/setup.md)** - Installation and configuration
- **[🔌 API Documentation](docs/api.md)** - Complete RESTful API reference
- **[💻 Development Guide](docs/development.md)** - Backend and frontend development
- **[🚀 Deployment](docs/deployment/production.md)** - Production deployment guide
- **[🔍 Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions

---

## 🎯 Database Techniques Usage Examples

### Transactions

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

### Query Optimization

**File:** `backend/app/repositories/order_repository.py`

```python
def get(self, order_id: int):
    return self.db.query(Order).options(
        joinedload(Order.customer),  # Prevents N+1 queries
        selectinload(Order.order_details)
    ).first()
```

### Constraints

**File:** `backend/database/02_constraints.sql`

```sql
ALTER TABLE menu_items
    ADD CONSTRAINT check_price_positive CHECK (price > 0);
```

### Indexes

**File:** `backend/database/03_indexes.sql`

```sql
CREATE INDEX idx_menu_item_category_available
    ON menu_items(category, is_available);
```

**📖 See [docs/README.md](docs/README.md) for complete implementation details with all code examples.**

---

## 🛠️ Technology Stack

**Backend:**

- FastAPI, SQLAlchemy, PostgreSQL 12+, Alembic
- JWT authentication with role-based access control

**Frontend:**

- Next.js 16 (App Router), TypeScript, Tailwind CSS
- SWR, Axios

**Database Features:**

- Normalized schema (3NF)
- Comprehensive constraints (PK, FK, CHECK, UNIQUE)
- Strategic indexes for performance
- Transaction management with ACID properties
- Query optimization techniques

---

## 📦 Project Structure

```
coffee-shop-management/
├── backend/              # FastAPI Backend
│   ├── app/              # Application code (API, models, repositories)
│   ├── alembic/          # Database migrations
│   └── scripts/          # Utility scripts
├── frontend/             # Next.js Frontend
│   └── src/              # Source code
└── docs/                 # 📚 Comprehensive Documentation
    ├── database/         # 🗄️ Database documentation (CORE - 6 files)
    ├── setup.md          # Installation & configuration
    ├── api.md            # API documentation
    ├── development.md    # Development guides
    ├── deployment/       # Deployment guides
    └── troubleshooting.md # Common issues
```

---

## 📖 Quick Links

### Essential Documentation

- **[📖 Documentation Index](docs/README.md)** - Start here for complete navigation
- **[🗄️ Database Schema](docs/database/schema.md)** - ERD and table structures
- **[🔧 Installation Guide](docs/setup.md)** - Detailed setup instructions
- **[🔌 API Reference](docs/api.md)** - Complete API documentation

### Database Implementation Details

- **[🔷 Normalization](docs/database/normalization.md)** - How 3NF is implemented in table design
- **[🔒 Constraints & Indexes](docs/database/constraints-indexes.md)** - Where constraints and indexes are defined
- **[🔄 Migrations](docs/database/migrations.md)** - How schema changes are managed
- **[⚡ Transactions](docs/database/transactions.md)** - Transaction usage in order creation
- **[🚀 Query Optimization](docs/database/query-optimization.md)** - Eager loading and query optimization techniques

---

## 📄 License

This project is for educational purposes.
