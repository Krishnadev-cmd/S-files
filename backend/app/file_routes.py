"""
File upload and management routes
"""
import os
import uuid
import hashlib
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
import mimetypes
from datetime import datetime

from .auth import get_current_active_user
from .database import get_db
from .models import User, File as FileModel, Folder
from .schemas import (
    FileResponse, FileCreate, FileUpdate, FolderCreate, FolderResponse, 
    FolderUpdate, SearchQuery, SearchResponse, UploadResponse, BulkUploadResponse
)

router = APIRouter(prefix="/files", tags=["files"])

# Storage configuration
UPLOAD_DIRECTORY = os.getenv("UPLOAD_DIRECTORY", "./uploads")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "104857600"))  # 100MB default

# Ensure upload directory exists
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

def calculate_file_hash(file_content: bytes) -> str:
    """Calculate SHA-256 hash of file content"""
    return hashlib.sha256(file_content).hexdigest()

def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename to prevent conflicts"""
    file_extension = os.path.splitext(original_filename)[1]
    unique_id = str(uuid.uuid4())
    return f"{unique_id}{file_extension}"

def get_file_path(user_id: int, filename: str) -> str:
    """Generate file path for storage"""
    user_dir = os.path.join(UPLOAD_DIRECTORY, f"user_{user_id}")
    os.makedirs(user_dir, exist_ok=True)
    return os.path.join(user_dir, filename)

@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    folder_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """Upload a single file"""
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="No user found in the database.")
    
    # Check file size
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE} bytes"
        )
    
    # Check storage quota
    if current_user.storage_used + (file.size or 0) > current_user.storage_quota:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Storage quota exceeded"
        )
    
    # Validate folder if provided
    if folder_id:
        folder = db.query(Folder).filter(
            Folder.id == folder_id,
            Folder.owner_id == current_user.id
        ).first()
        if not folder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Folder not found"
            )
    
    try:
        # Read file content
        content = await file.read()
        file_hash = calculate_file_hash(content)
        
        # Check for duplicate files
        existing_file = db.query(FileModel).filter(
            FileModel.file_hash == file_hash,
            FileModel.owner_id == current_user.id,
            FileModel.is_deleted == False
        ).first()
        
        if existing_file:
            return UploadResponse(
                file_id=existing_file.id,
                filename=existing_file.original_filename,
                file_size=existing_file.file_size,
                message="File already exists (duplicate detected)"
            )
        
        # Generate unique filename and save file
        unique_filename = generate_unique_filename(file.filename or "unnamed")
        file_path = get_file_path(current_user.id, unique_filename)
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Get content type
        content_type = file.content_type or mimetypes.guess_type(file.filename or "")[0]
        
        # Create file record in database
        db_file = FileModel(
            filename=unique_filename,
            original_filename=file.filename or "unnamed",
            file_path=file_path,
            file_size=len(content),
            content_type=content_type,
            file_hash=file_hash,
            folder_id=folder_id,
            owner_id=current_user.id,
            upload_completed=True
        )
        
        db.add(db_file)
        
        # Update user storage usage
        current_user.storage_used += len(content)
        
        db.commit()
        db.refresh(db_file)
        
        return UploadResponse(
            file_id=db_file.id,
            filename=db_file.original_filename,
            file_size=db_file.file_size,
            message="File uploaded successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File upload failed: {str(e)}"
        )

@router.post("/upload/multiple", response_model=BulkUploadResponse)
async def upload_multiple_files(
    files: List[UploadFile] = File(...),
    folder_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """Upload multiple files"""
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="No user found in the database.")
    
    successful_uploads = []
    failed_uploads = []
    total_size = 0
    
    # Calculate total size
    for file in files:
        if file.size:
            total_size += file.size
    
    # Check storage quota
    if current_user.storage_used + total_size > current_user.storage_quota:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Storage quota would be exceeded"
        )
    
    # Validate folder if provided
    if folder_id:
        folder = db.query(Folder).filter(
            Folder.id == folder_id,
            Folder.owner_id == current_user.id
        ).first()
        if not folder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Folder not found"
            )
    
    for file in files:
        try:
            # Check individual file size
            if file.size and file.size > MAX_FILE_SIZE:
                failed_uploads.append({
                    "filename": file.filename,
                    "error": f"File size exceeds maximum allowed size of {MAX_FILE_SIZE} bytes"
                })
                continue
            
            # Read file content
            content = await file.read()
            file_hash = calculate_file_hash(content)
            
            # Check for duplicate files
            existing_file = db.query(FileModel).filter(
                FileModel.file_hash == file_hash,
                FileModel.owner_id == current_user.id,
                FileModel.is_deleted == False
            ).first()
            
            if existing_file:
                successful_uploads.append(UploadResponse(
                    file_id=existing_file.id,
                    filename=existing_file.original_filename,
                    file_size=existing_file.file_size,
                    message="File already exists (duplicate detected)"
                ))
                continue
            
            # Generate unique filename and save file
            unique_filename = generate_unique_filename(file.filename or "unnamed")
            file_path = get_file_path(current_user.id, unique_filename)
            
            with open(file_path, "wb") as f:
                f.write(content)
            
            # Get content type
            content_type = file.content_type or mimetypes.guess_type(file.filename or "")[0]
            
            # Create file record in database
            db_file = FileModel(
                filename=unique_filename,
                original_filename=file.filename or "unnamed",
                file_path=file_path,
                file_size=len(content),
                content_type=content_type,
                file_hash=file_hash,
                folder_id=folder_id,
                owner_id=current_user.id,
                upload_completed=True
            )
            
            db.add(db_file)
            
            # Update user storage usage
            current_user.storage_used += len(content)
            
            successful_uploads.append(UploadResponse(
                file_id=db_file.id,
                filename=db_file.original_filename,
                file_size=db_file.file_size,
                message="File uploaded successfully"
            ))
            
        except Exception as e:
            failed_uploads.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    db.commit()
    
    return BulkUploadResponse(
        successful_uploads=successful_uploads,
        failed_uploads=failed_uploads,
        total_files=len(files),
        total_size=total_size
    )

@router.get("/", response_model=List[FileResponse])
async def list_files(
    folder_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List files in a folder or root directory"""
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="No user found in the database.")
    
    query = db.query(FileModel).filter(
        FileModel.owner_id == current_user.id,
        FileModel.is_deleted == False
    )
    
    if folder_id is not None:
        query = query.filter(FileModel.folder_id == folder_id)
    else:
        query = query.filter(FileModel.folder_id.is_(None))
    
    files = query.offset(skip).limit(limit).all()
    return [FileResponse.from_orm(file) for file in files]

@router.get("/search", response_model=SearchResponse)
async def search_files(
    query: str = Query(..., min_length=1),
    file_types: Optional[str] = Query(None),
    folder_id: Optional[int] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Search files and folders"""
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="No user found in the database.")
    
    # Parse file types
    file_type_list = []
    if file_types:
        file_type_list = [ft.strip() for ft in file_types.split(",")]
    
    # Build file search query
    file_query = db.query(FileModel).filter(
        FileModel.owner_id == current_user.id,
        FileModel.is_deleted == False
    )
    
    # Add search conditions
    search_conditions = [
        FileModel.original_filename.ilike(f"%{query}%"),
        FileModel.ai_description.ilike(f"%{query}%"),
        FileModel.ai_tags.ilike(f"%{query}%")
    ]
    file_query = file_query.filter(or_(*search_conditions))
    
    # Filter by file types
    if file_type_list:
        type_conditions = [FileModel.content_type.ilike(f"%{ft}%") for ft in file_type_list]
        file_query = file_query.filter(or_(*type_conditions))
    
    # Filter by folder
    if folder_id is not None:
        file_query = file_query.filter(FileModel.folder_id == folder_id)
    
    # Apply sorting
    if sort_order.lower() == "desc":
        file_query = file_query.order_by(getattr(FileModel, sort_by).desc())
    else:
        file_query = file_query.order_by(getattr(FileModel, sort_by))
    
    # Get total count and paginated results
    total_files = file_query.count()
    files = file_query.offset(skip).limit(limit).all()
    
    # Build folder search query
    folder_query = db.query(Folder).filter(
        Folder.owner_id == current_user.id,
        Folder.name.ilike(f"%{query}%")
    )
    
    if folder_id is not None:
        folder_query = folder_query.filter(Folder.parent_id == folder_id)
    
    total_folders = folder_query.count()
    folders = folder_query.offset(skip).limit(limit).all()
    
    return SearchResponse(
        files=[FileResponse.from_orm(file) for file in files],
        folders=[FolderResponse.from_orm(folder) for folder in folders],
        total_files=total_files,
        total_folders=total_folders,
        query=query
    )

@router.get("/{file_id}", response_model=FileResponse)
async def get_file(
    file_id: int,
    db: Session = Depends(get_db)
):
    """Get file information"""
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="No user found in the database.")
    
    file = db.query(FileModel).filter(
        FileModel.id == file_id,
        FileModel.owner_id == current_user.id,
        FileModel.is_deleted == False
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Update last accessed time
    file.last_accessed = datetime.utcnow()
    db.commit()
    
    return FileResponse.from_orm(file)

@router.get("/{file_id}/download")
async def download_file(
    file_id: int,
    db: Session = Depends(get_db)
):
    """Download a file"""
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="No user found in the database.")
    
    file = db.query(FileModel).filter(
        FileModel.id == file_id,
        FileModel.owner_id == current_user.id,
        FileModel.is_deleted == False
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    if not os.path.exists(file.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on disk"
        )
    
    # Update last accessed time
    file.last_accessed = datetime.utcnow()
    db.commit()
    
    def iterfile(file_path: str):
        with open(file_path, "rb") as f:
            while chunk := f.read(8192):
                yield chunk
    
    return StreamingResponse(
        iterfile(file.file_path),
        media_type=file.content_type or "application/octet-stream",
        headers={
            "Content-Disposition": f"attachment; filename={file.original_filename}"
        }
    )

@router.put("/{file_id}", response_model=FileResponse)
async def update_file(
    file_id: int,
    file_update: FileUpdate,
    db: Session = Depends(get_db)
):
    """Update file metadata"""
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="No user found in the database.")
    
    file = db.query(FileModel).filter(
        FileModel.id == file_id,
        FileModel.owner_id == current_user.id,
        FileModel.is_deleted == False
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Update fields
    if file_update.filename is not None:
        file.original_filename = file_update.filename
    if file_update.folder_id is not None:
        # Validate folder
        if file_update.folder_id > 0:
            folder = db.query(Folder).filter(
                Folder.id == file_update.folder_id,
                Folder.owner_id == current_user.id
            ).first()
            if not folder:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Folder not found"
                )
        file.folder_id = file_update.folder_id if file_update.folder_id > 0 else None
    if file_update.is_public is not None:
        file.is_public = file_update.is_public
    
    file.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(file)
    
    return FileResponse.from_orm(file)

@router.delete("/{file_id}")
async def delete_file(
    file_id: int,
    db: Session = Depends(get_db)
):
    """Delete a file (soft delete)"""
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="No user found in the database.")
    
    file = db.query(FileModel).filter(
        FileModel.id == file_id,
        FileModel.owner_id == current_user.id,
        FileModel.is_deleted == False
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Soft delete
    file.is_deleted = True
    file.updated_at = datetime.utcnow()
    
    # Update user storage usage
    current_user.storage_used -= file.file_size
    if current_user.storage_used < 0:
        current_user.storage_used = 0
    
    db.commit()
    
    return {"message": "File deleted successfully"}
