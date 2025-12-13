from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate, EmployeeUpdate
from app.core.logging import logger


class EmployeeRepository:
    """Repository for Employee operations with query optimization"""

    def __init__(self, db: Session):
        self.db = db

    def get(self, emp_id: int) -> Optional[Employee]:
        """Get employee by ID"""
        return self.db.query(Employee).filter(
            and_(Employee.emp_id == emp_id, Employee.is_deleted == False)
        ).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Employee]:
        """Get all employees with pagination"""
        return self.db.query(Employee).filter(
            Employee.is_deleted == False
        ).offset(skip).limit(limit).all()

    def get_by_role(self, role: str, skip: int = 0, limit: int = 100) -> List[Employee]:
        """Get employees by role with optimized query"""
        return self.db.query(Employee).filter(
            and_(Employee.role == role, Employee.is_deleted == False)
        ).offset(skip).limit(limit).all()

    def create(self, employee_data: EmployeeCreate) -> Employee:
        """Create a new employee"""
        employee_dict = employee_data.model_dump()
        employee = Employee(**employee_dict)
        self.db.add(employee)
        self.db.commit()
        self.db.refresh(employee)
        logger.info(f"Created employee: {employee.emp_id}")
        return employee

    def update(self, emp_id: int, employee_data: EmployeeUpdate) -> Optional[Employee]:
        """Update an existing employee"""
        employee = self.get(emp_id)
        if not employee:
            return None
        
        update_data = employee_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(employee, field, value)
        
        self.db.commit()
        self.db.refresh(employee)
        logger.info(f"Updated employee: {emp_id}")
        return employee

    def delete(self, emp_id: int) -> bool:
        """Soft delete an employee"""
        employee = self.get(emp_id)
        if not employee:
            return False
        
        employee.is_deleted = True
        self.db.commit()
        logger.info(f"Deleted employee: {emp_id}")
        return True

