from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal
from typing import Optional


class InventoryBase(BaseModel):
    ingredient_id: int
    quantity: Decimal = Field(..., ge=0, decimal_places=2)
    min_threshold: Decimal = Field(default=0, ge=0, decimal_places=2)
    employee_id: Optional[int] = None


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseModel):
    ingredient_id: Optional[int] = None
    quantity: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    min_threshold: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    employee_id: Optional[int] = None


class InventoryResponse(InventoryBase):
    inventory_id: int
    last_updated: str
    created_at: str
    updated_at: str
    is_deleted: bool

    model_config = ConfigDict(from_attributes=True)

