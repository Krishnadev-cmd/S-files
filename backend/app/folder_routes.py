"""
Folder management routes
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime

from .database import get_db
from .models import User, Folder
from .schemas import FolderCreate, FolderResponse, FolderUpdate

router = APIRouter(prefix="/folders", tags=["folders"])

@router.post("/", response_model=FolderResponse)
async def create_folder(
    folder_data: FolderCreate,
    db: Session = Depends(get_db)
):
    """Create a new folder"""
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="No user found in the database.")
    
    # Validate parent folder if provided
    if folder_data.parent_id:
        parent_folder = db.query(Folder).filter(
            Folder.id == folder_data.parent_id,
            Folder.owner_id == current_user.id
        ).first()
        if not parent_folder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent folder not found"
            )
    
    # Check if folder with same name already exists in parent directory
    existing_folder = db.query(Folder).filter(
        Folder.name == folder_data.name,
        Folder.parent_id == folder_data.parent_id,
        Folder.owner_id == current_user.id
    ).first()
    
    if existing_folder:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A folder with this name already exists in this location"
        )
    
    # Create folder path
    if folder_data.parent_id:
        parent = db.query(Folder).filter(Folder.id == folder_data.parent_id).first()
        folder_path = f"{parent.path}/{folder_data.name}" if parent else folder_data.name
    else:
        folder_path = folder_data.name
    
    # Create folder
    db_folder = Folder(
        name=folder_data.name,
        path=folder_path,
        parent_id=folder_data.parent_id,
        owner_id=current_user.id
    )
    
    db.add(db_folder)
    db.commit()
    db.refresh(db_folder)
    
    return FolderResponse.from_orm(db_folder)

@router.get("/", response_model=List[FolderResponse])
async def list_folders(
    parent_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List folders in a parent directory"""
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="No user found in the database.")
    
    query = db.query(Folder).filter(Folder.owner_id == current_user.id)
    
    if parent_id is not None:
        query = query.filter(Folder.parent_id == parent_id)
    else:
        query = query.filter(Folder.parent_id.is_(None))
    
    folders = query.offset(skip).limit(limit).all()
    return [FolderResponse.from_orm(folder) for folder in folders]

@router.get("/{folder_id}", response_model=FolderResponse)
async def get_folder(
    folder_id: int,
    db: Session = Depends(get_db)
):
    """Get folder information"""
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="No user found in the database.")
    
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id
    ).first()
    
    if not folder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folder not found"
        )
    
    return FolderResponse.from_orm(folder)

@router.get("/{folder_id}/breadcrumb")
async def get_folder_breadcrumb(
    folder_id: int,
    db: Session = Depends(get_db)
):
    """Get folder breadcrumb path"""
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="No user found in the database.")
    
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id
    ).first()
    
    if not folder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folder not found"
        )
    
    # Build breadcrumb
    breadcrumb = []
    current_folder = folder
    
    while current_folder:
        breadcrumb.insert(0, {
            "id": current_folder.id,
            "name": current_folder.name,
            "path": current_folder.path
        })
        
        if current_folder.parent_id:
            current_folder = db.query(Folder).filter(
                Folder.id == current_folder.parent_id
            ).first()
        else:
            current_folder = None
    
    return {"breadcrumb": breadcrumb}

@router.put("/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: int,
    folder_update: FolderUpdate,
    db: Session = Depends(get_db)
):
    """Update folder metadata"""
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="No user found in the database.")
    
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id
    ).first()
    
    if not folder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folder not found"
        )
    
    # Update fields
    if folder_update.name is not None:
        # Check if folder with new name already exists in same parent directory
        existing_folder = db.query(Folder).filter(
            Folder.name == folder_update.name,
            Folder.parent_id == folder.parent_id,
            Folder.owner_id == current_user.id,
            Folder.id != folder_id
        ).first()
        
        if existing_folder:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A folder with this name already exists in this location"
            )
        
        folder.name = folder_update.name
        
        # Update path
        if folder.parent_id:
            parent = db.query(Folder).filter(Folder.id == folder.parent_id).first()
            folder.path = f"{parent.path}/{folder.name}" if parent else folder.name
        else:
            folder.path = folder.name
    
    folder.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(folder)
    
    return FolderResponse.from_orm(folder)

@router.delete("/{folder_id}")
async def delete_folder(
    folder_id: int,
    force: bool = Query(False),
    db: Session = Depends(get_db)
):
    """Delete a folder"""
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="No user found in the database.")
    
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id
    ).first()
    
    if not folder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folder not found"
        )
    
    # Check if folder has children
    has_children = db.query(Folder).filter(Folder.parent_id == folder_id).first()
    if has_children and not force:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Folder contains subfolders. Use force=true to delete recursively."
        )
    
    # Check if folder has files
    from .models import File as FileModel
    has_files = db.query(FileModel).filter(
        FileModel.folder_id == folder_id,
        FileModel.is_deleted == False
    ).first()
    if has_files and not force:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Folder contains files. Use force=true to delete all contents."
        )
    
    if force:
        # Delete all files in folder
        files_to_delete = db.query(FileModel).filter(
            FileModel.folder_id == folder_id,
            FileModel.is_deleted == False
        ).all()
        
        for file in files_to_delete:
            file.is_deleted = True
            file.updated_at = datetime.utcnow()
        
        # Delete all subfolders recursively
        def delete_subfolders(parent_id):
            subfolders = db.query(Folder).filter(Folder.parent_id == parent_id).all()
            for subfolder in subfolders:
                delete_subfolders(subfolder.id)
                db.delete(subfolder)
        
        delete_subfolders(folder_id)
    
    # Delete the folder
    db.delete(folder)
    db.commit()
    
    return {"message": "Folder deleted successfully"}
