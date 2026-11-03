#!/bin/bash

# --- CONFIGURATION ---
PORT_SERVER=2567
PORT_CLIENT=5173

# Clear screen if possible
[ -z "$TERM" ] || clear

echo "======================================================="
echo "         DRAMI ONLINE INFRASTRUCTURE LAUNCHER "
echo "           (CROSS-PLATFORM: LINUX/ARCH/WIN)"
echo "======================================================="

# --- HELPER: KILL BY PORT ---
kill_port() {
    local port=$1
    echo "  [SYSTEM] Checking port $port..."
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows (Git Bash)
        PID=$(netstat -ano | grep LISTENING | grep ":$port" | awk '{print $5}' | head -n 1)
        if [ ! -z "$PID" ]; then
            echo "  [SYSTEM] Killing Windows process $PID on port $port"
            taskkill -F -PID $PID > /dev/null 2>&1
        fi
    else
        # Linux (Arch, Ubuntu, etc.) / macOS
        if command -v fuser > /dev/null; then
            fuser -k $port/tcp > /dev/null 2>&1
        elif command -v lsof > /dev/null; then
            lsof -t -i:$port | xargs kill -9 > /dev/null 2>&1
        fi
    fi
}

# --- 1. CLEANUP ---
echo "[1/4] Cleaning up existing processes..."
kill_port $PORT_SERVER
kill_port $PORT_CLIENT
sleep 1

# --- 2. DEPENDENCIES & DB ---
echo "[2/4] Synchronizing Database..."
# Check server dependencies
if [ ! -d "server/node_modules" ]; then
    echo "  [INSTALL] Server modules missing, installing..."
    cd server && npm install && cd ..
fi
# Check client dependencies
if [ ! -d "client/node_modules" ]; then
    echo "  [INSTALL] Client modules missing, installing..."
    cd client && npm install && cd ..
fi

cd server
npx prisma generate
npx prisma db push --skip-generate
cd ..

# --- 3. LAUNCH SERVER ---
echo "[3/4] Starting Backend Server..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    start "🛡️ Drami Server" cmd /c "cd server && npm run dev"
else
    # Linux (Arch): Run in subshell to keep main shell in root
    (cd server && npm run dev > ../server.log 2>&1) &
    echo "  [LOG] Server output redirected to server.log"
fi

# Wait for server to initialize
echo "  [WAIT] Waiting for server to stabilize..."
sleep 5

# --- 4. LAUNCH CLIENT ---
echo "[4/4] Starting Frontend Client..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    start "🎨 Drami Client" cmd /c "cd client && npm run dev"
    sleep 3
    start "http://localhost:$PORT_CLIENT/game"
else
    # Linux (Arch): Run in subshell
    (cd client && npm run dev > ../client.log 2>&1) &
    echo "  [LOG] Client output redirected to client.log"
    
    # Open browser automatically using xdg-open (Linux standard)
    sleep 5
    if command -v xdg-open > /dev/null; then
        echo "  [BROWSER] Opening http://localhost:$PORT_CLIENT/game"
        xdg-open "http://localhost:$PORT_CLIENT/game" > /dev/null 2>&1
    else
        echo "  [NOTICE] Please open http://localhost:$PORT_CLIENT/game in your browser."
    fi
fi

echo ""
echo "======================================================="
echo "   ✅ SUCCESS: DRAMI ONLINE IS DEPLOYED"
echo "   Server Port: $PORT_SERVER"
echo "   Client Port: $PORT_CLIENT"
echo "======================================================="
echo "Note: On Linux, use 'tail -f server.log' to monitor the server."
echo ""
