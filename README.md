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

This project includes **comprehensive database documentation** covering all essential database concepts:

### 🗄️ Core Database Documentation

| Topic                  | Documentation                                                 | Description                                      |
| ---------------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| **Schema**             | [Database Schema](docs/database/schema.md)                    | Complete ERD, table structures, relationships    |
| **Normalization**      | [Normalization (3NF)](docs/database/normalization.md)         | Database normalization principles and examples   |
| **Constraints**        | [Constraints & Indexes](docs/database/constraints-indexes.md) | PK, FK, CHECK, UNIQUE constraints                |
| **Indexes**            | [Constraints & Indexes](docs/database/constraints-indexes.md) | Performance optimization with strategic indexing |
| **Migrations**         | [Migrations](docs/database/migrations.md)                     | Alembic migration guide and best practices       |
| **Transactions**       | [Transactions](docs/database/transactions.md)                 | ACID properties and transaction management       |
| **Query Optimization** | [Query Optimization](docs/database/query-optimization.md)     | Query processing and performance tuning          |

### 📖 Additional Documentation

- **[📖 Documentation Index](docs/README.md)** - Complete documentation navigation
- **[🔧 Setup Guide](docs/setup.md)** - Installation and configuration
- **[🔌 API Documentation](docs/api.md)** - Complete RESTful API reference
- **[💻 Development Guide](docs/development.md)** - Backend and frontend development
- **[🚀 Deployment](docs/deployment/production.md)** - Production deployment guide
- **[🔍 Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions

---

## 🎯 Database Techniques Demonstrated

| Technique               | Status | Documentation                                             |
| ----------------------- | ------ | --------------------------------------------------------- |
| **Normalization (3NF)** | ✅     | [Normalization Guide](docs/database/normalization.md)     |
| **SQL DDL**             | ✅     | [Schema Documentation](docs/database/schema.md)           |
| **Constraints**         | ✅     | [Constraints Guide](docs/database/constraints-indexes.md) |
| **Indexes**             | ✅     | [Indexes Guide](docs/database/constraints-indexes.md)     |
| **Transactions**        | ✅     | [Transactions Guide](docs/database/transactions.md)       |
| **Query Optimization**  | ✅     | [Optimization Guide](docs/database/query-optimization.md) |
| **Physical Storage**    | ✅     | [Schema & Optimization](docs/database/)                   |

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

### Database Learning Resources

- **[🔷 Normalization](docs/database/normalization.md)** - 3NF principles
- **[🔒 Constraints & Indexes](docs/database/constraints-indexes.md)** - Database constraints
- **[🔄 Migrations](docs/database/migrations.md)** - Alembic guide
- **[⚡ Transactions](docs/database/transactions.md)** - ACID properties
- **[🚀 Query Optimization](docs/database/query-optimization.md)** - Performance tuning

---

## 🎓 Learning Resources

This project serves as a **comprehensive database learning resource** with:

- ✅ Complete documentation covering all database concepts
- ✅ Real-world implementation of database techniques
- ✅ Detailed explanations with examples and best practices
- ✅ Production-ready code demonstrating proper database design

**Perfect for:** Database course projects, learning DBMS, understanding relational database design, studying optimization techniques.

---

## 📄 License

This project is for educational purposes.
