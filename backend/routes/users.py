from fastapi import APIRouter, HTTPException, Depends, status
from firebase_admin import auth, firestore
from typing import Dict, Any
from datetime import datetime

from models import UserCreateRequest, UserUpdateRequest, UserPreferences, ApiResponse
from auth import get_current_user
from config import get_firestore_client

router = APIRouter(prefix="/v1/users", tags=["users"])

def get_db():
    """Get Firestore client instance"""
    return get_firestore_client()

@router.get("/me", response_model=ApiResponse)
async def get_current_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get the current user's profile from Firestore
    """
    try:
        db = get_db()
        user_doc = db.collection('users').document(current_user['uid']).get()
        
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        user_data = user_doc.to_dict()
        
        # Convert Firestore timestamp to datetime
        if 'created_at' in user_data and user_data['created_at']:
            user_data['created_at'] = user_data['created_at'].isoformat()
        
        return ApiResponse(data=user_data, message="User profile retrieved successfully")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user profile: {str(e)}"
        )

@router.post("/me", response_model=ApiResponse)
async def create_user_profile(
    user_data: UserCreateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Create a user profile in Firestore (usually called after registration)
    """
    try:
        # Check if user profile already exists
        db = get_db()
        user_doc_ref = db.collection('users').document(current_user['uid'])
        user_doc = user_doc_ref.get()
        
        if user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User profile already exists"
            )
        
        # Create user profile
        profile_data = {
            'uid': current_user['uid'],
            'email': current_user['email'],
            'display_name': user_data.display_name or current_user.get('display_name'),
            'created_at': firestore.SERVER_TIMESTAMP,
            'preferences': user_data.preferences.dict() if user_data.preferences else {'language': 'en-US'},
        }
        
        user_doc_ref.set(profile_data)
        
        # Fetch the created document to return it
        created_doc = user_doc_ref.get()
        created_data = created_doc.to_dict()
        
        if 'created_at' in created_data and created_data['created_at']:
            created_data['created_at'] = created_data['created_at'].isoformat()
        
        return ApiResponse(data=created_data, message="User profile created successfully")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user profile: {str(e)}"
        )

@router.put("/me", response_model=ApiResponse)
async def update_user_profile(
    user_data: UserUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update the current user's profile in Firestore
    """
    try:
        db = get_db()
        user_doc_ref = db.collection('users').document(current_user['uid'])
        user_doc = user_doc_ref.get()
        
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Prepare update data
        update_data = {}
        
        if user_data.display_name is not None:
            update_data['display_name'] = user_data.display_name
        
        if user_data.preferences is not None:
            update_data['preferences'] = user_data.preferences.dict()
        
        if update_data:
            update_data['updated_at'] = firestore.SERVER_TIMESTAMP
            user_doc_ref.update(update_data)
        
        # Fetch the updated document
        updated_doc = user_doc_ref.get()
        updated_data = updated_doc.to_dict()
        
        # Convert timestamps
        for field in ['created_at', 'updated_at']:
            if field in updated_data and updated_data[field]:
                updated_data[field] = updated_data[field].isoformat()
        
        return ApiResponse(data=updated_data, message="User profile updated successfully")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user profile: {str(e)}"
        )

@router.delete("/me", response_model=ApiResponse)
async def delete_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Delete the current user's profile and Firebase Auth account
    """
    try:
        # Delete user profile from Firestore
        db = get_db()
        user_doc_ref = db.collection('users').document(current_user['uid'])
        user_doc = user_doc_ref.get()
        
        if user_doc.exists:
            user_doc_ref.delete()
        
        # Delete user from Firebase Auth
        auth.delete_user(current_user['uid'])
        
        return ApiResponse(message="User account deleted successfully")
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user account: {str(e)}"
        )

@router.get("/me/preferences", response_model=ApiResponse)
async def get_user_preferences(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get the current user's preferences
    """
    try:
        db = get_db()
        user_doc = db.collection('users').document(current_user['uid']).get()
        
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        user_data = user_doc.to_dict()
        preferences = user_data.get('preferences', {'language': 'en-US'})
        
        return ApiResponse(data=preferences, message="User preferences retrieved successfully")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user preferences: {str(e)}"
        )

@router.put("/me/preferences", response_model=ApiResponse)
async def update_user_preferences(
    preferences: UserPreferences,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update the current user's preferences
    """
    try:
        db = get_db()
        user_doc_ref = db.collection('users').document(current_user['uid'])
        user_doc = user_doc_ref.get()
        
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Update preferences
        user_doc_ref.update({
            'preferences': preferences.dict(),
            'updated_at': firestore.SERVER_TIMESTAMP,
        })
        
        return ApiResponse(data=preferences.dict(), message="User preferences updated successfully")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user preferences: {str(e)}"
        ) 