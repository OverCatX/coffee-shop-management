from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal
from typing import Optional


class MenuItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: Decimal = Field(..., gt=0, decimal_places=2)
    category: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    is_available: bool = True


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    is_available: Optional[bool] = None


class MenuItemResponse(MenuItemBase):
    item_id: int
    created_at: str
    updated_at: str
    is_deleted: bool

    model_config = ConfigDict(from_attributes=True)

