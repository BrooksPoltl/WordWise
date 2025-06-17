#!/bin/bash

# Start Firebase Emulator Suite
echo "🔥 Starting Firebase Emulator Suite..."

# Kill any existing emulator processes
echo "🧹 Cleaning up any existing emulator processes..."
pkill -f "firebase.*emulators" || true

# Start the emulator suite
echo "🚀 Starting emulators..."
firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data 