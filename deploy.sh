#!/bin/bash
# Deploy planner to server: build + run backend + frontend

set -e
cd "$(dirname "$0")"

echo "Building frontend..."
npm run build

echo "Starting backend (port 8081)..."
cd backend
[ -f .env ] || cp .env.example .env 2>/dev/null || true
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8081 &
BACKEND_PID=$!
cd ..

echo "Starting frontend (port 5176)..."
npx vite preview --host 0.0.0.0 --port 5176 &
FRONTEND_PID=$!

echo ""
echo "Planner running:"
echo "  Backend:  http://localhost:8081"
echo "  Frontend: http://localhost:5176  (or http://84.32.25.53:5176)"
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
