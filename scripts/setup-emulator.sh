#!/bin/bash

# Firebase Emulator Setup Script
echo "🔧 Setting up Firebase Emulator for WordWise..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if we're in a Firebase project
if [ ! -f "firebase.json" ]; then
    echo "❌ firebase.json not found. Please run this script from the project root."
    exit 1
fi

# Login to Firebase (required even for emulator)
echo "🔐 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "Please login to Firebase:"
    firebase login
fi

# Initialize emulator if not already done
if [ ! -f ".firebaserc" ]; then
    echo "🚀 Initializing Firebase project..."
    echo "Please select or create a project for emulator use (you can use demo-wordwise for local development)"
    firebase use --add
fi

# Create environment files if they don't exist
echo "📝 Setting up environment files..."

# Frontend environment
if [ ! -f "frontend/.env" ]; then
    echo "Creating frontend/.env from example..."
    cp frontend/env.example frontend/.env
    echo "✅ Created frontend/.env with emulator defaults"
else
    echo "⚠️  frontend/.env already exists. Make sure VITE_USE_FIREBASE_EMULATOR=true"
fi

# Backend environment
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from example..."
    cp backend/env.example backend/.env
    echo "✅ Created backend/.env with emulator defaults"
else
    echo "⚠️  backend/.env already exists. Make sure USE_FIREBASE_EMULATOR=true"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the emulator suite:"
echo "  npm run emulator"
echo ""
echo "To start the full development environment:"
echo "  npm run dev"
echo ""
echo "Firebase Emulator UI will be available at: http://localhost:4000"
echo "Auth Emulator: http://localhost:9099"
echo "Firestore Emulator: http://localhost:8080" 