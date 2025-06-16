# WordWise - AI-Powered Writing Assistant

A Grammarly clone built with React, TypeScript, Firebase, and FastAPI that provides AI-powered writing assistance with real-time grammar checking, style suggestions, and document management.

## 🚀 Features

### Authentication & User Management
- **Firebase Authentication** with email/password and Google OAuth
- **Secure user profiles** stored in Firestore
- **User preferences** for language and writing settings
- **Protected routes** and authenticated API access

### User Interface
- **Responsive design** with Tailwind CSS (mobile-first)
- **Modern authentication** with SignUp/Login components
- **User dashboard** with profile management
- **Real-time error handling** and loading states

### Backend API
- **FastAPI** with Firebase Admin SDK integration
- **JWT authentication** using Firebase ID tokens
- **RESTful API** with user CRUD operations
- **Firestore security rules** for data protection

### Future Features (Planned)
- AI-powered grammar and style checking
- Document management and collaboration
- Real-time writing suggestions
- Advanced analytics and insights

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Zustand** for state management
- **Firebase SDK** for authentication and Firestore

### Backend
- **Python 3.13** with FastAPI
- **Firebase Admin SDK** for authentication
- **Firestore** for data storage
- **Pydantic** for data validation
- **Uvicorn** for ASGI server

### Infrastructure
- **Firebase Authentication** for user management
- **Cloud Firestore** for database
- **Firebase Security Rules** for data protection

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.13+
- Firebase project with Authentication and Firestore enabled
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd WordWise
```

### 2. Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and Google providers)
3. Create a Firestore database
4. Get your Firebase configuration and service account key

See [CONFIG.md](CONFIG.md) for detailed Firebase setup instructions.

### 3. Frontend Setup
```bash
cd frontend
npm install

# Copy environment file and configure
cp env.example .env
# Edit .env with your Firebase configuration
```

### 4. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy environment file and configure
cp env.example .env
# Edit .env with your Firebase configuration
```

### 5. Deploy Firestore Security Rules
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules
```

### 6. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 🔧 Configuration

### Environment Variables

#### Frontend (`.env`)
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:8000
```

#### Backend (`.env`)
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=path/to/serviceAccountKey.json
CORS_ORIGINS=http://localhost:8080,http://localhost:5002
```

See [CONFIG.md](CONFIG.md) for complete configuration details.

## 📚 API Documentation

### Authentication
All API endpoints require a Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

### Endpoints
- `GET /health` - Health check
- `GET /v1/users/me` - Get current user profile
- `POST /v1/users/me` - Create user profile
- `PUT /v1/users/me` - Update user profile
- `DELETE /v1/users/me` - Delete user account
- `GET /v1/users/me/preferences` - Get user preferences
- `PUT /v1/users/me/preferences` - Update user preferences

Interactive API documentation available at `http://localhost:8000/docs` when running the backend.

## 🏗️ Architecture

### Frontend Architecture
```
src/
├── components/           # React components
│   ├── AuthWrapper.tsx   # Authentication wrapper
│   ├── Login.tsx         # Login form
│   ├── SignUp.tsx        # Registration form
│   ├── Dashboard.tsx     # User dashboard
│   └── UserProfile.tsx   # Profile management
├── store/               # Zustand stores
│   ├── authStore.ts     # Authentication state
│   └── userStore.ts     # User data operations
├── types/               # TypeScript type definitions
├── config/              # Firebase configuration
└── App.tsx              # Main app component
```

### Backend Architecture
```
backend/
├── main.py              # FastAPI application setup
├── config.py            # Firebase & app configuration
├── requirements.txt     # Python dependencies
├── env.example          # Environment variables example
├── models/              # Pydantic data models
│   ├── __init__.py
│   └── user.py          # User-related models
├── routes/              # API route handlers
│   ├── __init__.py
│   └── users.py         # User endpoints
└── auth/                # Authentication logic
    ├── __init__.py
    └── firebase.py      # Firebase auth utilities
```

### Database Schema (Firestore)
```
/users/{userId}
{
  uid: string,
  email: string,
  displayName?: string,
  createdAt: timestamp,
  preferences: {
    language: string
  }
}
```

## 🔒 Security

### Authentication
- Firebase Authentication for secure user management
- JWT tokens for API authentication
- Password requirements and email verification

### Data Protection
- Firestore security rules restrict access to user's own data
- HTTPS enforcement for all communications
- Input validation with Pydantic models

### Best Practices
- Environment variables for sensitive configuration
- Separate Firebase projects for development and production
- Regular security rule audits

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test
```

### Backend Testing
```bash
cd backend
python -m pytest
```

### Linting
```bash
# Frontend
cd frontend
npm run lint

# Backend (using flake8)
cd backend
flake8 .
```

## 🚢 Deployment

### Frontend (Netlify/Vercel)
1. Build: `npm run build`
2. Deploy `dist` folder
3. Set environment variables
4. Configure redirects for SPA

### Backend (Railway/Heroku)
1. Set environment variables
2. Upload Firebase service account key
3. Deploy with Python buildpack
4. Update CORS origins

See [CONFIG.md](CONFIG.md) for detailed deployment instructions.

## 📖 User Stories

### Authentication
- ✅ As a new user, I can sign up with email/password
- ✅ As a user, I can sign in with Google OAuth
- ✅ As a user, I can view and edit my profile
- ✅ As a user, I can update my language preferences
- ✅ As a user, I can securely log out

### Future Features
- 📝 Document creation and editing
- 🤖 AI-powered grammar checking
- 📊 Writing analytics and insights
- 👥 Collaboration features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Airbnb ESLint configuration
- Write tests for new features
- Follow PEP8 for Python code
- Keep functions under 200 lines

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues
1. **Firebase initialization error**: Check environment variables
2. **CORS errors**: Verify CORS_ORIGINS configuration
3. **Authentication errors**: Ensure Firebase ID tokens are valid
4. **Permission denied**: Check Firestore security rules

See [CONFIG.md](CONFIG.md) for detailed troubleshooting guide.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the [CONFIG.md](CONFIG.md) for detailed setup instructions
- Review the API documentation at `/docs`

---

**WordWise** - Empowering writers with AI-powered assistance 🚀
