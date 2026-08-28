from pydantic import BaseModel
from typing import Optional, Any, Dict

class ProgressBase(BaseModel):
    total_interviews: int = 0
    average_score: int = 0
    skill_breakdown: Optional[Dict[str, Any]] = None

class ProgressUpdate(ProgressBase):
    pass

class Progress(ProgressBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
