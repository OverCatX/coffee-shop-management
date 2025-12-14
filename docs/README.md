# Documentation Index

> **Complete documentation for Coffee Shop Management System**

This directory contains comprehensive documentation for the Coffee Shop Management System, focusing on database design and management techniques.

---

## 🗄️ Database Documentation

The core of this project is demonstrating advanced database techniques. All database-related documentation is located in the [`database/`](database/) directory.

### Database Techniques

| Document                                                 | Description                                                                               |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **[Schema & ERD](database/schema.md)**                   | Entity-Relationship Diagram, table structures, constraints, indexes, and relationships    |
| **[Normalization (3NF)](database/normalization.md)**     | How Third Normal Form is implemented, functional dependencies, and normalization examples |
| **[Transactions](database/transactions.md)**             | ACID properties, transaction management, and usage examples                               |
| **[Query Optimization](database/query-optimization.md)** | Query optimization techniques, SQLAlchemy patterns, and SQL user queries (63+ queries)    |
| **[Migrations](database/migrations.md)**                 | Database schema versioning with Alembic                                                   |

### Quick Links

- **[📖 Database Documentation Overview](../README.md#6-database-design--techniques)** - Back to main README
- **[🗄️ All Database Docs](database/)** - Browse all database documentation files

---

## 📊 Business Analysis

- **[Business Analysis](business-analysis.md)** - Business domain, activities, processes, and data requirements
  - Business activities and processes
  - Why data collection is necessary (INSERT, UPDATE, DELETE, USE)
  - Data operations by activity
  - Data flow examples

## 🔧 Setup & Installation

- **[Setup Guide](setup.md)** - Complete installation and configuration instructions
  - Prerequisites
  - Backend setup
  - Database setup
  - Frontend setup
  - Environment configuration
  - Seeding mock data

---

---

## 🔌 API Documentation

- **[Complete API Reference](api.md)** - Full RESTful API documentation
  - Authentication
  - All endpoints
  - Request/response schemas
  - Examples

**Interactive API Docs** (when server is running):

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 📚 Documentation Structure

```
docs/
├── README.md                    # 📖 This file (Documentation Index)
│
├── business-analysis.md        # 📊 Business domain & data requirements
│
├── database/                    # 🗄️ DATABASE DOCUMENTATION (CORE)
│   ├── schema.md               # ERD, tables, relationships, constraints, indexes
│   ├── normalization.md        # 3NF normalization & functional dependencies
│   ├── migrations.md           # Alembic migration guide
│   ├── transactions.md         # ACID properties & transactions
│   └── query-optimization.md   # Query optimization & SQL user queries
│
├── setup.md                    # 🔧 Installation & configuration
├── api.md                      # 🔌 API documentation
└── troubleshooting.md          # 🔍 Common issues & solutions
```

---

## 🎯 Quick Navigation

### For Database Focus

1. Start with **[Business Analysis](business-analysis.md)** to understand business requirements
2. Review **[Database Schema](database/schema.md)** to understand structure, constraints, and indexes
3. Read **[Normalization](database/normalization.md)** to see 3NF implementation and functional dependencies
4. Review **[Transactions](database/transactions.md)** for ACID properties
5. Study **[Query Optimization](database/query-optimization.md)** for performance techniques and SQL queries

### For Getting Started

1. Read **[Setup Guide](setup.md)** for installation
2. Check **[API Documentation](api.md)** for endpoints
3. Review **[Troubleshooting](troubleshooting.md)** for common issues

---

## 🔗 External Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)

---

## 📖 Main Project README

For project overview, features, tech stack, quick start, and architecture, see:

- **[Main README](../README.md)** - Complete project documentation
