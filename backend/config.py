import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    if not firebase_admin._apps:
        try:
            # Try to initialize with service account key if available
            service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")
            if service_account_path and os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
            else:
                # Use default credentials (useful for local development)
                cred = credentials.ApplicationDefault()
            
            firebase_admin.initialize_app(cred, {
                'projectId': os.getenv("FIREBASE_PROJECT_ID"),
            })
        except Exception as e:
            print(f"Firebase initialization error: {e}")
            # Initialize without credentials for development
            firebase_admin.initialize_app()

def get_firestore_client():
    """Get Firestore client instance"""
    return firestore.client()

# Application settings
class Settings:
    def __init__(self):
        self.cors_origins = os.getenv("CORS_ORIGINS", "CORS_ORIGINS=http://localhost:8080,http://localhost:5002").split(",")
        self.cors_origins = [origin.strip() for origin in self.cors_origins]
        self.host = os.getenv("HOST", "0.0.0.0")
        self.port = int(os.getenv("PORT", "8000"))
        self.reload = os.getenv("DEV_MODE", "true").lower() == "true"

settings = Settings() 