"""
Authentication endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
import logging
from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
)
from app.models.employee import Employee
from app.schemas.auth import LoginRequest, TokenResponse, UserInfo
from datetime import timedelta

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Employee:
    """Get current authenticated user from JWT token"""
    # Try to get token from Authorization header first (for Bearer token)
    if authorization:
        # Extract token from "Bearer <token>" format
        if authorization.startswith("Bearer "):
            token = authorization.replace("Bearer ", "").strip()
        else:
            token = authorization.strip()

    # Fallback to OAuth2PasswordBearer if no Authorization header
    if not token:
        token = None  # Will be set by oauth2_scheme if available

    if not token:
        logger.warning("No token provided in request")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.debug(f"Decoding token: {token[:20]}...")
    payload = decode_access_token(token)
    if payload is None:
        logger.warning("Failed to decode token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # JWT 'sub' must be string, convert to int
    emp_id_str = payload.get("sub")
    if emp_id_str is None:
        logger.warning(f"Token payload missing 'sub': {payload}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        emp_id = int(emp_id_str)
    except (ValueError, TypeError):
        logger.warning(f"Invalid emp_id in token: {emp_id_str}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    employee = db.query(Employee).filter(Employee.emp_id == emp_id).first()
    if employee is None:
        logger.warning(f"Employee not found for emp_id: {emp_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return employee


def require_role(allowed_roles: list[str]):
    """Dependency to check if user has required role"""

    def role_checker(current_user: Employee = Depends(get_current_user)) -> Employee:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}",
            )
        return current_user

    return role_checker


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """
    Login endpoint - accepts email as username
    """
    # Find employee by email
    employee = (
        db.query(Employee)
        .filter(Employee.email == form_data.username)
        .filter(Employee.is_deleted == False)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check password (if password_hash exists, otherwise allow login for demo)
    if hasattr(employee, "password_hash") and employee.password_hash:
        if not verify_password(form_data.password, employee.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
    else:
        # For demo: if no password_hash, accept any password
        # In production, this should be removed
        pass

    # Create access token (JWT 'sub' must be string)
    access_token_expires = timedelta(hours=24)
    access_token = create_access_token(
        data={"sub": str(employee.emp_id), "role": employee.role},
        expires_delta=access_token_expires,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        emp_id=employee.emp_id,
        name=employee.name,
        role=employee.role,
        email=employee.email,
    )


@router.post("/login-json", response_model=TokenResponse)
async def login_json(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint with JSON body (for frontend)
    """
    employee = (
        db.query(Employee)
        .filter(Employee.email == login_data.email)
        .filter(Employee.is_deleted == False)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Check password
    if hasattr(employee, "password_hash") and employee.password_hash:
        if not verify_password(login_data.password, employee.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
    else:
        # For demo: if no password_hash, accept any password
        pass

    # Create access token (JWT 'sub' must be string)
    access_token_expires = timedelta(hours=24)
    access_token = create_access_token(
        data={"sub": str(employee.emp_id), "role": employee.role},
        expires_delta=access_token_expires,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        emp_id=employee.emp_id,
        name=employee.name,
        role=employee.role,
        email=employee.email,
    )


@router.get("/me", response_model=UserInfo)
async def get_current_user_info(current_user: Employee = Depends(get_current_user)):
    """Get current user information"""
    return UserInfo(
        emp_id=current_user.emp_id,
        name=current_user.name,
        role=current_user.role,
        email=current_user.email,
        phone=current_user.phone,
    )


@router.post("/logout")
async def logout():
    """Logout endpoint (client should remove token)"""
    return {"message": "Successfully logged out"}
