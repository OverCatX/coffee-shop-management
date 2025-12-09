from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    ForeignKey,
    DateTime,
    CheckConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import BaseModel


class Inventory(BaseModel):
    __tablename__ = "inventory"

    inventory_id = Column(Integer, primary_key=True, index=True)
    ingredient_id = Column(
        Integer,
        ForeignKey("ingredients.ingredient_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    quantity = Column(Numeric(10, 2), nullable=False)
    min_threshold = Column(Numeric(10, 2), default=0, nullable=False)
    employee_id = Column(
        Integer,
        ForeignKey("employees.emp_id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    last_updated = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    ingredient = relationship("Ingredient", back_populates="inventory_records")
    employee = relationship("Employee", back_populates="inventory_records")

    __table_args__ = (
        CheckConstraint("quantity >= 0", name="check_quantity_non_negative"),
        CheckConstraint("min_threshold >= 0", name="check_threshold_non_negative"),
        Index("idx_inventory_ingredient_quantity", "ingredient_id", "quantity"),
    )
