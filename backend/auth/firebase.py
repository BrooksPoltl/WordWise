import logging
from fastapi import HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from typing import Dict, Any

# Configure logging
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer()

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """
    Verify Firebase ID token and return user information
    """
    token = credentials.credentials
    logger.debug(f"Authenticating request to {request.url.path}")
    
    try:
        logger.debug("Attempting to verify Firebase ID token")
        # Verify the ID token
        decoded_token = auth.verify_id_token(token)
        logger.debug(f"Token verified successfully for user {decoded_token['uid']}")
        
        # Get user info from Firebase Auth
        logger.debug(f"Fetching user record for uid: {decoded_token['uid']}")
        user_record = auth.get_user(decoded_token['uid'])
        logger.debug(f"User record fetched successfully: {user_record.uid}")
        
        user_info = {
            'uid': decoded_token['uid'],
            'email': decoded_token.get('email'),
            'email_verified': decoded_token.get('email_verified', False),
            'display_name': user_record.display_name,
        }
        logger.info(f"Authentication successful for user {user_info['email']}")
        return user_info
        

    except auth.ExpiredIdTokenError:
        logger.error("Expired ID token provided", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ID token has expired. Please reauthenticate",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.RevokedIdTokenError:
        logger.error("Revoked ID token provided", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ID token has been revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.InvalidIdTokenError:
        logger.error("Invalid ID token provided", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired ID token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.UserNotFoundError:
        logger.error(f"User not found in Firebase", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        ) 