# Coffee Shop Management System - Documentation

> **Database project** demonstrating advanced database management techniques with complete implementation documentation.

---

## 🗄️ Database Techniques & Implementation

This project implements advanced database techniques. Below is what techniques are used, how they're implemented, and where they're located:

### 📋 Database Schema

**Technique:** SQL DDL, Entity-Relationship Design

**What:** Complete database schema with 12 tables, relationships, and data types

**How:** Defined in SQLAlchemy ORM models and SQL DDL scripts

**Where:**

- **Models:** `backend/app/models/` - SQLAlchemy ORM models
- **SQL Scripts:** `backend/database/01_schema.sql` - DDL statements
- **Documentation:** [Database Schema](database/schema.md)

**Usage Example:**

```python
# backend/app/models/order.py
class Order(Base):
    order_id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey('customers.customer_id'))
    total_amount = Column(Numeric(10, 2), nullable=False)
```

---

### 🔷 Normalization (3NF)

**Technique:** Third Normal Form normalization

**What:** Eliminates data redundancy and ensures data integrity

**How:**

- Separated `employees`, `managers`, `baristas` tables (role-specific data)
- Junction tables for many-to-many relationships (`menu_item_ingredients`, `barista_menu_items`)
- Order header/details separation (`orders`, `order_details`)

**Where:**

- **Schema Design:** `backend/app/models/` - Table structures
- **Documentation:** [Normalization Guide](database/normalization.md)

**Usage Example:**

```python
# employees table (base)
# managers table (extends employees via FK)
# baristas table (extends employees via FK)
# Prevents NULL values and data duplication
```

---

### 🔒 Constraints

**Technique:** Primary Keys, Foreign Keys, Check Constraints, Unique Constraints

**What:** Enforces data integrity and business rules at database level

**How:** Defined in SQL DDL and enforced by PostgreSQL

**Where:**

- **SQL Scripts:** `backend/database/02_constraints.sql`
- **Models:** `backend/app/models/` - Column definitions with constraints
- **Documentation:** [Constraints & Indexes](database/constraints-indexes.md)

**Usage Examples:**

**Check Constraints:**

```sql
-- backend/database/02_constraints.sql
ALTER TABLE menu_items
    ADD CONSTRAINT check_price_positive CHECK (price > 0);

ALTER TABLE orders
    ADD CONSTRAINT check_order_status
    CHECK (status IN ('pending', 'completed', 'cancelled'));
```

**Foreign Keys:**

```python
# backend/app/models/order.py
customer_id = Column(Integer, ForeignKey('customers.customer_id', ondelete='SET NULL'))
```

**Unique Constraints:**

```python
# backend/app/models/employee.py
email = Column(String(255), unique=True, nullable=True)
```

---

### 📊 Indexes

**Technique:** Strategic indexing for query performance

**What:** Improves query speed by creating fast lookup structures

**How:** Created on frequently queried columns and composite keys

**Where:**

- **SQL Scripts:** `backend/database/03_indexes.sql`
- **Documentation:** [Constraints & Indexes](database/constraints-indexes.md)

**Usage Examples:**

**Single Column Indexes:**

```sql
-- backend/database/03_indexes.sql
CREATE INDEX ix_orders_status ON orders(status);
CREATE INDEX ix_menu_items_category ON menu_items(category);
```

**Composite Indexes:**

```sql
CREATE INDEX idx_menu_item_category_available
    ON menu_items(category, is_available);

CREATE INDEX idx_order_date_status
    ON orders(order_date, status);
```

**Used In Queries:**

```python
# backend/app/repositories/order_repository.py
# Index on status speeds up this query
def get_by_status(self, status: str):
    return self.db.query(Order).filter(Order.status == status).all()
```

---

### ⚡ Transactions

**Technique:** ACID properties, Transaction Management

**What:** Ensures data consistency - all operations succeed or all fail

**How:** Using SQLAlchemy session transactions with commit/rollback

**Where:**

- **Order Creation:** `backend/app/repositories/order_repository.py` - `create()` method
- **Transaction Helper:** `backend/app/core/transactions.py`
- **Documentation:** [Transactions Guide](database/transactions.md)

**Usage Example:**

```python
# backend/app/repositories/order_repository.py
def create(self, order_data: OrderCreate):
    try:
        # Create order
        order = Order(...)
        self.db.add(order)
        self.db.flush()  # Get order_id

        # Create order details
        for detail in order_data.order_details:
            order_detail = OrderDetail(...)
            self.db.add(order_detail)

        # Create payment
        payment = Payment(...)
        self.db.add(payment)

        # Commit all or rollback on error
        self.db.commit()
        return order
    except Exception as e:
        self.db.rollback()  # Rollback on error
        raise
```

**Transaction Benefits:**

- Order creation is atomic (order + details + payment)
- If any step fails, entire transaction rolls back
- Prevents partial data corruption

---

### 🚀 Query Optimization

**Technique:** Eager Loading, Query Optimization, Index Usage

**What:** Reduces database queries and improves performance

**How:** Using SQLAlchemy `joinedload` and `selectinload` for relationship loading

**Where:**

- **Repositories:** `backend/app/repositories/` - All repository classes
- **Documentation:** [Query Optimization](database/query-optimization.md)

**Usage Examples:**

**Eager Loading (joinedload):**

```python
# backend/app/repositories/order_repository.py
def get(self, order_id: int):
    return self.db.query(Order).filter(
        Order.order_id == order_id
    ).options(
        joinedload(Order.customer),  # Load customer in same query
        selectinload(Order.order_details).joinedload(OrderDetail.menu_item),
        selectinload(Order.payments)
    ).first()
```

**Prevents N+1 Query Problem:**

```python
# Without optimization: 1 query for orders + N queries for customers
# With joinedload: 1 query with JOIN
```

**Pagination:**

```python
# backend/app/repositories/order_repository.py
def get_all(self, skip: int = 0, limit: int = 100):
    return self.db.query(Order).filter(
        Order.is_deleted == False
    ).order_by(Order.order_date.desc()
    ).offset(skip).limit(limit).all()
```

---

### 🔄 Migrations

**Technique:** Database Schema Versioning

**What:** Manages database schema changes over time

**How:** Using Alembic for version-controlled migrations

**Where:**

- **Migrations:** `backend/alembic/versions/` - Migration files
- **Config:** `backend/alembic.ini`, `backend/alembic/env.py`
- **Documentation:** [Migrations Guide](database/migrations.md)

**Usage:**

```bash
# Create migration
alembic revision --autogenerate -m "Add password_hash column"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

**Migration Files:**

- `001_initial_migration.py` - Initial schema
- `f884a7aeed71_add_password_hash_to_employees.py` - Added password_hash column

---

## 📚 Additional Documentation

### Getting Started

- **[🔧 Setup Guide](setup.md)** - Installation and configuration

### API & Development

- **[🔌 API Documentation](api.md)** - Complete RESTful API reference
- **[💻 Development Guide](development.md)** - Backend and frontend development

### Deployment & Troubleshooting

- **[🚀 Production Deployment](deployment/production.md)** - Production setup
- **[🔍 Troubleshooting](troubleshooting.md)** - Common issues and solutions

---

## 🚀 Quick Start

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
createdb coffee_shop_db
# Configure .env file (see setup.md)
alembic upgrade head
python scripts/seed_mock_data.py
uvicorn app.main:app --reload
```

### Frontend

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

---

## 📖 Documentation Structure

```
docs/
├── README.md                    # 📖 This file
│
├── database/                    # 🗄️ DATABASE DOCUMENTATION
│   ├── schema.md               # ERD, tables, relationships
│   ├── normalization.md        # 3NF normalization
│   ├── constraints-indexes.md  # Constraints & indexes
│   ├── migrations.md           # Alembic migration guide
│   ├── transactions.md         # ACID properties & transactions
│   └── query-optimization.md   # Query processing & optimization
│
├── setup.md                    # 🔧 Installation & configuration
├── api.md                      # 🔌 API documentation
├── development.md               # 💻 Development guides
├── deployment/                 # 🚀 Deployment guides
│   └── production.md
└── troubleshooting.md          # 🔍 Common issues & solutions
```

---

## 🔗 External Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
