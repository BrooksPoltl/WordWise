# WordWise

A minimal full-stack application with React + TypeScript frontend and Python FastAPI backend.

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)
- Firebase (planned for auth/real-time features)

### Backend
- Python 3.10+
- FastAPI
- Firebase (Firestore & Auth)
- Firebase Admin SDK

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL
- Git

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)

2. Enable Firestore Database:
   - Go to Firestore Database
   - Create database in test mode (for development)

3. (Optional) Generate service account key:
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Save as `firebase-service-account-key.json`

4. For development, you can run without the service account key (Firebase will use default credentials)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. (Optional) Create a `.env` file:
```bash
FIREBASE_KEY_PATH=/path/to/firebase-service-account-key.json
```
This is only needed if you want to use a service account key.

5. Run the backend:
```bash
python main.py
```

The API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. In a new terminal, navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

1. Open `http://localhost:3000` in your browser
2. Fill out the user creation form with name and email
3. Submit to create a new user in the database

## Project Structure

```
WordWise/
├── backend/              # Python FastAPI backend
│   ├── main.py          # FastAPI application with Firebase
│   ├── requirements.txt # Python dependencies
│   └── env.example      # Environment variables template
├── frontend/            # React frontend application
│   ├── src/             # Frontend source code
│   │   ├── components/  # React components
│   │   ├── store/       # Zustand stores
│   │   ├── types/       # TypeScript type definitions
│   │   ├── App.tsx      # Main App component
│   │   ├── main.tsx     # React entry point
│   │   └── index.css    # Global styles
│   ├── package.json     # Node.js dependencies
│   ├── vite.config.ts   # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS config
│   ├── tsconfig.json    # TypeScript config
│   └── .eslintrc.json   # ESLint configuration
├── scripts/             # Development scripts
│   └── start-dev.sh     # Development server launcher
├── README.md           # Project documentation
└── .gitignore          # Git ignore rules
```

## Development

### Code Quality & Standards

This project enforces strict code quality standards:

**TypeScript/Frontend:**
- **Airbnb ESLint Rules**: Enforced for consistent code style
- **Explicit Types**: All variables, functions, and parameters must have explicit types
- **No `any` Types**: The `@typescript-eslint/no-explicit-any` rule is set to error
- **Strict TypeScript**: Enabled in `tsconfig.json`

**Python/Backend:**
- **PEP8 Style Guide**: Follow Python style conventions
- **Type Annotations**: All functions and variables should have explicit type hints
- **Pydantic Models**: Use for request/response validation

### Scripts

**Frontend:** *(run from `frontend/` directory)*
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Auto-fix ESLint issues

**Backend:**
- `python main.py` - Start FastAPI server
- Visit `/docs` for interactive API documentation

**Development:**
- `./scripts/start-dev.sh` - Start both frontend and backend servers
- Automatically handles process management and cleanup

## Next Steps

This is a minimal boilerplate. Consider adding:
- User authentication (Firebase Auth)
- Input validation and error handling
- Loading states and success messages
- User list display
- Edit/delete user functionality
- Environment-specific configurations
- Tests
- Docker containerization

## Troubleshooting

### Common Issues

1. **Firebase connection errors**: Ensure you have a valid Firebase project and Firestore is enabled
2. **CORS errors**: Check that backend CORS settings allow frontend origin
3. **Module not found errors**: Run `npm install` in `frontend/` and `pip install -r requirements.txt` in `backend/`
4. **Port conflicts**: Ensure ports 3000 and 8000 are available
5. **TypeScript/ESLint errors**: These will resolve after running `npm install` to install dependencies
6. **Firebase authentication errors**: Make sure your service account key path is correct (if using one)

### Development Notes

- The project uses strict TypeScript settings and Airbnb ESLint rules
- All linting errors shown before dependency installation are expected
- Backend uses Firebase Firestore for data storage and authentication
- Frontend state management uses Zustand with explicit typing
- No local database setup required - Firebase handles all data persistence
