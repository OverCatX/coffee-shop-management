"""add_image_url_to_menu_items

Revision ID: a286023a80f1
Revises: f884a7aeed71
Create Date: 2025-12-13 19:06:27.294868

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a286023a80f1'
down_revision: Union[str, None] = 'f884a7aeed71'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('menu_items', sa.Column('image_url', sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column('menu_items', 'image_url')

