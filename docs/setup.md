# Setup Guide

Complete setup instructions for the Coffee Shop Management System.

## Prerequisites

- Python 3.11 or 3.12
- PostgreSQL 12+
- Node.js 18+
- npm or yarn

## Installation

### 1. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Database Setup

```bash
# Create database
createdb coffee_shop_db

# Or using psql:
psql -U postgres
CREATE DATABASE coffee_shop_db;
\q
```

### 3. Environment Configuration

Create `.env` file in `backend/`:

```env
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
```

### 4. Run Migrations

```bash
alembic upgrade head
```

### 5. Seed Database (Optional)

```bash
python scripts/seed_mock_data.py
```

### 6. Start Backend

```bash
uvicorn app.main:app --reload
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Start Frontend

```bash
npm run dev
```

## Verification

- Backend: http://localhost:8000/health
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

## Demo Credentials

- Manager: `john.smith@coffeeshop.com` / `password123`
- Barista: `sarah.j@coffeeshop.com` / `password123`
- Cashier: `emma.w@coffeeshop.com` / `password123`

