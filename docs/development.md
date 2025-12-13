# Development Guide

Guide for developing and extending the Coffee Shop Management System.

## Backend Development

### Project Structure

```
backend/
├── app/
│   ├── api/           # API endpoints
│   ├── models/        # SQLAlchemy models
│   ├── repositories/  # Repository pattern
│   ├── schemas/       # Pydantic schemas
│   └── core/          # Core configuration
├── alembic/           # Database migrations
└── scripts/           # Utility scripts
```

### Adding New Endpoints

1. Create Schema (`app/schemas/`)
2. Create Repository (`app/repositories/`)
3. Create API Route (`app/api/`)
4. Register Route (`app/main.py`)

### Repository Pattern

```python
class MenuItemRepository(BaseRepository):
    def get_by_category(self, category: str):
        return self.db.query(MenuItem).filter(
            MenuItem.category == category
        ).all()
```

## Frontend Development

### Project Structure

```
frontend/src/
├── app/           # Next.js App Router pages
├── components/    # React components
├── contexts/      # React contexts
├── lib/api/       # API clients
└── types/         # TypeScript types
```

### Adding New Pages

1. Create page in `src/app/`
2. Use `ProtectedRoute` for authentication
3. Connect to API via `lib/api/` clients

### API Integration

```typescript
import { menuItemsApi } from '@/lib/api/menuItems';
const items = await menuItemsApi.getAll();
```

## Testing

### Backend Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=app
```

### Frontend Testing

```typescript
test('renders menu items', () => {
  render(<MenuPage />);
  // Assertions
});
```

## Code Style

- **Backend:** PEP 8, type hints, docstrings
- **Frontend:** TypeScript strict mode, no `any` types

