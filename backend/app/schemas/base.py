"""
Base schema utilities for common serialization patterns
"""
from pydantic import field_serializer
from datetime import datetime
from typing import Any


def datetime_serializer(dt: datetime | None, _info: Any) -> str | None:
    """Serialize datetime to ISO format string"""
    if dt is None:
        return None
    return dt.isoformat()

