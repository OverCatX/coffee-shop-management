from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from decimal import Decimal


class MenuItemIngredientBase(BaseModel):
    item_id: int
    ingredient_id: int
    amount_required: Decimal = Field(..., gt=0)
    unit: str = Field(..., min_length=1, max_length=20)


class MenuItemIngredientCreate(BaseModel):
    ingredient_id: int
    amount_required: Decimal = Field(..., gt=0)
    unit: str = Field(..., min_length=1, max_length=20, description="Unit of measurement (e.g., g, ml, pieces). Should match ingredient unit for consistency.")


class MenuItemIngredientUpdate(BaseModel):
    amount_required: Optional[Decimal] = Field(None, gt=0)
    unit: Optional[str] = Field(None, min_length=1, max_length=20, description="Unit of measurement. If not provided, keeps existing unit.")


class IngredientInfo(BaseModel):
    ingredient_id: int
    name: str
    unit: str

    model_config = ConfigDict(from_attributes=True)


class MenuItemInfo(BaseModel):
    item_id: int
    name: str
    category: str

    model_config = ConfigDict(from_attributes=True)


class MenuItemIngredientResponse(BaseModel):
    item_id: int
    ingredient_id: int
    amount_required: Decimal
    unit: str
    ingredient: IngredientInfo
    menu_item: Optional[MenuItemInfo] = None

    model_config = ConfigDict(from_attributes=True)
