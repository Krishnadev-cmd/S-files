from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os

from .database import get_db, engine
from .models import Base, User, File, Folder

# Create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Personal Cloud Storage API",
    description="AI-powered personal cloud storage with smart features",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:3000",  # Next.js development server
    "http://127.0.0.1:3000",
    "http://frontend:3000",   # Docker container
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {
        "message": "Personal Cloud Storage API is running!",
        "features": [
            "File upload/download",
            "AI-powered search",
            "Smart tagging",
            "Secure sharing"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for Docker"""
    return {"status": "healthy", "service": "fastapi-backend"}

@app.get("/api/stats")
async def get_stats(db: Session = Depends(get_db)):
    """Get basic system statistics"""
    try:
        user_count = db.query(User).count()
        file_count = db.query(File).count()
        folder_count = db.query(Folder).count()
        
        return {
            "users": user_count,
            "files": file_count,
            "folders": folder_count,
            "database": "connected"
        }
    except Exception as e:
        return {
            "error": str(e),
            "database": "disconnected"
        }