# Troubleshooting Guide

## Python 3.13 Compatibility Issues

If you're encountering build errors with `psycopg2-binary` or `pydantic-core` on Python 3.13, this is because Python 3.13 is very new and some packages haven't fully caught up yet.

### Solution 1: Use Python 3.11 or 3.12 (Recommended)

The easiest solution is to use Python 3.11 or 3.12 instead:

```bash
# Check available Python versions
python3.11 --version
python3.12 --version

# Create virtual environment with specific Python version
python3.11 -m venv venv
# or
python3.12 -m venv venv

# Activate and install
source venv/bin/activate
pip install -r requirements.txt
```

### Solution 2: Use psycopg (version 3) instead of psycopg2-binary

The `requirements.txt` already uses `psycopg[binary]>=3.2.0` which has better Python 3.13 support. Make sure your `DATABASE_URL` uses `postgresql://` (not `postgresql+psycopg2://`).

### Solution 3: Update packages to latest versions

If you must use Python 3.13, try updating to the latest versions:

```bash
pip install --upgrade pip
pip install --upgrade fastapi uvicorn sqlalchemy alembic pydantic pydantic-settings
```

## Common Issues

### Issue: `psycopg2-binary` build fails

**Error**: `error: command '/usr/bin/clang' failed with exit code 1`

**Solution**:

- Use `psycopg[binary]>=3.2.0` instead (already in requirements.txt)
- Or use Python 3.11/3.12

### Issue: `pydantic-core` build fails

**Error**: `TypeError: ForwardRef._evaluate() missing 1 required keyword-only argument`

**Solution**:

- Use Python 3.11 or 3.12
- Or upgrade pydantic to latest version: `pip install --upgrade pydantic pydantic-core`

### Issue: SQLAlchemy compatibility error

**Error**: `AssertionError: Class <class 'sqlalchemy.sql.elements.SQLCoreOperations'> directly inherits TypingOnly`

**Solution**:

- Upgrade SQLAlchemy: `pip install --upgrade sqlalchemy>=2.0.36`
- Or use Python 3.11 or 3.12

## Recommended Python Version

**Python 3.11 or 3.12** are recommended for the best compatibility with all dependencies.
