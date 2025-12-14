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

```python
@transactional
def create_order(db: Session, order_data: OrderCreate):
    """Create order with order details and payment. All operations succeed or all fail."""
    order = Order(**order_data.dict())
    db.add(order)
    db.flush()  # Get order_id

    for detail_data in order_data.order_details:
        db.add(OrderDetail(order_id=order.order_id, **detail_data.dict()))

    db.add(Payment(order_id=order.order_id, **payment_data.dict()))
    db.commit()
    return order
```

### Inventory Update

```python
@transactional
def complete_order(db: Session, order_id: int):
    """Complete order and update inventory. Check inventory sufficiency first."""
    order = db.query(Order).filter(Order.order_id == order_id).first()
    # Check and update inventory for all items
    # Update order status
    db.commit()
    return order
```

## Error Handling

Always use try/except with rollback:

```python
def create_order(db: Session, order_data: OrderCreate):
    try:
        order = Order(**order_data.dict())
        db.add(order)
        db.commit()
        return order
    except Exception as e:
        db.rollback()  # Rollback on any error
        raise e
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

| Level            | Dirty Reads | Non-Repeatable Reads | Phantom Reads |
| ---------------- | ----------- | -------------------- | ------------- |
| READ UNCOMMITTED | Yes         | Yes                  | Yes           |
| READ COMMITTED   | No          | Yes                  | Yes           |
| REPEATABLE READ  | No          | No                   | Yes           |
| SERIALIZABLE     | No          | No                   | No            |

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

- [Database Schema](schema.md) - Complete schema documentation
- [Normalization](normalization.md) - Database normalization principles
- [Database Schema](schema.md) - Constraints and indexes documentation
- [Migrations](migrations.md) - Database migration guide and version control
- [Query Optimization](query-optimization.md) - Transaction performance optimization
