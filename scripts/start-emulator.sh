#!/bin/bash

# Start Firebase Emulator Suite
echo "🔥 Starting Firebase Emulator Suite for WordWise..."

# Kill any existing emulator processes
echo "🧹 Cleaning up any existing emulator processes..."
pkill -f "firebase.*emulators" || true

# Start the emulator suite
echo "🚀 Starting emulators..."
echo "   - Auth Emulator: http://localhost:9099"
echo "   - Firestore Emulator: http://localhost:8080"
echo "   - Emulator UI: http://localhost:4000"
echo ""
firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data 