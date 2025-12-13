from pydantic import BaseModel, Field, ConfigDict, field_serializer
from typing import Optional
from datetime import datetime


class IngredientBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    unit: str = Field(..., min_length=1, max_length=20)


class IngredientCreate(IngredientBase):
    pass


class IngredientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    unit: Optional[str] = Field(None, min_length=1, max_length=20)


class IngredientResponse(IngredientBase):
    ingredient_id: int
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

    model_config = ConfigDict(from_attributes=True)

    @field_serializer('created_at', 'updated_at')
    def serialize_datetime(self, dt: datetime | None, _info) -> str | None:
        """Serialize datetime to ISO format string"""
        if dt is None:
            return None
        return dt.isoformat()

