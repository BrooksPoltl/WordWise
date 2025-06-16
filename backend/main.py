import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from config import initialize_firebase, settings
from routes import users_router

# Configure logging
logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    # Initialize Firebase first
    logger.info("Initializing Firebase")
    initialize_firebase()

    # Create FastAPI app
    app = FastAPI(
        title="WordWise API",
        description="AI-powered writing assistant API with Firebase authentication",
        version="1.0.0"
    )

    # CORS middleware
    logger.info(f"Configuring CORS with origins: {settings.cors_origins}")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request logging middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        logger.debug(f"Incoming {request.method} request to {request.url.path}")
        response = await call_next(request)
        logger.debug(f"Completed {request.method} request to {request.url.path} with status {response.status_code}")
        return response

    # Health check endpoint
    @app.get("/health")
    async def health_check():
        """Health check endpoint"""
        logger.debug("Health check requested")
        return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

    # Include routers
    logger.info("Registering API routes")
    app.include_router(users_router)

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting server on {settings.host}:{settings.port}")
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload
    ) 