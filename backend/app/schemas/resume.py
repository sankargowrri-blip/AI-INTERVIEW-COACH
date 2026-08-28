from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResumeBase(BaseModel):
    file_name: str

class ResumeCreate(ResumeBase):
    user_id: int
    file_path: str
    content: Optional[str] = None

class Resume(ResumeBase):
    id: int
    user_id: int
    file_path: str
    content: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True
