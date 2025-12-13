# Transaction Management

Documentation on transaction management, ACID properties, and transaction handling in the Coffee Shop Management System.

## Transaction Overview

A transaction is a sequence of database operations that are executed as a single unit of work. All operations must succeed or all must fail (atomicity).

## ACID Properties

### Atomicity

**Definition:** All operations in a transaction succeed or all fail.

**Implementation:**
```python
# Example: Creating an order with order details
@transactional
def create_order(order_data):
    # All operations succeed or all rollback
    order = create_order_header(order_data)
    create_order_details(order.order_id, order_data.items)
    create_payment(order.order_id, order_data.payment)
    # If any step fails, entire transaction rolls back
```

### Consistency

**Definition:** Database remains in a consistent state before and after transaction.

**Implementation:**
- Constraints ensure data consistency
- Foreign keys maintain referential integrity
- Check constraints enforce business rules

### Isolation

**Definition:** Concurrent transactions don't interfere with each other.

**Isolation Levels:**
- **READ UNCOMMITTED** - Lowest isolation, allows dirty reads
- **READ COMMITTED** - Default in PostgreSQL, prevents dirty reads
- **REPEATABLE READ** - Prevents non-repeatable reads
- **SERIALIZABLE** - Highest isolation, prevents phantom reads

**Current Setting:** READ COMMITTED (PostgreSQL default)

### Durability

**Definition:** Committed transactions persist even after system failure.

**Implementation:**
- PostgreSQL Write-Ahead Logging (WAL)
- Transaction logs ensure durability
- Automatic recovery on restart

## Transaction Implementation

### SQLAlchemy Transactions

The application uses SQLAlchemy's transaction management:

```python
# Automatic transaction management
def create_order(db: Session, order_data: OrderCreate):
    # Transaction starts automatically
    order = Order(**order_data.dict())
    db.add(order)
    db.commit()  # Commit transaction
    # Transaction ends
```

### Explicit Transactions

```python
# Explicit transaction control
def create_order_with_details(db: Session, order_data: OrderCreate):
    try:
        # Begin transaction
        order = Order(**order_data.dict())
        db.add(order)
        db.flush()  # Get order_id without committing
        
        # Add order details
        for detail in order_data.order_details:
            order_detail = OrderDetail(
                order_id=order.order_id,
                **detail.dict()
            )
            db.add(order_detail)
        
        # Commit all changes
        db.commit()
        return order
    except Exception as e:
        # Rollback on error
        db.rollback()
        raise e
```

## Transaction Examples

### Order Creation

**Scenario:** Create order with multiple items and payment

```python
@transactional
def create_order(db: Session, order_data: OrderCreate):
    """
    Creates an order with order details and payment.
    All operations succeed or all fail.
    """
    # Calculate total
    total = sum(item.subtotal for item in order_data.order_details)
    
    # Create order header
    order = Order(
        customer_id=order_data.customer_id,
        order_date=order_data.order_date,
        total_amount=total,
        status='pending'
    )
    db.add(order)
    db.flush()  # Get order_id
    
    # Create order details
    for detail_data in order_data.order_details:
        order_detail = OrderDetail(
            order_id=order.order_id,
            item_id=detail_data.item_id,
            quantity=detail_data.quantity,
            unit_price=detail_data.unit_price,
            subtotal=detail_data.subtotal
        )
        db.add(order_detail)
    
    # Create payment
    payment = Payment(
        order_id=order.order_id,
        payment_method=order_data.payment_method,
        payment_amount=order_data.payment_amount
    )
    db.add(payment)
    
    # Commit all changes
    db.commit()
    db.refresh(order)
    return order
```

### Inventory Update

**Scenario:** Update inventory when order is completed

```python
@transactional
def complete_order(db: Session, order_id: int):
    """
    Completes an order and updates inventory.
    Ensures inventory is sufficient before completing order.
    """
    # Get order with details
    order = db.query(Order).filter(Order.order_id == order_id).first()
    
    if not order:
        raise ValueError("Order not found")
    
    # Check inventory for all items
    for detail in order.order_details:
        inventory = db.query(Inventory).filter(
            Inventory.ingredient_id == detail.item_id
        ).first()
        
        if inventory.quantity < detail.quantity:
            raise ValueError(f"Insufficient inventory for item {detail.item_id}")
    
    # Update inventory (within transaction)
    for detail in order.order_details:
        inventory = db.query(Inventory).filter(
            Inventory.ingredient_id == detail.item_id
        ).first()
        inventory.quantity -= detail.quantity
        inventory.last_updated = datetime.now()
    
    # Update order status
    order.status = 'completed'
    
    # Commit all changes
    db.commit()
    return order
```

## Transaction Decorator

Custom transaction decorator for automatic rollback:

```python
from functools import wraps
from sqlalchemy.orm import Session

def transactional(func):
    """Decorator for automatic transaction management"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Find db session in args or kwargs
        db = None
        for arg in args:
            if isinstance(arg, Session):
                db = arg
                break
        if not db:
            db = kwargs.get('db')
        
        if not db:
            raise ValueError("Database session not found")
        
        try:
            result = func(*args, **kwargs)
            db.commit()
            return result
        except Exception as e:
            db.rollback()
            raise e
    
    return wrapper
```

## Error Handling

### Rollback on Error

```python
def create_order(db: Session, order_data: OrderCreate):
    try:
        order = Order(**order_data.dict())
        db.add(order)
        db.commit()
        return order
    except Exception as e:
        db.rollback()  # Rollback on any error
        logger.error(f"Error creating order: {e}")
        raise e
```

### Nested Transactions

```python
def process_order(db: Session, order_id: int):
    # Outer transaction
    order = db.query(Order).filter(Order.order_id == order_id).first()
    
    # Nested operation (uses same transaction)
    update_inventory(db, order)
    
    # All commits together
    db.commit()
```

## Isolation Levels

### Setting Isolation Level

```python
# In database.py
from sqlalchemy import create_engine

engine = create_engine(
    database_url,
    isolation_level="READ COMMITTED"  # or "SERIALIZABLE", etc.
)
```

### Isolation Level Comparison

| Level | Dirty Reads | Non-Repeatable Reads | Phantom Reads |
|-------|-------------|---------------------|---------------|
| READ UNCOMMITTED | Yes | Yes | Yes |
| READ COMMITTED | No | Yes | Yes |
| REPEATABLE READ | No | No | Yes |
| SERIALIZABLE | No | No | No |

## Deadlock Handling

### Deadlock Prevention

```python
def update_inventory(db: Session, ingredient_id: int, quantity: Decimal):
    # Use SELECT FOR UPDATE to lock row
    inventory = db.query(Inventory).filter(
        Inventory.ingredient_id == ingredient_id
    ).with_for_update().first()
    
    inventory.quantity += quantity
    db.commit()
```

### Retry Logic

```python
from sqlalchemy.exc import OperationalError
import time

def update_with_retry(db: Session, func, max_retries=3):
    for attempt in range(max_retries):
        try:
            return func(db)
        except OperationalError as e:
            if 'deadlock' in str(e).lower() and attempt < max_retries - 1:
                time.sleep(0.1 * (attempt + 1))  # Exponential backoff
                continue
            raise e
```

## Best Practices

1. **Keep Transactions Short** - Minimize lock time
2. **Handle Errors Properly** - Always rollback on error
3. **Use Appropriate Isolation** - Balance consistency vs. performance
4. **Avoid Long-Running Transactions** - Can cause deadlocks
5. **Test Transaction Rollback** - Ensure data integrity
6. **Use Savepoints** - For nested transaction scenarios

## Related Documentation

- [Database Setup](../setup/database-setup.md) - Database configuration
- [Query Optimization](query-optimization.md) - Transaction performance
- [API Documentation](../api/overview.md) - Transaction usage in API

