# Documentation Index

> **Complete documentation for Coffee Shop Management System**

This directory contains comprehensive documentation for the Coffee Shop Management System, focusing on database design and management techniques.

---

## 🗄️ Database Documentation

The core of this project is demonstrating advanced database techniques. All database-related documentation is located in the [`database/`](database/) directory.

### Database Techniques

| Document                                                     | Description                                                                               |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| **[Schema & ERD](database/schema.md)**                       | Entity-Relationship Diagram, table structures, relationships, and data types              |
| **[Normalization (3NF)](database/normalization.md)**         | How Third Normal Form is implemented to eliminate data redundancy                         |
| **[Constraints & Indexes](database/constraints-indexes.md)** | Primary keys, foreign keys, check constraints, unique constraints, and strategic indexing |
| **[Transactions](database/transactions.md)**                 | ACID properties, transaction management, and usage examples                               |
| **[Query Optimization](database/query-optimization.md)**     | Eager loading, N+1 prevention, query processing, and optimization techniques              |
| **[Migrations](database/migrations.md)**                     | Database schema versioning with Alembic                                                   |

### Quick Links

- **[📖 Database Documentation Overview](../README.md#6-database-design--techniques)** - Back to main README
- **[🗄️ All Database Docs](database/)** - Browse all database documentation files

---

## 🔧 Setup & Installation

- **[Setup Guide](setup.md)** - Complete installation and configuration instructions
  - Prerequisites
  - Backend setup
  - Database setup
  - Frontend setup
  - Environment configuration
  - Seeding mock data

---

## 🏗️ System Architecture

- **[System Architecture](architecture.md)** - Complete architecture documentation
  - Architecture overview
  - Request flow
  - Component design
  - Database design patterns
  - Authentication flow
  - Data flow examples

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
├── database/                    # 🗄️ DATABASE DOCUMENTATION (CORE)
│   ├── schema.md               # ERD, tables, relationships
│   ├── normalization.md        # 3NF normalization
│   ├── constraints-indexes.md  # Constraints & indexes
│   ├── migrations.md           # Alembic migration guide
│   ├── transactions.md         # ACID properties & transactions
│   └── query-optimization.md   # Query processing & optimization
│
├── setup.md                    # 🔧 Installation & configuration
├── architecture.md              # 🏗️ System architecture
├── api.md                      # 🔌 API documentation
└── troubleshooting.md          # 🔍 Common issues & solutions
```

---

## 🎯 Quick Navigation

### For Database Focus

1. Start with **[Database Schema](database/schema.md)** to understand the structure
2. Read **[Normalization](database/normalization.md)** to see how 3NF is applied
3. Check **[Constraints & Indexes](database/constraints-indexes.md)** for data integrity
4. Review **[Transactions](database/transactions.md)** for ACID properties
5. Study **[Query Optimization](database/query-optimization.md)** for performance

### For Getting Started

1. Read **[Setup Guide](setup.md)** for installation
2. Review **[System Architecture](architecture.md)** to understand the system design
3. Check **[API Documentation](api.md)** for endpoints
4. Review **[Troubleshooting](troubleshooting.md)** for common issues

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
