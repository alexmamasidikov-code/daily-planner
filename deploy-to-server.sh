#!/bin/bash
# Deploy planner to server 84.32.25.53
# Usage: ./deploy-to-server.sh
# Prerequisites: SSH access to alex@84.32.25.53, planner cloned on server

set -e
cd "$(dirname "$0")"

SERVER="alex@84.32.25.53"
# Planner path on server (adjust if different)
REMOTE_PLANNER="${SERVER}:.openclaw/workspace/planner"

echo "=== Planner deploy to 84.32.25.53 ==="
echo "1. Pushing latest to GitHub..."
git push origin master

echo ""
echo "2. Deploying on server..."
ssh "$SERVER" bash -s << 'REMOTE'
set -e
cd ~/.openclaw/workspace/planner 2>/dev/null || cd ~/planner 2>/dev/null || { echo "Planner not found. Run: git clone https://github.com/alexmamasidikov-code/daily-planner.git ~/planner"; exit 1; }
git pull origin master
# Kill old processes
pkill -f "vite preview" 2>/dev/null || true
pkill -f "uvicorn app.main" 2>/dev/null || true
sleep 2
# Run in tmux if available, else nohup
if command -v tmux &>/dev/null; then
  tmux kill-session -t planner 2>/dev/null || true
  tmux new-session -d -s planner "./deploy.sh"
  echo "Started in tmux session 'planner'. Attach: tmux attach -t planner"
else
  nohup ./deploy.sh > /tmp/planner.log 2>&1 &
  echo "Started in background. Log: /tmp/planner.log"
fi
REMOTE

echo ""
echo "✓ Deploy complete. Planner: http://84.32.25.53:5176"
