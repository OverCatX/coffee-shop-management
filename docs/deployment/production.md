# Production Deployment

Guide for deploying the Coffee Shop Management System to production.

## Prerequisites

- Production server (VPS, Cloud, etc.)
- Domain name (optional)
- SSL certificate
- PostgreSQL database

## Backend Deployment

### 1. Environment Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Set production environment variables
export DATABASE_URL=postgresql://...
export SECRET_KEY=<strong-random-key>
export CORS_ORIGINS=https://yourdomain.com
```

### 2. Database Setup

```bash
# Run migrations
alembic upgrade head

# Seed initial data (if needed)
python scripts/seed_mock_data.py
```

### 3. Run with Gunicorn

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Frontend Deployment

### 1. Build

```bash
npm run build
```

### 2. Environment Variables

Set `NEXT_PUBLIC_API_URL` to production backend URL.

### 3. Deploy

Deploy to Vercel, Netlify, or your hosting provider.

## Security Checklist

- [ ] Change SECRET_KEY
- [ ] Use HTTPS
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable database SSL
- [ ] Use environment variables
- [ ] Set up monitoring
- [ ] Regular backups

## Monitoring

- Set up error tracking (Sentry, etc.)
- Monitor database performance
- Track API usage
- Set up alerts

