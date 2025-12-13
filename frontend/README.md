# Frontend - Coffee Shop Management System

Modern Next.js frontend for the Coffee Shop Management System.

> 📚 **For complete documentation, see [docs/](../docs/README.md)**

## Quick Links

- [Installation Guide](../docs/setup/installation.md)
- [Frontend Development](../docs/development/frontend.md)
- [API Documentation](../docs/api/overview.md)
- [Troubleshooting](../docs/troubleshooting.md)

## 🚀 Features

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **SWR** for data fetching
- **JWT Authentication** with role-based access control
- **Responsive Design** for all devices

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend server running (see backend README)

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the frontend directory (or copy from `.env.example`):

```bash
# Copy example file
cp .env.example .env.local

# Or create manually
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
EOF
```

**Important**: 
- Environment variables must start with `NEXT_PUBLIC_` to be accessible in the browser
- The frontend connects directly to the backend API. Make sure the backend is running before starting the frontend
- Restart the dev server after changing `.env.local` files

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## 🔐 Authentication

The frontend uses JWT authentication. After seeding the backend database, you can login with:

- **Manager**: `john.smith@coffeeshop.com` / `password123`
- **Barista**: `sarah.j@coffeeshop.com` / `password123`
- **Cashier**: `emma.w@coffeeshop.com` / `password123`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── contexts/         # React contexts (Auth, Cart)
│   ├── lib/
│   │   ├── api/          # API client functions (connects to backend)
│   │   └── hooks/        # Custom React hooks
│   └── types/            # TypeScript type definitions
├── dev-mocks/            # Mock data (for reference only)
└── public/               # Static assets
```

## 🔌 Backend Connection

The frontend connects to the backend API at `http://localhost:8000/api/v1` by default.

To change the backend URL, update `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://your-backend-url/api/v1
```

## 🧪 Development

### Running the Full Stack

1. **Start Backend** (in `backend/` directory):
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

2. **Start Frontend** (in `frontend/` directory):
   ```bash
   npm run dev
   ```

3. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Building for Production

```bash
npm run build
npm start
```

## 📝 Notes

- **Mock Data**: Mock data has been moved to `dev-mocks/` folder for reference. The frontend now uses the real backend API by default.
- **Database Seeding**: To populate the backend with sample data, run `python scripts/seed_mock_data.py` in the backend directory.
- **CORS**: The backend is configured to allow requests from `localhost:3000` by default.

## 🐛 Troubleshooting

### Frontend can't connect to backend

1. Check that backend is running: `curl http://localhost:8000/health`
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check browser console for CORS errors

### Authentication not working

1. Ensure backend database is seeded with employees
2. Check that JWT tokens are being stored in localStorage
3. Verify backend authentication endpoints are working

### Build Errors

1. Clear `.next` folder: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npm run build`
