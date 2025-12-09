from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal
from datetime import datetime
from typing import Optional


class PaymentBase(BaseModel):
    order_id: int
    payment_method: str = Field(..., min_length=1, max_length=50)
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    status: str = Field(default="pending", pattern="^(pending|completed|failed)$")


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    order_id: Optional[int] = None
    payment_method: Optional[str] = Field(None, min_length=1, max_length=50)
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    status: Optional[str] = Field(None, pattern="^(pending|completed|failed)$")


class PaymentResponse(PaymentBase):
    payment_id: int
    payment_date: datetime
    created_at: str
    updated_at: str
    is_deleted: bool

    model_config = ConfigDict(from_attributes=True)

