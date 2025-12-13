# Coffee Shop Management System - Documentation

> **A comprehensive database project** with complete documentation covering all database management techniques.

---

## 🗄️ Database Documentation (Core Focus)

This project demonstrates advanced database techniques with detailed documentation:

| Topic | Documentation | Description |
|-------|--------------|-------------|
| **[📋 Schema](database/schema.md)** | Complete ERD & Table Structures | Entity-Relationship Diagram, all tables, relationships, constraints |
| **[🔷 Normalization](database/normalization.md)** | 3NF Design Principles | Database normalization (1NF, 2NF, 3NF) with examples |
| **[🔒 Constraints & Indexes](database/constraints-indexes.md)** | Database Integrity & Performance | Primary keys, foreign keys, check constraints, unique constraints, indexes |
| **[🔄 Migrations](database/migrations.md)** | Alembic Migration Guide | Database schema versioning and migration workflow |
| **[⚡ Transactions](database/transactions.md)** | ACID Properties & Transaction Management | Transaction handling, isolation levels, ACID properties |
| **[🚀 Query Optimization](database/query-optimization.md)** | Performance Tuning | Query processing, optimization techniques, index usage |

### Database Techniques Demonstrated

- ✅ **Normalization (3NF)** - Proper relational database design
- ✅ **SQL DDL** - Data Definition Language for schema creation
- ✅ **Constraints** - Primary keys, foreign keys, check constraints, unique constraints
- ✅ **Indexes** - Performance optimization with strategic indexing
- ✅ **Transactions** - ACID properties and transaction management
- ✅ **Query Processing & Optimization** - Efficient query execution
- ✅ **Physical Storage & Index Structures** - Database storage considerations

---

## 📚 Additional Documentation

### Getting Started

- **[🔧 Setup Guide](setup.md)** - Complete installation and configuration instructions

### API & Development

- **[🔌 API Documentation](api.md)** - Complete RESTful API reference
- **[💻 Development Guide](development.md)** - Backend and frontend development guides

### Deployment & Troubleshooting

- **[🚀 Production Deployment](deployment/production.md)** - Production setup guide
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
├── database/                    # 🗄️ DATABASE DOCUMENTATION (CORE)
│   ├── schema.md               # ERD, tables, relationships
│   ├── normalization.md        # 3NF normalization principles
│   ├── constraints-indexes.md  # Constraints & performance indexes
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

## 🎓 Learning Resources

This project serves as a **comprehensive database learning resource** with:

- ✅ Complete documentation covering all database concepts
- ✅ Real-world implementation of database techniques
- ✅ Detailed explanations with examples and best practices
- ✅ Production-ready code demonstrating proper database design

**Perfect for:**
- Database course projects
- Learning database management systems
- Understanding relational database design
- Studying database optimization techniques

---

## 🔗 External Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
