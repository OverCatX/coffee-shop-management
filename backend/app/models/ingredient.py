from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Ingredient(BaseModel):
    __tablename__ = "ingredients"

    ingredient_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    unit = Column(String(20), nullable=False)  # e.g., "kg", "liter", "piece"

    # Relationships
    inventory_records = relationship("Inventory", back_populates="ingredient")
    menu_item_ingredients = relationship(
        "MenuItemIngredient", back_populates="ingredient", cascade="all, delete-orphan"
    )
