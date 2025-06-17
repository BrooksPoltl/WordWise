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
    """Initialize Firebase Admin SDK with emulator support"""
    if not firebase_admin._apps:
        try:
            use_emulator = os.getenv('USE_FIREBASE_EMULATOR', 'true').lower() == 'true'
            project_id = os.getenv("FIREBASE_PROJECT_ID", "demo-wordwise")
            
            if use_emulator:
                logger.info("🔧 Initializing Firebase with Emulator support")
                
                # Set emulator environment variables
                os.environ["FIRESTORE_EMULATOR_HOST"] = "127.0.0.1:8080"
                os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = "127.0.0.1:9099"
                
                # Initialize with minimal credentials for emulator
                firebase_admin.initialize_app(options={
                    'projectId': project_id,
                })
                logger.info(f"Firebase emulator initialized successfully for project: {project_id}")
            else:
                logger.info("🚀 Initializing Firebase with production credentials")
                
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
                    'projectId': project_id,
                })
                logger.info("Firebase production initialized successfully")
                
        except Exception as e:
            logger.error(f"Firebase initialization error: {str(e)}", exc_info=True)
            # Fallback initialization for development
            logger.warning("Falling back to minimal Firebase initialization")
            firebase_admin.initialize_app(options={
                'projectId': os.getenv("FIREBASE_PROJECT_ID", "demo-wordwise"),
            })

def get_firestore_client():
    """Get Firestore client instance"""
    return firestore.client()

# Server settings
class Settings:
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", 8000))
    reload: bool = os.getenv("DEV_MODE", "true").lower() == "true"
    cors_origins: list = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5002,http://localhost:4000").split(",")
    use_emulator: bool = os.getenv("USE_FIREBASE_EMULATOR", "true").lower() == "true"

settings = Settings() 