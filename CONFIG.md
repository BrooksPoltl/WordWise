# WordWise Configuration Guide

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `wordwise-[your-name]` (or any unique name)
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Authentication
1. In Firebase Console, go to Authentication > Sign-in method
2. Enable Email/Password provider
3. Enable Google provider:
   - Add your domain (localhost:5173 for development)
   - Download the configuration

### 3. Create Firestore Database
1. In Firebase Console, go to Firestore Database
2. Click "Create database"
3. Start in test mode (we'll add security rules later)
4. Choose a location close to your users

### 4. Set up Security Rules
1. Go to Firestore Database > Rules
2. Replace the default rules with the content from `firestore.rules`
3. Publish the rules

## Environment Variables

### Frontend (.env)
Create a `.env` file in the `frontend` directory with:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_API_URL=http://localhost:8000
```

To get these values:
1. Go to Firebase Console > Project Settings
2. Scroll down to "Your apps"
3. Click on the web app (</> icon) or add a new web app
4. Copy the configuration values

### Backend (.env)
Create a `.env` file in the `backend` directory with:

```env
# Firebase Admin Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=path/to/serviceAccountKey.json

# CORS Configuration
CORS_ORIGINS=http://localhost:8080,http://localhost:5002

# Development flag
DEV_MODE=true
```

For Firebase Admin SDK:
1. Go to Firebase Console > Project Settings > Service accounts
2. Click "Generate new private key"
3. Download the JSON file and place it in your backend directory
4. Update the path in your .env file

## Development Setup

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## Security Considerations

1. **Never commit .env files** - They contain sensitive information
2. **Use different Firebase projects** for development and production
3. **Regularly rotate API keys** in production
4. **Enable Firebase App Check** for production to prevent abuse
5. **Set up proper CORS origins** for production

## Firestore Collections Structure

### Users Collection (`/users/{userId}`)
```json
{
  "uid": "firebase_user_uid",
  "email": "user@example.com",
  "displayName": "User Name",
  "createdAt": "timestamp",
  "preferences": {
    "language": "en-US"
  }
}
```

### Security Rules
- Users can only read/write their own profile
- All operations require authentication
- Future collections (documents, suggestions) follow the same pattern

## API Endpoints

### Authentication Required
All endpoints require a valid Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

### User Management
- `GET /v1/users/me` - Get current user profile
- `POST /v1/users/me` - Create user profile
- `PUT /v1/users/me` - Update user profile
- `DELETE /v1/users/me` - Delete user account

### User Preferences
- `GET /v1/users/me/preferences` - Get user preferences
- `PUT /v1/users/me/preferences` - Update user preferences

## Testing

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

## Deployment

### Frontend (Netlify/Vercel)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in deployment platform
4. Update CORS_ORIGINS in backend

### Backend (Railway/Heroku)
1. Set environment variables
2. Upload service account key securely
3. Update CORS_ORIGINS to include frontend domain
4. Deploy with Python buildpack

## Troubleshooting

### Common Issues

1. **Firebase initialization error**
   - Check if all environment variables are set
   - Verify Firebase project configuration

2. **CORS errors**
   - Add your domain to CORS_ORIGINS
   - Check if the frontend URL matches

3. **Authentication errors**
   - Verify Firebase ID token is being sent
   - Check if user has proper permissions

4. **Firestore permission denied**
   - Verify security rules are deployed
   - Check if user is authenticated
   - Ensure user is accessing their own data

### Development Mode
For local development without service account:
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run `firebase login`
3. Run `firebase emulators:start --project=project-name` for local Firebase emulation
4. Update API URL to point to emulators 