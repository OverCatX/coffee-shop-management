# Mock Data for Development

This folder contains mock data and mock API implementations that were previously used for frontend development without a backend.

## ⚠️ Note

**The frontend now connects directly to the backend API by default.**

These mock files are kept here for reference or if you need to develop the frontend independently without a backend running.

## Usage

If you want to use mock data instead of the real backend:

1. Copy the mock files back to `src/lib/mocks/`
2. Update API files in `src/lib/api/` to import from mocks
3. Set environment variable: `NEXT_PUBLIC_USE_MOCK_DATA=true`

However, **it's recommended to use the real backend** by:
1. Running the backend server: `cd backend && uvicorn app.main:app --reload`
2. Setting `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` in `.env.local`
3. Using the seeded database data

## Seeding Backend Database

To populate the backend database with mock data:

```bash
cd backend
source venv/bin/activate
python scripts/seed_mock_data.py
```

This will create:
- 4 employees (Manager, 2 Baristas, Cashier) with hashed passwords
- 4 customers
- 10 menu items
- 5 ingredients
- Inventory records
- Sample orders

**Demo Credentials:**
- Manager: `john.smith@coffeeshop.com` / `password123`
- Barista: `sarah.j@coffeeshop.com` / `password123`
- Cashier: `emma.w@coffeeshop.com` / `password123`

