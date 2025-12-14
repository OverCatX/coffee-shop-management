# Setup Guide

Complete installation and configuration guide for the Coffee Shop Management System.

## Prerequisites

Before starting, ensure you have the following installed:

- **Python 3.11 or 3.12** (Python 3.13 may have compatibility issues - see [Troubleshooting](troubleshooting.md))
- **PostgreSQL 12+**
- **Node.js 18+**
- **npm or yarn**
- **Git** (for cloning the repository)

## Installation

### Step 1: Clone Repository (if applicable)

```bash
git clone <repository-url>
cd coffee-shop-management
```

### Step 2: Backend Setup

#### 2.1 Create Virtual Environment

```bash
cd backend
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

#### 2.2 Install Dependencies

```bash
pip install -r requirements.txt
```

**Note**: If you encounter build errors with Python 3.13, use Python 3.11 or 3.12 instead. See [Troubleshooting](troubleshooting.md) for details.

#### 2.3 Create PostgreSQL Database

```bash
# Using createdb command
createdb coffee_shop_db

# Or using psql:
psql -U postgres
CREATE DATABASE coffee_shop_db;
\q
```

### Step 3: Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration (Required)
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=coffee_shop_db

# Database Configuration (Optional - defaults: localhost, 5432)
DB_HOST=localhost
DB_PORT=5432

# Alternative: Use full DATABASE_URL instead of DB_* variables above
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/coffee_shop_db

# Security (Optional - has default but recommended to change)
SECRET_KEY=your-secret-key-change-in-production-use-random-string-here
```

**Important Notes:**

- **Required variables:** `DB_USER`, `DB_PASSWORD`, `DB_NAME` must be set
- Replace `yourpassword` with your actual PostgreSQL password
- Replace `your-secret-key-change-in-production-use-random-string-here` with a secure random string (generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
- `DB_HOST` and `DB_PORT` are optional (defaults: `localhost`, `5432`)
- `SECRET_KEY` is optional but recommended to change for production
- You can use either `DATABASE_URL` OR individual `DB_*` variables (not both)
- For production, use environment-specific values and never commit `.env` files

**Other configuration options** (all have sensible defaults):

- `DEBUG`, `LOG_LEVEL`, `HOST`, `PORT` - Application settings
- `CORS_ORIGINS`, `CORS_ALLOW_CREDENTIALS`, `CORS_ALLOW_METHODS`, `CORS_ALLOW_HEADERS` - CORS settings (defaults work for development)

### Step 4: Database Migrations

Run Alembic migrations to create the database schema:

```bash
# Make sure virtual environment is activated
alembic upgrade head
```

This will create all tables, constraints, and indexes defined in the migrations.

### Step 5: Seed Mock Data (Optional but Recommended)

Seed the database with sample data including employees, customers, menu items, and orders:

```bash
# Make sure virtual environment is activated
python scripts/seed_mock_data.py
```

This creates:

- 4 employees (Manager, Baristas, Cashier roles) with hashed passwords
- 4 customers with loyalty points
- 10 menu items with recipes
- 5 ingredients with inventory
- Sample orders and order details

### Step 6: Start Backend Server

```bash
# Make sure virtual environment is activated
uvicorn app.main:app --reload
```

The backend API will be available at:

- **API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Frontend Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure Environment

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Step 3: Start Development Server

```bash
npm run dev
```

The frontend will be available at:

- **Frontend**: http://localhost:3000

## Verification

After completing the setup, verify everything is working:

1. **Backend Health Check:**

   ```bash
   curl http://localhost:8000/health
   ```

   Should return: `{"status":"ok"}`

2. **Frontend Access:**

   - Open http://localhost:3000 in your browser
   - You should see the login page

3. **API Documentation:**
   - Visit http://localhost:8000/docs for interactive API documentation

## Demo Credentials

After seeding mock data, you can login with:

| Role    | Email                     | Password    |
| ------- | ------------------------- | ----------- |
| Manager | john.smith@coffeeshop.com | password123 |
| Barista | sarah.j@coffeeshop.com    | password123 |
| Cashier | emma.w@coffeeshop.com     | password123 |

## Common Issues

### Database Connection Error

**Error**: `could not connect to server`

**Solutions:**

1. Check PostgreSQL is running: `sudo systemctl status postgresql` (Linux) or check PostgreSQL service (Windows/macOS)
2. Verify credentials in `.env` file
3. Check if database exists: `psql -U postgres -l`
4. Verify firewall rules allow connections

### Migration Errors

**Error**: `Target database is not up to date`

**Solutions:**

1. Check current revision: `alembic current`
2. View migration history: `alembic history`
3. Apply migrations: `alembic upgrade head`
4. If stuck, you can stamp the database: `alembic stamp head` (use with caution)

### Module Not Found

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solutions:**

1. Ensure virtual environment is activated: `source venv/bin/activate`
2. Install dependencies: `pip install -r requirements.txt`
3. Verify installation: `pip list | grep fastapi`

### Frontend Cannot Connect to Backend

**Error**: `Unable to connect to server` or CORS errors

**Solutions:**

1. Verify backend is running: `curl http://localhost:8000/health`
2. Check `NEXT_PUBLIC_API_URL` in `.env.local` matches backend URL
3. Verify CORS configuration in backend `.env` file
4. Check browser console for detailed error messages

### Python 3.13 Compatibility Issues

If you encounter build errors with Python 3.13:

1. **Recommended**: Use Python 3.11 or 3.12

   ```bash
   python3.11 -m venv venv
   # or
   python3.12 -m venv venv
   ```

2. See [Troubleshooting Guide](troubleshooting.md) for more details

## Next Steps

After successful installation:

1. **Explore the System:**

   - Login as Manager to see the dashboard
   - Login as Cashier to use the POS system
   - Login as Barista to view pending orders

2. **Read Documentation:**

   - [Database Documentation](database/) - Learn about database design and techniques
   - [API Documentation](api.md) - Understand the RESTful API
   - [Troubleshooting](troubleshooting.md) - Common issues and solutions

3. **Development:**
   - Check the code structure in `backend/app/` and `frontend/src/`
   - Review database models in `backend/app/models/`
   - Explore API endpoints in `backend/app/api/`

## Additional Resources

- [Troubleshooting Guide](troubleshooting.md) - Detailed solutions for common problems
- [Database Documentation](database/) - Complete database design documentation
- [API Documentation](api.md) - Full API reference
