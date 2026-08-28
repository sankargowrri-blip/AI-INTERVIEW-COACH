import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import Resume as ResumeSchema
from app.utils.file_utils import save_upload_file, ensure_dir

router = APIRouter()

UPLOAD_DIR = "uploads/resumes"

@router.post("/upload", response_model=ResumeSchema)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ensure_dir(UPLOAD_DIR)
    file_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_{file.filename}")
    save_upload_file(file, file_path)
    
    # In a real app, you'd extract text content here
    content = f"Extracted content from {file.filename}" 
    
    db_resume = Resume(
        user_id=current_user.id,
        file_name=file.filename,
        file_path=file_path,
        content=content
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    return db_resume

@router.get("/{id}", response_model=ResumeSchema)
def get_resume(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume
