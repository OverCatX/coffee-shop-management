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
- The script creates role-specific records (Manager, Barista) automatically
- All timestamps are set automatically by the database

