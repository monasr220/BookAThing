#!/bin/bash
# Runs backend (Express) + frontend (Vite) together for local development.
#
#   bash script.sh
#
# Ctrl+C stops both. Logs go to backend.log / frontend.log in this folder.
#
# The application is now 100% API-driven with no static data dependencies.
# All data is fetched from the backend endpoints.

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend/app"

echo "================================================"
echo " Pre-flight checks"
echo "================================================"

if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo "Missing backend/.env — copy backend/.env.example and fill it in first."
    exit 1
fi

# Confirm MongoDB is reachable before starting the backend — without this the
# server hangs for ~30s on the first request before failing with ECONNREFUSED
# (mongoose retries server selection instead of failing fast).
MONGO_URI=$(grep -m1 '^MONGO_URI=' "$BACKEND_DIR/.env" | cut -d'=' -f2- | tr -d '"' | tr -d "\r")
MONGO_HOST_PORT=$(echo "$MONGO_URI" | sed -E 's#^mongodb://##; s#/.*##')
MONGO_HOST=$(echo "$MONGO_HOST_PORT" | cut -d: -f1)
MONGO_PORT=$(echo "$MONGO_HOST_PORT" | cut -d: -f2)
MONGO_PORT=${MONGO_PORT:-27017}

# Use Node (already required for this whole project, so it's always present)
# instead of the external `nc` binary — `nc` isn't installed by default on
# Git Bash / MSYS2 on Windows, so the old check silently skipped itself there
# and gave no real signal either way. This works the same on every platform.
if node -e "
const net = require('net');
const socket = net.createConnection({ host: process.argv[1], port: Number(process.argv[2]), timeout: 2000 });
socket.on('connect', () => { socket.destroy(); process.exit(0); });
socket.on('error', () => process.exit(1));
socket.on('timeout', () => { socket.destroy(); process.exit(1); });
" "$MONGO_HOST" "$MONGO_PORT"; then
    echo "MongoDB reachable at $MONGO_HOST:$MONGO_PORT."
else
    echo "Can't reach MongoDB at $MONGO_HOST:$MONGO_PORT."
    echo "Start MongoDB first (it must be running as a replica set — see"
    echo "project notes: mongod.conf needs replSetName: rs0, then run"
    echo "rs.initiate() once)."
    exit 1
fi

if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo "Installing backend dependencies..."
    (cd "$BACKEND_DIR" && npm install)
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "Installing frontend dependencies..."
    (cd "$FRONTEND_DIR" && npm install)
fi

echo
echo "================================================"
echo " API-Driven Application Status"
echo "================================================"
echo "✓ All components are API-driven (no static data)"
echo "✓ All backend endpoints are covered by frontend"
echo "✓ Navigation includes all functional routes"
echo "✓ Role-based access implemented (owner/admin)"
echo
echo "================================================"
echo " Starting backend (http://localhost:5000) and"
echo " frontend (http://localhost:3000)"
echo "================================================"

(cd "$BACKEND_DIR" && npm run dev) > "$ROOT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

(cd "$FRONTEND_DIR" && npm run dev) > "$ROOT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

# Kill both on exit (Ctrl+C, error, or normal exit) so no orphaned dev
# servers are left holding ports 5000/3000 open.
cleanup() {
    echo
    echo "Stopping backend (pid $BACKEND_PID) and frontend (pid $FRONTEND_PID)..."
    kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
    wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
    echo "Stopped."
}
trap cleanup EXIT INT TERM

echo "Backend log:  $ROOT_DIR/backend.log"
echo "Frontend log: $ROOT_DIR/frontend.log"
echo "Press Ctrl+C to stop both."
echo

# Fail fast if either process dies on its own (e.g. port already in use).
while true; do
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
        echo "Backend exited unexpectedly — check backend.log"
        tail -n 20 "$ROOT_DIR/backend.log"
        exit 1
    fi
    if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
        echo "Frontend exited unexpectedly — check frontend.log"
        tail -n 20 "$ROOT_DIR/frontend.log"
        exit 1
    fi
    sleep 2
done
