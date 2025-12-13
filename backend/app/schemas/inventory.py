from pydantic import BaseModel, Field, ConfigDict, field_serializer
from decimal import Decimal
from datetime import datetime
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


class IngredientInfo(BaseModel):
    """Ingredient information for inventory response"""
    ingredient_id: int
    name: str
    unit: str

    model_config = ConfigDict(from_attributes=True)


class InventoryResponse(InventoryBase):
    inventory_id: int
    last_updated: datetime
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    ingredient: Optional[IngredientInfo] = None  # Include ingredient info

    model_config = ConfigDict(from_attributes=True)

    @field_serializer('created_at', 'updated_at', 'last_updated')
    def serialize_datetime(self, dt: datetime | None, _info) -> str | None:
        """Serialize datetime to ISO format string"""
        if dt is None:
            return None
        return dt.isoformat()

