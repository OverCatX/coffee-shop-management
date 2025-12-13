"""
Authentication schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    emp_id: int
    name: str
    role: str
    email: Optional[str] = None


class UserInfo(BaseModel):
    emp_id: int
    name: str
    role: str
    email: Optional[str] = None
    phone: Optional[str] = None

