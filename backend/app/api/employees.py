from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.repositories.employee_repository import EmployeeRepository
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
)

router = APIRouter(prefix="/employees", tags=["employees"], redirect_slashes=False)


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    """Create a new employee"""
    repo = EmployeeRepository(db)
    return repo.create(employee)


@router.get("", response_model=List[EmployeeResponse])
@router.get("/", response_model=List[EmployeeResponse])
def get_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all employees"""
    repo = EmployeeRepository(db)
    return repo.get_all(skip=skip, limit=limit)


@router.get("/{emp_id}", response_model=EmployeeResponse)
def get_employee(emp_id: int, db: Session = Depends(get_db)):
    """Get employee by ID"""
    repo = EmployeeRepository(db)
    employee = repo.get(emp_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.get("/role/{role}", response_model=List[EmployeeResponse])
def get_employees_by_role(
    role: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """Get employees by role"""
    repo = EmployeeRepository(db)
    return repo.get_by_role(role, skip=skip, limit=limit)


@router.put("/{emp_id}", response_model=EmployeeResponse)
def update_employee(
    emp_id: int, employee: EmployeeUpdate, db: Session = Depends(get_db)
):
    """Update an employee"""
    repo = EmployeeRepository(db)
    updated = repo.update(emp_id, employee)
    if not updated:
        raise HTTPException(status_code=404, detail="Employee not found")
    return updated


@router.delete("/{emp_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(emp_id: int, db: Session = Depends(get_db)):
    """Delete an employee"""
    repo = EmployeeRepository(db)
    if not repo.delete(emp_id):
        raise HTTPException(status_code=404, detail="Employee not found")
