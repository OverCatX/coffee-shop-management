# Setup Guide

Quick installation guide for the Coffee Shop Management System.

## Prerequisites

- Python 3.11+ (3.13 may have issues)
- PostgreSQL 12+
- Node.js 18+
- npm/yarn

## Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Database Setup

```bash
createdb coffee_shop_db
# Or: psql -U postgres -c "CREATE DATABASE coffee_shop_db;"
```

### Environment Configuration

Create `backend/.env`:

```env
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=coffee_shop_db
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your-secret-key-change-in-production
```

### Run Migrations & Seed Data

```bash
alembic upgrade head
python scripts/seed_mock_data.py
```

### Start Backend

```bash
uvicorn app.main:app --reload
```

API available at: http://localhost:8000/docs

## Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

```bash
npm run dev
```

Frontend available at: http://localhost:3000

## Demo Credentials

After seeding data:

| Role    | Email                     | Password    |
| ------- | ------------------------- | ----------- |
| Manager | john.smith@coffeeshop.com | password123 |
| Barista | sarah.j@coffeeshop.com    | password123 |
| Cashier | emma.w@coffeeshop.com     | password123 |

## Common Issues

**Database connection error:** Check PostgreSQL is running and credentials in `.env`

**Migration errors:** Run `alembic upgrade head` or `alembic stamp head` if needed

**Module not found:** Ensure virtual environment is activated and dependencies installed
