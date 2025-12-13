"""
Security utilities for authentication and authorization
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from app.core.config import settings

# JWT settings
SECRET_KEY = settings.SECRET_KEY or "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    if not isinstance(plain_password, bytes):
        plain_password = plain_password.encode("utf-8")
    if not isinstance(hashed_password, bytes):
        hashed_password = hashed_password.encode("utf-8")
    return bcrypt.checkpw(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    if not isinstance(password, bytes):
        password = password.encode("utf-8")
    # Generate salt and hash password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password, salt)
    return hashed.decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token"""
    import logging

    logger = logging.getLogger(__name__)

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        logger.debug(f"Successfully decoded token for emp_id: {payload.get('sub')}")
        return payload
    except JWTError as e:
        logger.warning(f"JWT decode error: {str(e)}")
        logger.debug(f"Token (first 50 chars): {token[:50]}...")
        logger.debug(f"SECRET_KEY (first 20 chars): {SECRET_KEY[:20]}...")
        return None
    except Exception as e:
        logger.error(f"Unexpected error decoding token: {str(e)}")
        logger.debug(f"Token (first 50 chars): {token[:50]}...")
        return None
