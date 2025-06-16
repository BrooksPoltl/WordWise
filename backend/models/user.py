from pydantic import BaseModel, EmailStr
from typing import Optional, Any
from datetime import datetime

class UserPreferences(BaseModel):
    language: str = "en-US"

class UserProfile(BaseModel):
    uid: str
    email: str
    display_name: Optional[str] = None
    created_at: datetime
    preferences: UserPreferences

class UserCreateRequest(BaseModel):
    display_name: Optional[str] = None
    preferences: Optional[UserPreferences] = UserPreferences()

class UserUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    preferences: Optional[UserPreferences] = None

class ApiResponse(BaseModel):
    data: Optional[Any] = None
    message: Optional[str] = None
    error: Optional[str] = None 