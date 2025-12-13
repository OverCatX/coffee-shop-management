"""add_password_hash_to_employees

Revision ID: f884a7aeed71
Revises: 001
Create Date: 2025-12-13 14:22:32.491274

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f884a7aeed71'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add password_hash column to employees table (if not exists)
    # Check if column exists first
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    columns = [col['name'] for col in inspector.get_columns('employees')]
    
    if 'password_hash' not in columns:
        op.add_column('employees', sa.Column('password_hash', sa.String(length=255), nullable=True))
    
    # Create index on email for faster login lookups (if not exists)
    indexes = [idx['name'] for idx in inspector.get_indexes('employees')]
    if 'idx_employees_email' not in indexes:
        op.create_index(
            'idx_employees_email',
            'employees',
            ['email'],
            unique=False,
            postgresql_where=sa.text('is_deleted = FALSE')
        )


def downgrade() -> None:
    # Drop index
    op.drop_index('idx_employees_email', table_name='employees')
    
    # Drop password_hash column
    op.drop_column('employees', 'password_hash')

