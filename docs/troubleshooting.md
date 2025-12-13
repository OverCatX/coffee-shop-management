# Troubleshooting Guide

Common issues and solutions.

## Backend Issues

### Database Connection Error

**Error:** `could not connect to server`

**Solutions:**
1. Check PostgreSQL is running: `sudo systemctl status postgresql`
2. Verify credentials in `.env`
3. Check firewall rules
4. Verify database exists: `psql -U postgres -l`

### Migration Errors

**Error:** `Target database is not up to date`

**Solutions:**
1. Check current revision: `alembic current`
2. View history: `alembic history`
3. Apply migrations: `alembic upgrade head`
4. If stuck, stamp database: `alembic stamp head`

### Module Not Found

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solutions:**
1. Activate virtual environment: `source venv/bin/activate`
2. Install dependencies: `pip install -r requirements.txt`
3. Verify installation: `pip list`

## Frontend Issues

### Cannot Connect to Backend

**Error:** `Unable to connect to server`

**Solutions:**
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Verify CORS configuration
4. Check browser console for errors

### Authentication Not Working

**Error:** `401 Unauthorized`

**Solutions:**
1. Check token in localStorage
2. Verify token hasn't expired
3. Check backend authentication endpoint
4. Clear localStorage and login again

### Build Errors

**Error:** TypeScript or build errors

**Solutions:**
1. Clear `.next` folder: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npm run build`

## Database Issues

### Connection Refused

**Error:** `connection refused`

**Solutions:**
1. Check PostgreSQL service: `sudo systemctl status postgresql`
2. Verify port: `netstat -an | grep 5432`
3. Check `pg_hba.conf` for authentication rules

### Permission Denied

**Error:** `permission denied`

**Solutions:**
1. Check user permissions: `psql -U postgres -c "\du"`
2. Grant permissions: `GRANT ALL ON DATABASE coffee_shop_db TO user;`
3. Verify `.env` credentials

## Performance Issues

### Slow Queries

**Solutions:**
1. Analyze queries: `EXPLAIN ANALYZE`
2. Check indexes: `\d table_name`
3. Run VACUUM ANALYZE
4. Review query patterns

### High Memory Usage

**Solutions:**
1. Check connection pool size
2. Review query patterns
3. Optimize queries
4. Increase server resources if needed

## Common Solutions

### Restart Services

```bash
# Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev

# PostgreSQL
sudo systemctl restart postgresql
```

### Clear Cache

```bash
# Frontend
rm -rf .next node_modules
npm install

# Backend
find . -type d -name __pycache__ -exec rm -r {} +
```

### Reset Database

```bash
# Drop and recreate
dropdb coffee_shop_db
createdb coffee_shop_db
alembic upgrade head
python scripts/seed_mock_data.py
```

## Getting Help

1. Check logs: Backend logs, browser console
2. Review documentation
3. Check GitHub issues
4. Verify environment setup

