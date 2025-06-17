# 🔥 Firebase Emulator Setup Guide

This guide will help you set up and run WordWise entirely on Firebase emulators for local development. No real Firebase project required!

## 🚀 Quick Start

1. **Install dependencies and setup emulator:**
   ```bash
   npm run setup
   ```

2. **Start the full development environment:**
   ```bash
   npm run dev
   ```

That's it! Your app will be running with:
- 🔧 Frontend: http://localhost:5173
- 🔥 Firebase Emulator UI: http://localhost:4000
- 🔐 Auth Emulator: http://localhost:9099
- 💾 Firestore Emulator: http://localhost:8080

## 📋 Prerequisites

- Node.js (v20 or higher)
- Firebase CLI (will be installed automatically)

## 🔧 Manual Setup

If the quick start doesn't work, follow these manual steps:

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Setup Environment File

```bash
cp env.example .env
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Emulators
```bash
npm run emulator
```

## 🎯 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run setup` | One-time setup for emulator environment |
| `npm run dev` | Start full development environment (emulators + dev server) |
| `npm run emulator` | Start only Firebase emulators |
| `npm run emulator:clean` | Start emulators with fresh data |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 🏗️ Architecture

WordWise is now a **frontend-only** application that connects directly to Firebase services:

```
WordWise/
├── src/                 # React application source
│   ├── components/      # React components  
│   ├── store/          # Zustand state management
│   ├── config/         # Firebase configuration
│   └── types/          # TypeScript definitions
├── public/             # Static assets
├── firebase.json       # Firebase configuration
├── firestore.rules     # Firestore security rules
└── package.json        # Dependencies and scripts
```

## 🏗️ Emulator Configuration

### Ports Used
- **Auth Emulator**: 9099
- **Firestore Emulator**: 8080
- **Hosting Emulator**: 5002
- **Emulator UI**: 4000
- **Dev Server**: 5173

### Data Persistence
Emulator data is automatically saved to `./emulator-data` and restored on restart. To start fresh:
```bash
npm run emulator:clean
```

## 🔐 Authentication in Emulator

The auth emulator allows you to:
- Create test users without real email verification
- Sign in with any email/password combination
- Test Google sign-in with fake accounts
- No real authentication providers needed!

### Test Users
You can create test users directly in the emulator UI at http://localhost:4000

## 💾 Firestore in Emulator

- All data is stored locally
- Security rules are enforced just like production
- Data persists between emulator restarts (unless using clean start)
- Perfect for testing without affecting production data

## 🛠️ Development Workflow

1. **Start development environment:**
   ```bash
   npm run dev
   ```

2. **Make changes to your code** - Vite hot-reloads automatically

3. **Test with emulator data** - create test users, documents, etc.

4. **View emulator state** at http://localhost:4000

5. **Reset data if needed:**
   ```bash
   npm run emulator:clean
   ```

## 🔄 Switching Between Emulator and Production

### For Emulator (Development)
```bash
# .env
VITE_USE_FIREBASE_EMULATOR=true
```

### For Production
```bash
# .env
VITE_USE_FIREBASE_EMULATOR=false
VITE_FIREBASE_API_KEY=your_real_api_key
# ... other real Firebase config
```

## 🐛 Troubleshooting

### Emulator Won't Start
```bash
# Kill any hanging processes
pkill -f "firebase.*emulators"

# Try starting again
npm run emulator:clean
```

### Port Conflicts
If ports are in use, modify `firebase.json`:
```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "ui": { "port": 4000 }
  }
}
```

### Frontend Can't Connect to Emulator
Check `.env`:
```bash
VITE_USE_FIREBASE_EMULATOR=true
```

## 📊 Emulator Features

### Authentication Emulator
- Test email/password auth
- Test Google sign-in
- Custom claims testing
- User management UI

### Firestore Emulator
- Real-time listeners work
- Security rules testing
- Data import/export
- Query testing

### Emulator UI
- View all emulator data
- Trigger functions (if added)
- Monitor logs
- Import/export data

## 🔗 Useful Links

- **Your App**: http://localhost:5173
- **Emulator UI**: http://localhost:4000
- **Auth Emulator**: http://localhost:9099
- **Firestore Emulator**: http://localhost:8080

## 📝 Notes

- Emulator data is saved to `./emulator-data/` directory
- No internet connection required for development
- Perfect for CI/CD testing
- Security rules are fully supported
- All Firebase SDK features work as expected
- **Frontend-only architecture** - no backend server needed! 