from pydantic import BaseModel
from typing import Optional

class QuestionBase(BaseModel):
    text: str
    type: Optional[str] = None
    question_number: Optional[int] = None
    question_category: Optional[str] = None
    is_follow_up: bool = False
    order: Optional[int] = None

class QuestionCreate(QuestionBase):
    interview_id: int

class Question(QuestionBase):
    id: int
    interview_id: int

    class Config:
        from_attributes = True
