from sqlalchemy import Column, Integer, String, Numeric, Boolean, CheckConstraint, Index
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class MenuItem(BaseModel):
    __tablename__ = "menu_items"

    item_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    price = Column(Numeric(10, 2), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    description = Column(String(500), nullable=True)
    is_available = Column(Boolean, default=True, nullable=False, index=True)

    # Relationships
    ingredients = relationship(
        "MenuItemIngredient", back_populates="menu_item", cascade="all, delete-orphan"
    )
    order_details = relationship("OrderDetail", back_populates="menu_item")

    __table_args__ = (
        CheckConstraint("price > 0", name="check_price_positive"),
        Index("idx_menu_item_category_available", "category", "is_available"),
    )
