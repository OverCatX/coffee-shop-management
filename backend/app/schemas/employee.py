from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import date
from decimal import Decimal
from typing import Optional


class EmployeeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    role: str = Field(..., min_length=1, max_length=50)
    salary: Decimal = Field(..., gt=0, decimal_places=2)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    hire_date: date


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    role: Optional[str] = Field(None, min_length=1, max_length=50)
    salary: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    hire_date: Optional[date] = None


class EmployeeResponse(EmployeeBase):
    emp_id: int
    created_at: str
    updated_at: str
    is_deleted: bool

    model_config = ConfigDict(from_attributes=True)


class ManagerCreate(BaseModel):
    emp_id: int


class ManagerResponse(BaseModel):
    emp_id: int
    created_at: str
    updated_at: str
    is_deleted: bool
    employee: Optional[EmployeeResponse] = None

    model_config = ConfigDict(from_attributes=True)


class BaristaCreate(BaseModel):
    emp_id: int


class BaristaResponse(BaseModel):
    emp_id: int
    created_at: str
    updated_at: str
    is_deleted: bool
    employee: Optional[EmployeeResponse] = None

    model_config = ConfigDict(from_attributes=True)

