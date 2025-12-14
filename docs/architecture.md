# System Architecture

Complete documentation of the Coffee Shop Management System architecture, request flow, and component design.

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
│   Port: 3000    │
└────────┬────────┘
         │ HTTP/REST API
         │ (JWT Authentication)
         ▼
┌─────────────────┐
│   Backend       │
│   (FastAPI)     │
│   Port: 8000    │
└────────┬────────┘
         │ SQLAlchemy ORM
         │ (Connection Pool)
         ▼
┌─────────────────┐
│   Database      │
│   (PostgreSQL)  │
│   Port: 5432    │
└─────────────────┘
```

## Request Flow

1. **User Action** → Frontend (React/Next.js)
2. **API Call** → Axios client with JWT token
3. **Authentication** → Backend validates JWT token
4. **Authorization** → Check user role permissions
5. **Business Logic** → Repository pattern handles data operations
6. **Database Query** → SQLAlchemy ORM executes queries
7. **Response** → JSON response back to frontend
8. **UI Update** → SWR cache updates, React re-renders

## Key Components

### Backend Layers

#### API Layer (`app/api/`)

- RESTful endpoints
- Request/response handling
- Route definitions
- Authentication middleware

**Files:**

- `app/api/auth.py` - Authentication endpoints
- `app/api/orders.py` - Order management endpoints
- `app/api/menu_items.py` - Menu item endpoints
- `app/api/inventory.py` - Inventory endpoints
- `app/api/customers.py` - Customer endpoints
- `app/api/stock.py` - Stock availability endpoints

#### Business Logic Layer (`app/repositories/`)

- Data access logic
- Transaction management
- Query optimization
- Business rules enforcement

**Files:**

- `app/repositories/order_repository.py` - Order operations
- `app/repositories/menu_item_repository.py` - Menu item operations
- `app/repositories/inventory_repository.py` - Inventory operations
- `app/repositories/customer_repository.py` - Customer operations

#### Data Models (`app/models/`)

- SQLAlchemy ORM models
- Table relationships
- Database schema definition

**Files:**

- `app/models/order.py` - Order and OrderDetail models
- `app/models/menu_item.py` - MenuItem model
- `app/models/customer.py` - Customer model
- `app/models/inventory.py` - Inventory model
- `app/models/employee.py` - Employee model

#### Validation Layer (`app/schemas/`)

- Pydantic schemas
- Request/response validation
- Data serialization

**Files:**

- `app/schemas/order.py` - Order schemas
- `app/schemas/menu_item.py` - Menu item schemas
- `app/schemas/customer.py` - Customer schemas

### Frontend Layers

#### Pages (`src/app/`)

- Next.js App Router pages
- Route definitions
- Page-level components

**Pages:**

- `src/app/pos/` - Point of Sale page
- `src/app/barista/` - Barista dashboard
- `src/app/manager/` - Manager dashboard
- `src/app/menu/` - Menu management
- `src/app/inventory/` - Inventory management
- `src/app/orders/` - Order history

#### Components (`src/components/`)

- Reusable UI components
- Feature-specific components
- Common components

**Component Structure:**

- `src/components/auth/` - Authentication components
- `src/components/cart/` - Shopping cart components
- `src/components/menu/` - Menu components
- `src/components/orders/` - Order components
- `src/components/common/` - Common UI components

#### API Client (`src/lib/api/`)

- API call functions
- Request/response handling
- Error handling

**Files:**

- `src/lib/api/orders.ts` - Order API calls
- `src/lib/api/menuItems.ts` - Menu item API calls
- `src/lib/api/inventory.ts` - Inventory API calls
- `src/lib/api/customers.ts` - Customer API calls

#### Data Fetching (`src/lib/hooks/`)

- SWR hooks for data fetching
- Real-time data updates
- Cache management

**Files:**

- `src/lib/hooks/useOrders.ts` - Order data hooks
- `src/lib/hooks/useMenuItems.ts` - Menu item hooks
- `src/lib/hooks/useInventory.ts` - Inventory hooks
- `src/lib/hooks/useStock.ts` - Stock availability hooks

#### State Management (`src/contexts/`)

- Global state management
- React contexts

**Files:**

- `src/contexts/AuthContext.tsx` - Authentication state
- `src/contexts/CartContext.tsx` - Shopping cart state

## Database Design Pattern

### Repository Pattern

The system uses the Repository Pattern to separate data access logic from business logic:

```python
class OrderRepository(BaseRepository):
    def create(self, order_data: OrderCreate):
        # Data access logic
        # Transaction management
        # Error handling
        pass
```

**Benefits:**

- Separation of concerns
- Easier testing
- Centralized data access
- Transaction management

### ORM Mapping

SQLAlchemy maps Python objects to database tables:

```python
class Order(BaseModel):
    __tablename__ = "orders"
    order_id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey('customers.customer_id'))
    # ...
```

**Benefits:**

- Type safety
- Relationship management
- Query building
- Migration support

### Eager Loading

Prevents N+1 query problems by loading related data in advance:

```python
def get(self, order_id: int):
    return self.db.query(Order).options(
        joinedload(Order.customer),
        selectinload(Order.order_details)
    ).first()
```

**Benefits:**

- Reduced database queries
- Improved performance
- Better resource utilization

### Transaction Management

Ensures ACID properties for data consistency:

```python
def create(self, order_data: OrderCreate):
    try:
        # Create order
        # Create order details
        # Create payment
        self.db.commit()  # All or nothing
    except Exception:
        self.db.rollback()  # Rollback on error
```

**Benefits:**

- Data consistency
- Error recovery
- Atomic operations

## Authentication Flow

1. User submits credentials (email/password)
2. Backend validates credentials
3. Backend generates JWT token
4. Frontend stores token in localStorage
5. Frontend includes token in Authorization header for subsequent requests
6. Backend validates token on each request
7. Backend checks user role for authorization

## Data Flow Example: Creating an Order

1. **Frontend**: User adds items to cart
2. **Frontend**: User clicks "Place Order"
3. **Frontend**: `CartContext` prepares order data
4. **Frontend**: API call to `POST /api/v1/orders`
5. **Backend**: `orders.py` endpoint receives request
6. **Backend**: Validates request with Pydantic schema
7. **Backend**: Checks authentication and authorization
8. **Backend**: `OrderRepository.create()` processes order
9. **Backend**: Creates order, order details, and payment in transaction
10. **Backend**: Commits transaction
11. **Backend**: Returns order response
12. **Frontend**: Updates UI with new order
13. **Frontend**: Clears cart

## Technology Stack

### Backend

- **FastAPI**: Web framework
- **SQLAlchemy**: ORM
- **PostgreSQL**: Database
- **Alembic**: Migrations
- **JWT**: Authentication

### Frontend

- **Next.js**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **SWR**: Data fetching
- **Axios**: HTTP client

## Related Documentation

- [Database Schema](database/schema.md) - Database structure and relationships
- [API Documentation](api.md) - Complete API reference
- [Setup Guide](setup.md) - Installation and configuration
