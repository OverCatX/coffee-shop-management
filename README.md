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

## 3. Database Schema

The database consists of 9 core tables following Third Normal Form (3NF) normalization:

![Database ERD Diagram](docs/ERD-Diagram.png)

**Core Tables:**

- `employees` - Employee management with role-based access (Manager, Barista, Cashier)
- `customers` - Customer information and loyalty points
- `menu_items` - Menu items with pricing and availability
- `ingredients` - Ingredient definitions
- `menu_item_ingredients` - Many-to-many relationship (recipes)
- `inventory` - Stock levels for ingredients
- `orders` - Order headers with customer and employee references
- `order_details` - Order line items
- `payments` - Payment records linked to orders

> 📚 **For detailed schema documentation including table structures, relationships, and column descriptions, see [Schema Documentation](docs/database/schema.md)**

---

## 4. Quick Start

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
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   createdb coffee_shop_db
   ```

3. **Configure Environment:**

   Create `.env` file in `backend/` directory:

   ```bash
   # Required: Database credentials
   DB_USER=postgres
   DB_PASSWORD=yourpassword
   DB_NAME=coffee_shop_db

   # Optional: Database host and port (defaults: localhost, 5432)
   DB_HOST=localhost
   DB_PORT=5432

   # Optional: Security key (recommended to change in production)
   SECRET_KEY=your-secret-key-change-in-production
   ```

   **Note:** You can also use `DATABASE_URL` instead of individual `DB_*` variables:

   ```bash
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/coffee_shop_db
   ```

   See [Setup Guide](docs/setup.md) for detailed configuration.

4. **Database Setup:**

   **Option A: Use exported demo seed data (Recommended)**

   If `backend/database/07_exported_seed_data.sql` exists:

   ```bash
   alembic upgrade head
   psql -d coffee_shop_db -f backend/database/07_exported_seed_data.sql
   ```

   **Option B: Generate mock data**

   If exported seed data is not available:

   ```bash
   alembic upgrade head
   python scripts/seed_mock_data.py
   ```

5. **Start Backend:**

   ```bash
   cd backend
   source venv/bin/activate
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

After seeding the database (using either Option A or Option B above):

- **Manager**: `john.smith@coffeeshop.com` / `password123`
- **Barista**: `sarah.j@coffeeshop.com` / `password123`
- **Cashier**: `emma.w@coffeeshop.com` / `password123`

> **Note:** If you used `07_exported_seed_data.sql`, credentials may vary. Check the exported file or use the mock data option to ensure these credentials work.

> 📚 **For complete installation instructions and detailed configuration, see [Setup Guide](docs/setup.md)**

---

## 5. Project Structure

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
│   │   ├── 05_add_password_hash.sql # Password hash migration
│   │   └── 07_exported_seed_data.sql # Exported demo seed data (if available)
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

## 6. Business Selection and Analysis

### Business Domain

**Coffee Shop Management System (POS)** - A comprehensive Point of Sale and management system for coffee shops to manage orders, inventory, menu items, employees, customers, and business operations.

### Business Activities and Processes

The system supports 10 core business activities:

1. **Point of Sale (POS) Operations** - Create orders, process payments
2. **Order Management** - Track orders from creation to completion
3. **Inventory Management** - Monitor ingredient stock levels
4. **Menu Management** - Manage menu items, recipes, and pricing
5. **Customer Management** - Track customer information and loyalty points
6. **Employee Management** - Role-based access control
7. **Recipe Management** - Define ingredient requirements for menu items
8. **Payment Processing** - Record and track payments
9. **Stock Availability Checking** - Verify ingredient availability
10. **Loyalty Points System** - Customer rewards program

### Why Data Collection and Management is Necessary

Each activity requires data operations:

- **INSERT:** Store new transactions, records, and relationships (orders, customers, employees, menu items)
- **UPDATE:** Modify existing data (order status, inventory quantities, prices, loyalty points)
- **DELETE:** Soft delete records to maintain historical data integrity
- **USE (Query):** Retrieve data for display, analysis, decision-making, and reporting

> 📚 **For detailed business analysis including data operations by activity, see [Business Analysis](docs/business-analysis.md)**

---

## 7. Database Design

### Design Techniques Used

#### UML (Entity-Relationship Diagram)

- Complete ERD showing all 9 core tables and their relationships
- Visual representation of database structure

#### Functional Dependencies

- Analysis of functional dependencies for all tables
- Verification of normalization requirements
- Documentation of primary keys and unique constraints

#### Normalization (3rd Normal Form - 3NF)

- **1NF:** All tables have atomic values, no repeating groups
- **2NF:** All non-key attributes fully depend on entire primary key
- **3NF:** No transitive dependencies, proper table separation
- Junction tables for many-to-many relationships

### User Actions and Queries

From the business activities, specific SQL queries users can perform:

- **30+ SQL queries** covering all business activities (exceeds 3N requirement for 4-person group)
- Queries include INSERT, UPDATE, DELETE (soft delete), and SELECT operations
- All queries use parameterized inputs (`<parameter>`) for user input
- Queries follow best practices: use indexes, avoid SELECT \*, proper JOINs

**Query Categories:**

- Employee Management (6 queries)
- Customer Management (6 queries)
- Menu Item Management (8 queries)
- Order Management (8 queries)
- Inventory Management (5 queries)
- Recipe Management (5 queries)
- Payment Processing (4 queries)
- Analytics & Reporting (6 queries)

> 📚 **For complete list of user actions and queries, see [User Actions & Queries](docs/database/user-actions-queries.md)**

### Database Design Documentation

- **[Schema & ERD](docs/database/schema.md)** - Complete schema with ERD diagram, table structures, constraints, and indexes
- **[Normalization (3NF)](docs/database/normalization.md)** - Normalization process, functional dependencies, and examples
- **[User Actions & Queries](docs/database/user-actions-queries.md)** - 30+ SQL queries users can perform
- **[Functional Dependencies](docs/database/normalization.md#functional-dependencies)** - Detailed FD analysis for all tables

---

## 8. Database Implementation & Techniques

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

| File                        | Description                                                                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `01_schema.sql`             | Complete DDL for creating all tables (employees, customers, menu_items, ingredients, menu_item_ingredients, inventory, orders, order_details, payments) |
| `02_constraints.sql`        | Check constraints, foreign key constraints, and data validation rules                                                                                   |
| `03_indexes.sql`            | Performance indexes for query optimization                                                                                                              |
| `05_add_password_hash.sql`  | Migration script to add password_hash column to employees table                                                                                         |
| `07_exported_seed_data.sql` | Exported demo seed data from actual database (if available) - use this to get real demo data instead of mock data                                       |

**Note:** These SQL scripts are provided for reference and manual setup. The recommended approach is to use Alembic migrations (`alembic upgrade head`) which automatically manages schema changes and versioning.

**Using Exported Seed Data:** If `07_exported_seed_data.sql` is available in the repository, you can import it directly using `psql -d coffee_shop_db -f backend/database/07_exported_seed_data.sql` after running migrations. This gives you the actual demo data used in the project.

### Database Documentation Links

- **[Database Documentation Index](docs/database/)** - Complete database documentation
- **[Schema & ERD](docs/database/schema.md)** - Entity-Relationship Diagram and table structures
- **[Normalization (3NF)](docs/database/normalization.md)** - How normalization is implemented
- **[Constraints & Indexes](docs/database/constraints-indexes.md)** - All constraints and indexes
- **[Transactions](docs/database/transactions.md)** - Transaction management and ACID properties
- **[Query Optimization](docs/database/query-optimization.md)** - Query processing and optimization techniques
- **[Migrations](docs/database/migrations.md)** - Database schema versioning

---

## 9. API Documentation

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
