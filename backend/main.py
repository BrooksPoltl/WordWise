from typing import Dict, Any
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase
if not firebase_admin._apps:
    firebase_key_path: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
    if firebase_key_path and os.path.exists(firebase_key_path):
        cred = credentials.Certificate(firebase_key_path)
        firebase_admin.initialize_app(cred)
    else:
        # For development without service account key
        firebase_admin.initialize_app()

db = firestore.client()

app: FastAPI = FastAPI(title="WordWise API", version="1.0.0")

# CORS middleware
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/v1/users")
async def create_user(user_data: Dict[str, str]) -> Dict[str, Any]:
    try:
        name: str = user_data.get("name", "").strip()
        email: str = user_data.get("email", "").strip()
        
        if not name or not email:
            raise HTTPException(status_code=400, detail="Name and email are required")
        
        # Create user document in Firestore
        user_ref = db.collection('users').document()
        user_doc = {
            "name": name,
            "email": email,
            "created_at": firestore.SERVER_TIMESTAMP
        }
        user_ref.set(user_doc)
        
        return {
            "id": user_ref.id,
            "name": name,
            "email": email
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@app.get("/v1/users")
async def get_users() -> Dict[str, Any]:
    try:
        users_ref = db.collection('users')
        users = []
        for doc in users_ref.stream():
            user_data = doc.to_dict()
            users.append({
                "id": doc.id,
                "name": user_data.get("name"),
                "email": user_data.get("email")
            })
        return {"users": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.get("/")
async def root() -> Dict[str, str]:
    return {"message": "WordWise API with Firebase is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 