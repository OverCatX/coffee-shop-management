# API Documentation

RESTful API for the Coffee Shop Management System.

## Base URL

`http://localhost:8000/api/v1`

## Authentication

JWT Bearer token authentication. Login endpoint:

**POST** `/auth/login-json`

```json
{
  "email": "john.smith@coffeeshop.com",
  "password": "password123"
}
```

Include token in requests:

```http
Authorization: Bearer <access_token>
```

**Roles:** Manager (full access), Barista (menu/orders), Cashier (POS/orders)

## Endpoints

### Authentication

- `POST /auth/login-json` - Login
- `GET /auth/me` - Get current user

### Menu Items

- `GET /menu-items` - List items
- `GET /menu-items/{id}` - Get by ID
- `POST /menu-items` - Create
- `PUT /menu-items/{id}` - Update
- `DELETE /menu-items/{id}` - Delete

### Orders

- `GET /orders` - List orders
- `GET /orders/{id}` - Get by ID
- `POST /orders` - Create
- `PATCH /orders/{id}/status` - Update status

### Customers

- `GET /customers` - List customers
- `GET /customers/{id}` - Get by ID
- `POST /customers` - Create
- `PUT /customers/{id}` - Update

### Employees

- `GET /employees` - List employees
- `GET /employees/{id}` - Get by ID
- `POST /employees` - Create
- `PUT /employees/{id}` - Update

### Inventory

- `GET /inventory` - List inventory
- `GET /inventory/low-stock` - Low stock items
- `PATCH /inventory/ingredient/{id}/quantity` - Update quantity

## Interactive Docs

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
