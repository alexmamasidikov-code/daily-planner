#!/bin/bash
# Daily Planner — backend + frontend

cd "$(dirname "$0")"

# Backend
cd backend && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8081 &
BACKEND_PID=$!
cd ..

# Frontend (preview после build)
npm run build 2>/dev/null || true
npx vite preview --host 0.0.0.0 --port 5176 &
FRONTEND_PID=$!

echo "Backend: port 8081 (PID $BACKEND_PID)"
echo "Frontend: http://localhost:5176/ (PID $FRONTEND_PID)"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
