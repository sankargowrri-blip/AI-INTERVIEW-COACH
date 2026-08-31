from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class InterviewBase(BaseModel):
    title: Optional[str] = None
    job_description: Optional[str] = None
    role: Optional[str] = None
    experience_level: Optional[str] = None
    difficulty: Optional[str] = None
    interview_type: Optional[str] = None
    company: Optional[str] = None
    question_count: int = 5
    duration: Optional[int] = None

class InterviewCreate(InterviewBase):
    resume_id: Optional[int] = None

class InterviewUpdate(InterviewBase):
    status: Optional[str] = None

class Interview(InterviewBase):
    id: int
    user_id: int
    resume_id: Optional[int] = None
    status: str
    overall_score: Optional[float] = None
    result_label: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class InterviewResultBase(BaseModel):
    overall_score: float
    answer_quality_score: float
    communication_score: float
    performance_score: float
    role_knowledge_score: float
    technical_score: float
    summary: str
    strengths: List[str]
    weaknesses: List[str]
    improvement_areas: List[str]
    key_points: List[str]
    recommendations: List[str]
    result_label: str

class InterviewResult(InterviewResultBase):
    id: int
    interview_id: int

    class Config:
        from_attributes = True
