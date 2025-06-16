import os
import logging
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if os.getenv('DEV_MODE', 'true').lower() == 'true' else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    if not firebase_admin._apps:
        try:
            # Try to initialize with service account key if available
            service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")
            logger.info(f"Attempting to initialize Firebase with service account from: {service_account_path}")
            
            if service_account_path and os.path.exists(service_account_path):
                logger.debug("Service account file found")
                cred = credentials.Certificate(service_account_path)
            else:
                logger.warning("Service account file not found, falling back to default credentials")
                cred = credentials.ApplicationDefault()
            
            firebase_admin.initialize_app(cred, {
                'projectId': os.getenv("FIREBASE_PROJECT_ID"),
            })
            logger.info("Firebase initialized successfully")
        except Exception as e:
            logger.error(f"Firebase initialization error: {str(e)}", exc_info=True)
            # Initialize without credentials for development
            logger.warning("Initializing Firebase without credentials (development mode)")
            firebase_admin.initialize_app()

def get_firestore_client():
    """Get Firestore client instance"""
    return firestore.client()

# Server settings
class Settings:
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", 8000))
    reload: bool = os.getenv("DEV_MODE", "true").lower() == "true"
    cors_origins: list = os.getenv("CORS_ORIGINS", "http://localhost:8080,http://localhost:5002").split(",")

settings = Settings() 