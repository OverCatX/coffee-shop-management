from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    Date,
    CheckConstraint,
)
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Employee(BaseModel):
    __tablename__ = "employees"

    emp_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)
    salary = Column(Numeric(10, 2), nullable=False)
    email = Column(String(100), unique=True, nullable=True, index=True)
    phone = Column(String(20), unique=True, nullable=True, index=True)
    hire_date = Column(Date, nullable=False)
    password_hash = Column(String(255), nullable=True)  # For authentication

    # Relationships
    inventory_records = relationship("Inventory", back_populates="employee")

    __table_args__ = (CheckConstraint("salary > 0", name="check_salary_positive"),)
