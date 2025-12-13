# API Documentation

Complete RESTful API documentation for the Coffee Shop Management System.

## API Architecture

- **Base URL:** `http://localhost:8000/api/v1`
- **Authentication:** JWT Bearer tokens
- **Content-Type:** `application/json`
- **Response Format:** JSON

## Authentication

### Authentication Flow

1. User submits email and password
2. Backend validates credentials
3. Backend generates JWT token
4. Frontend stores token in localStorage
5. Frontend includes token in Authorization header for subsequent requests

### Login Endpoint

**POST** `/api/v1/auth/login-json`

**Request:**
```json
{
  "email": "john.smith@coffeeshop.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "emp_id": 1,
  "name": "John Smith",
  "role": "Manager",
  "email": "john.smith@coffeeshop.com"
}
```

### Token Usage

Include token in Authorization header:
```http
Authorization: Bearer <access_token>
```

### Role-Based Access Control

- **Manager** - Full access
- **Barista** - Menu and order management
- **Cashier** - POS and order creation

## API Endpoints

### Authentication

- `POST /auth/login-json` - Login with email/password
- `GET /auth/me` - Get current user info
- `POST /auth/logout` - Logout (client-side token removal)

### Menu Items

- `GET /menu-items` - List all menu items
- `GET /menu-items/{id}` - Get menu item by ID
- `GET /menu-items/category/{category}` - Get items by category
- `POST /menu-items` - Create menu item
- `PUT /menu-items/{id}` - Update menu item
- `DELETE /menu-items/{id}` - Delete menu item
- `POST /menu-items/{id}/toggle-availability` - Toggle availability

### Orders

- `GET /orders` - List all orders
- `GET /orders/{id}` - Get order by ID
- `GET /orders/status/{status}` - Get orders by status
- `POST /orders` - Create order
- `PATCH /orders/{id}/status` - Update order status

### Customers

- `GET /customers` - List all customers
- `GET /customers/{id}` - Get customer by ID
- `GET /customers/search/query?q={query}` - Search customers
- `POST /customers` - Create customer
- `PUT /customers/{id}` - Update customer
- `POST /customers/{id}/loyalty-points?points={points}` - Update loyalty points

### Employees

- `GET /employees` - List all employees
- `GET /employees/{id}` - Get employee by ID
- `GET /employees/role/{role}` - Get employees by role
- `POST /employees` - Create employee
- `PUT /employees/{id}` - Update employee

### Inventory

- `GET /inventory` - List all inventory items
- `GET /inventory/low-stock` - Get low stock items
- `GET /inventory/ingredient/{ingredient_id}` - Get by ingredient
- `PATCH /inventory/ingredient/{ingredient_id}/quantity` - Update quantity

## Request/Response Format

### Request Headers
```http
Content-Type: application/json
Authorization: Bearer <token>
```

### Response Format

**Success:**
```json
{
  "id": 1,
  "name": "Espresso",
  "price": 50.00,
  "created_at": "2025-12-13T14:22:53.123456+07:00"
}
```

**Error:**
```json
{
  "detail": "Resource not found"
}
```

## Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error

## Pagination & Filtering

**Pagination:**
```http
GET /orders?skip=0&limit=20
```

**Filtering:**
```http
GET /menu-items?available_only=true
GET /orders?status=pending
```

## Interactive Documentation

When backend is running:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

