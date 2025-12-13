from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_serializer
from decimal import Decimal
from datetime import datetime
from typing import Optional


class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    loyalty_points: Decimal = Field(default=0, ge=0, decimal_places=2)


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    loyalty_points: Optional[Decimal] = Field(None, ge=0, decimal_places=2)


class CustomerResponse(CustomerBase):
    customer_id: int
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

