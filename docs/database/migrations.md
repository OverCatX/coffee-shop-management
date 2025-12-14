# Database Migrations

Guide to managing database schema changes using Alembic migrations.

## Alembic Overview

Alembic is a database migration tool for SQLAlchemy that allows version-controlled database schema changes.

## Migration Workflow

### 1. Create Migration

```bash
cd backend
source venv/bin/activate

# Auto-generate migration from model changes
alembic revision --autogenerate -m "Description of changes"

# Manual migration (for complex changes)
alembic revision -m "Description of changes"
```

### 2. Review Migration

Always review auto-generated migrations before applying:

```bash
# View migration file
cat alembic/versions/<revision_id>_description.py
```

### 3. Apply Migration

```bash
# Apply all pending migrations
alembic upgrade head

# Apply specific migration
alembic upgrade <revision_id>

# Apply one migration at a time
alembic upgrade +1
```

### 4. Rollback (if needed)

```bash
# Rollback one migration
alembic downgrade -1

# Rollback to specific revision
alembic downgrade <revision_id>

# Rollback all migrations
alembic downgrade base
```

## Migration Files

### Location

Migrations are stored in `backend/alembic/versions/`

### Naming Convention

```
<revision_id>_<description>.py
```

Example: `f884a7aeed71_add_password_hash_to_employees.py`

### Migration Structure

```python
"""Add password hash to employees

Revision ID: f884a7aeed71
Revises: 001_initial_migration
Create Date: 2025-12-13 14:22:53.123456

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'f884a7aeed71'
down_revision = '001_initial_migration'
branch_labels = None
depends_on = None

def upgrade():
    # Migration logic
    op.add_column('employees', sa.Column('password_hash', sa.String(255), nullable=True))

def downgrade():
    # Rollback logic
    op.drop_column('employees', 'password_hash')
```

## Common Migration Operations

### Add Column

```python
def upgrade():
    op.add_column('employees', 
        sa.Column('password_hash', sa.String(255), nullable=True)
    )

def downgrade():
    op.drop_column('employees', 'password_hash')
```

### Create Table

```python
def upgrade():
    op.create_table(
        'customers',
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(255), nullable=True),
        sa.PrimaryKeyConstraint('customer_id')
    )

def downgrade():
    op.drop_table('customers')
```

### Add Foreign Key

```python
def upgrade():
    op.create_foreign_key(
        'fk_orders_customer',
        'orders', 'customers',
        ['customer_id'], ['customer_id'],
        ondelete='SET NULL'
    )

def downgrade():
    op.drop_constraint('fk_orders_customer', 'orders', type_='foreignkey')
```

### Add Index

```python
def upgrade():
    op.create_index(
        'idx_employees_email',
        'employees',
        ['email'],
        unique=True
    )

def downgrade():
    op.drop_index('idx_employees_email', table_name='employees')
```

### Add Check Constraint

```python
def upgrade():
    op.create_check_constraint(
        'check_price_positive',
        'menu_items',
        'price > 0'
    )

def downgrade():
    op.drop_constraint('check_price_positive', 'menu_items', type_='check')
```

## Migration History

### View History

```bash
# View all migrations
alembic history

# View verbose history
alembic history --verbose

# View specific revision
alembic history <revision_id>
```

### Current Revision

```bash
# Check current database revision
alembic current

# Show current revision with verbose info
alembic current --verbose
```

## Best Practices

### 1. Always Review Auto-Generated Migrations

```bash
# Generate migration
alembic revision --autogenerate -m "Add new column"

# Review the file
cat alembic/versions/<revision_id>_add_new_column.py

# Edit if needed before applying
```

### 2. Test Migrations

```bash
# Test on development database first
alembic upgrade head

# Verify changes
psql -U postgres -d coffee_shop_db -c "\d employees"

# Test rollback
alembic downgrade -1
alembic upgrade head
```

### 3. Write Reversible Migrations

Always implement both `upgrade()` and `downgrade()`:

```python
def upgrade():
    op.add_column('table', sa.Column('new_col', sa.String(50)))

def downgrade():
    op.drop_column('table', 'new_col')
```

### 4. Use Transactions

Alembic wraps migrations in transactions automatically:

```python
def upgrade():
    # All operations in one transaction
    op.add_column('table1', sa.Column('col1', sa.String(50)))
    op.add_column('table2', sa.Column('col2', sa.String(50)))
    # If any fails, all are rolled back
```

### 5. Handle Data Migrations

For data migrations, use raw SQL:

```python
def upgrade():
    # Schema change
    op.add_column('employees', sa.Column('password_hash', sa.String(255)))
    
    # Data migration
    connection = op.get_bind()
    connection.execute(
        sa.text("UPDATE employees SET password_hash = 'default_hash' WHERE password_hash IS NULL")
    )
    
    # Make column NOT NULL after data migration
    op.alter_column('employees', 'password_hash', nullable=False)
```

## Troubleshooting

### Migration Conflicts

**Issue:** Multiple developers create migrations simultaneously

**Solution:**
```bash
# Merge migrations
alembic merge -m "Merge migrations" <revision1> <revision2>
```

### Stale Migration State

**Issue:** Database state doesn't match migration history

**Solution:**
```bash
# Stamp database to specific revision
alembic stamp <revision_id>

# Or stamp to head
alembic stamp head
```

### Migration Errors

**Issue:** Migration fails partway through

**Solution:**
```bash
# Check current state
alembic current

# Manually fix database if needed
# Then stamp to correct revision
alembic stamp <revision_id>

# Continue with migrations
alembic upgrade head
```

## Migration Scripts

### Initial Migration

```bash
# Create initial migration from models
alembic revision --autogenerate -m "Initial migration"
```

### Add Column Migration

```bash
# After modifying model
alembic revision --autogenerate -m "Add password_hash to employees"
```

### Data Migration

```bash
# For data-only changes
alembic revision -m "Migrate existing data"
# Then edit migration file to add data migration logic
```

## Related Documentation

- [Database Schema](schema.md) - Complete schema documentation
- [Normalization](normalization.md) - Database normalization principles
- [Constraints & Indexes](constraints-indexes.md) - Creating constraints via migrations
- [Transactions](transactions.md) - Transaction management and ACID properties
- [Query Optimization](query-optimization.md) - Query performance optimization techniques

