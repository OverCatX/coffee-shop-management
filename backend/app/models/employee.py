from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    Date,
    ForeignKey,
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

    # Relationships
    manager = relationship(
        "Manager",
        back_populates="employee",
        uselist=False,
        cascade="all, delete-orphan",
    )
    barista = relationship(
        "Barista",
        back_populates="employee",
        uselist=False,
        cascade="all, delete-orphan",
    )
    inventory_records = relationship("Inventory", back_populates="employee")

    __table_args__ = (CheckConstraint("salary > 0", name="check_salary_positive"),)


class Manager(BaseModel):
    __tablename__ = "managers"

    emp_id = Column(
        Integer,
        ForeignKey("employees.emp_id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
    )

    # Relationships
    employee = relationship("Employee", back_populates="manager")


class Barista(BaseModel):
    __tablename__ = "baristas"

    emp_id = Column(
        Integer,
        ForeignKey("employees.emp_id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
    )

    # Relationships
    employee = relationship("Employee", back_populates="barista")
    menu_items = relationship(
        "BaristaMenuItem", back_populates="barista", cascade="all, delete-orphan"
    )
