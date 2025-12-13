from sqlalchemy import Column, Integer, Numeric, String, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class MenuItemIngredient(BaseModel):
    __tablename__ = "menu_item_ingredients"

    item_id = Column(
        Integer,
        ForeignKey("menu_items.item_id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
    )
    ingredient_id = Column(
        Integer,
        ForeignKey("ingredients.ingredient_id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
    )
    amount_required = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(20), nullable=False)

    # Relationships
    menu_item = relationship("MenuItem", back_populates="ingredients")
    ingredient = relationship("Ingredient", back_populates="menu_item_ingredients")

    __table_args__ = (
        CheckConstraint("amount_required > 0", name="check_amount_required_positive"),
    )
