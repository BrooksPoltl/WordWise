#!/bin/bash

# Script to kill processes running on common development ports

echo "🔍 Checking for processes on common development ports..."

# Common ports used by development servers
PORTS=(3000 3001 5000 5173 8080 8000 9000 9099 4000 4173)

for PORT in "${PORTS[@]}"; do
    echo "Checking port $PORT..."
    
    # Find process ID using the port
    PID=$(lsof -ti :$PORT 2>/dev/null)
    
    if [ ! -z "$PID" ]; then
        echo "🚨 Found process $PID running on port $PORT"
        
        # Get process name for confirmation
        PROCESS_NAME=$(ps -p $PID -o comm= 2>/dev/null || echo "Unknown")
        echo "   Process: $PROCESS_NAME"
        
        # Kill the process
        kill -9 $PID 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully killed process $PID on port $PORT"
        else
            echo "❌ Failed to kill process $PID on port $PORT"
        fi
    else
        echo "✅ Port $PORT is free"
    fi
    echo ""
done

echo "🔍 Checking for any remaining node processes..."
NODE_PIDS=$(pgrep -f "node.*vite\|node.*dev\|npm.*dev\|yarn.*dev" 2>/dev/null)

if [ ! -z "$NODE_PIDS" ]; then
    echo "🚨 Found additional Node.js development processes:"
    echo "$NODE_PIDS" | while read -r PID; do
        if [ ! -z "$PID" ]; then
            PROCESS_CMD=$(ps -p $PID -o args= 2>/dev/null || echo "Unknown")
            echo "   PID $PID: $PROCESS_CMD"
            kill -9 $PID 2>/dev/null
            echo "✅ Killed PID $PID"
        fi
    done
else
    echo "✅ No additional Node.js development processes found"
fi

echo ""
echo "🧹 Port cleanup complete!"
echo "You can now restart your development server." 