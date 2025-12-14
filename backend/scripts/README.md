# Database Seeding Scripts

## seed_mock_data.py

This script seeds the database with mock data from the frontend, including:
- Employees (with hashed passwords)
- Customers
- Menu Items
- Ingredients
- Inventory
- Orders and Order Details

### Usage

1. **Make sure you have activated your virtual environment:**
   ```bash
   cd backend
   source venv/bin/activate  # or .venv/bin/activate
   ```

2. **Make sure all dependencies are installed:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Make sure your database is set up and migrations are applied:**
   ```bash
   alembic upgrade head
   ```

4. **Run the seeding script:**
   ```bash
   python scripts/seed_mock_data.py
   ```

### Demo Credentials

After running the script, you can use these credentials to login:

- **Manager**: `john.smith@coffeeshop.com` / `password123`
- **Barista**: `sarah.j@coffeeshop.com` / `password123`
- **Cashier**: `emma.w@coffeeshop.com` / `password123`

### Notes

- The script will skip existing records (based on email/phone/name uniqueness)
- Passwords are automatically hashed using bcrypt
- All timestamps are set automatically by the database

---

## export_seed_data.py

This script exports all data from your PostgreSQL database to a SQL seed file. Useful for creating seed data from your existing database.

### Usage

1. **Make sure you have activated your virtual environment:**
   ```bash
   cd backend
   source venv/bin/activate
   ```

2. **Make sure your `.env` file is configured** with the database you want to export from

3. **Run the export script:**
   ```bash
   python scripts/export_seed_data.py
   ```

4. **The script will create:** `backend/database/07_exported_seed_data.sql`

### What it exports

The script exports all data from these tables (in dependency order):
- employees
- customers
- ingredients
- menu_items
- menu_item_ingredients
- inventory
- orders
- order_details
- payments

### Using the exported file

To use the exported seed data in another database:

1. **Set up the schema first:**
   ```bash
   # Run migrations or SQL scripts
   alembic upgrade head
   # OR manually run:
   # psql -d your_database -f database/01_schema.sql
   # psql -d your_database -f database/02_constraints.sql
   # psql -d your_database -f database/03_indexes.sql
   ```

2. **Import the seed data:**
   ```bash
   psql -d your_database -f database/07_exported_seed_data.sql
   ```

### Notes

- Only exports non-deleted records (`is_deleted = FALSE`)
- Preserves all relationships and foreign keys
- Includes all columns including timestamps
- Uses `ON CONFLICT DO NOTHING` to prevent errors if data already exists
- The exported file can be shared with others to seed their databases

