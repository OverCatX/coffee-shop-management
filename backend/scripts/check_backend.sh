#!/bin/bash
# Script to check if backend is running

echo "Checking backend status..."
echo ""

# Check if backend is running on port 8000
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Backend is running on port 8000"
    echo ""
    echo "Testing API endpoint..."
    curl -s http://localhost:8000/health | jq . || echo "Response: $(curl -s http://localhost:8000/health)"
    echo ""
    echo "Testing CORS..."
    curl -s -I -X OPTIONS http://localhost:8000/api/v1/auth/login \
      -H "Origin: http://localhost:3000" \
      -H "Access-Control-Request-Method: POST" | grep -i "access-control"
else
    echo "❌ Backend is NOT running on port 8000"
    echo ""
    echo "To start the backend:"
    echo "  cd backend"
    echo "  source venv/bin/activate"
    echo "  uvicorn app.main:app --reload"
fi

