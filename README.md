# 📝 WordWise

**AI-powered writing assistant** built with React, TypeScript, and Firebase. Features real-time collaboration, intelligent suggestions, and seamless Firebase emulator integration for development.

## ✨ Features

- 🔐 **Firebase Authentication** - Secure user management with email/password and Google sign-in
- 💾 **Firestore Database** - Real-time data storage and synchronization
- 🎨 **Modern UI** - Clean, responsive interface built with React and Tailwind CSS
- 🔥 **Firebase Emulator Support** - Complete local development environment
- ⚡ **Fast Development** - Vite-powered build system with hot reload
- 🛡️ **TypeScript** - Type-safe development experience
- 📱 **Responsive Design** - Works perfectly on desktop and mobile

## 🚀 Quick Start

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd wordwise
   npm install
   ```

2. **Setup Firebase emulator:**
   ```bash
   npm run setup
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - App: http://localhost:5173
   - Firebase Emulator UI: http://localhost:4000

## 🏗️ Architecture

WordWise is a **frontend-only** React application that connects directly to Firebase services:

```
src/
├── components/           # React components
│   ├── AuthWrapper.tsx   # Authentication wrapper
│   ├── Login.tsx         # Login form
│   ├── SignUp.tsx        # Registration form
│   ├── Dashboard.tsx     # User dashboard
│   └── UserProfile.tsx   # Profile management
├── store/               # Zustand state stores
│   ├── authStore.ts     # Authentication state
│   └── userStore.ts     # User data operations
├── config/              # Firebase configuration
├── types/               # TypeScript definitions
└── App.tsx              # Main app component
```

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with emulators |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run emulator` | Start only Firebase emulators |
| `npm run emulator:clean` | Start fresh emulators |
| `npm run setup` | One-time emulator setup |

### Firebase Emulator

The app runs entirely on Firebase emulators for development:

- **Authentication**: http://localhost:9099
- **Firestore**: http://localhost:8080  
- **Emulator UI**: http://localhost:4000

No real Firebase project needed for development! 🎉

## 📦 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Zustand** - State management

### Firebase Services
- **Authentication** - User management
- **Firestore** - NoSQL database
- **Hosting** - Static site hosting (production)

### Development Tools
- **Firebase Emulator Suite** - Local development
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🔐 Environment Configuration

### Development (.env)
```env
# Firebase Emulator (default)
VITE_USE_FIREBASE_EMULATOR=true
VITE_FIREBASE_PROJECT_ID=demo-wordwise

# These can be demo values for emulator
VITE_FIREBASE_API_KEY=demo-api-key
VITE_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Production
For production deployment, set `VITE_USE_FIREBASE_EMULATOR=false` and provide real Firebase configuration values.

## 🔒 Security

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

## 📚 Documentation

- [Emulator Setup Guide](EMULATOR_SETUP.md) - Detailed emulator configuration
- [Firebase Documentation](https://firebase.google.com/docs) - Official Firebase docs
- [React Documentation](https://react.dev) - React framework docs

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com) for the amazing backend services
- [React](https://react.dev) for the powerful UI framework
- [Vite](https://vitejs.dev) for the lightning-fast build tool
- [Tailwind CSS](https://tailwindcss.com) for the utility-first styling
