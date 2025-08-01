"""
Database models for personal cloud storage
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import uuid


class User(Base):
    """User account model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Storage quota in bytes (default 5GB)
    storage_quota = Column(BigInteger, default=5368709120)  # 5GB
    storage_used = Column(BigInteger, default=0)
    
    # Relationships
    files = relationship("File", back_populates="owner", cascade="all, delete-orphan")
    folders = relationship("Folder", back_populates="owner", cascade="all, delete-orphan")


class Folder(Base):
    """Folder/Directory model"""
    __tablename__ = "folders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    path = Column(String, nullable=False, index=True)  # Full path like /Documents/Photos
    parent_id = Column(Integer, ForeignKey("folders.id"), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="folders")
    parent = relationship("Folder", remote_side=[id])
    files = relationship("File", back_populates="folder")


class File(Base):
    """File metadata model"""
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)  # User's original filename
    file_path = Column(String, nullable=False)  # Path in MinIO
    file_size = Column(BigInteger, nullable=False)  # Size in bytes
    content_type = Column(String)  # MIME type
    file_hash = Column(String, index=True)  # SHA-256 for duplicate detection
    
    # File organization
    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # AI-generated metadata
    ai_description = Column(Text)  # AI-generated description
    ai_tags = Column(Text)  # JSON array of tags
    thumbnail_path = Column(String)  # Path to thumbnail in MinIO
    
    # File status
    is_public = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)  # Soft delete
    upload_completed = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_accessed = Column(DateTime(timezone=True))
    
    # Relationships
    owner = relationship("User", back_populates="files")
    folder = relationship("Folder", back_populates="files")
    shares = relationship("FileShare", back_populates="file", cascade="all, delete-orphan")


class FileShare(Base):
    """File sharing model"""
    __tablename__ = "file_shares"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    shared_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    shared_with_email = Column(String)  # Can share with non-users
    share_token = Column(String, unique=True, index=True)  # Public link token
    
    # Permissions
    can_view = Column(Boolean, default=True)
    can_download = Column(Boolean, default=True)
    can_edit = Column(Boolean, default=False)
    
    # Expiration
    expires_at = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    file = relationship("File", back_populates="shares")
    shared_by = relationship("User")


class ProcessingQueue(Base):
    """Queue for AI processing tasks"""
    __tablename__ = "processing_queue"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    task_type = Column(String, nullable=False)  # 'thumbnail', 'ai_analysis', 'virus_scan'
    status = Column(String, default="pending")  # 'pending', 'processing', 'completed', 'failed'
    priority = Column(Integer, default=1)  # Higher number = higher priority
    error_message = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    file = relationship("File")
