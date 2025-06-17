# WordWise Configuration Guide

## Firebase Emulator Setup (Recommended for Development)

WordWise is configured to run entirely on Firebase emulators for local development. No real Firebase project required!

### Quick Setup

```bash
# Install and setup
npm install
npm run setup

# Start development
npm run dev
```

Your app will be available at:
- **App**: http://localhost:5173
- **Firebase Emulator UI**: http://localhost:4000
- **Auth Emulator**: http://localhost:9099
- **Firestore Emulator**: http://localhost:8080

## Environment Configuration

### Development Environment (.env)

The default configuration works with Firebase emulators:

```env
# Firebase Emulator Configuration (default)
VITE_USE_FIREBASE_EMULATOR=true
VITE_FIREBASE_PROJECT_ID=demo-wordwise
VITE_FIREBASE_API_KEY=demo-api-key
VITE_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

These are demo values that work perfectly with the emulator - no need to change them for development!

## Production Setup

For production deployment, you'll need a real Firebase project:

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., `wordwise-prod`)
4. Enable Google Analytics (optional)

### 2. Enable Services
1. **Authentication**: Go to Authentication > Sign-in method
   - Enable Email/Password provider
   - Enable Google provider (optional)
2. **Firestore**: Go to Firestore Database
   - Click "Create database"
   - Start in production mode
   - Choose a location

### 3. Get Configuration
1. Go to Project Settings
2. Scroll to "Your apps"
3. Click web app icon or add new web app
4. Copy the configuration

### 4. Update Environment
Create `.env.production`:
```env
VITE_USE_FIREBASE_EMULATOR=false
VITE_FIREBASE_API_KEY=your_real_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Deploy Security Rules
```bash
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

### 6. Deploy to Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

## Firestore Security Rules

The default security rules ensure users can only access their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection: Only the user can read/write their profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Troubleshooting

### Emulator Issues
```bash
# Kill hanging processes
pkill -f "firebase.*emulators"

# Start fresh
npm run emulator:clean
```

### Connection Issues
- Make sure `VITE_USE_FIREBASE_EMULATOR=true` in your `.env`
- Check that emulators are running on correct ports
- Verify Firebase CLI version compatibility with Node.js

### Port Conflicts
Modify ports in `firebase.json` if needed:
```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "ui": { "port": 4000 }
  }
}
```

## Development vs Production

| Feature | Development (Emulator) | Production |
|---------|----------------------|------------|
| Setup Time | Instant | Requires Firebase project |
| Internet | Not required | Required |
| Data | Local only | Cloud storage |
| Auth | Fake users | Real authentication |
| Cost | Free | Pay-as-you-go |
| Reset | `npm run emulator:clean` | Manual cleanup |

For most development work, the emulator is perfect and much faster than using real Firebase services! 