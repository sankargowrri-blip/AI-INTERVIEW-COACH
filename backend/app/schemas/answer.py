from pydantic import BaseModel
from typing import Optional, List, Any
from app.schemas.evaluation import Evaluation
from app.schemas.question import Question

class AnswerBase(BaseModel):
    text: str
    audio_path: Optional[str] = None
    duration: Optional[float] = None

class AnswerCreate(AnswerBase):
    question_id: int

class Answer(AnswerBase):
    id: int
    question_id: int

    class Config:
        from_attributes = True

class AnswerResponse(BaseModel):
    transcript: str
    evaluation: Optional[Evaluation] = None
    next_question: Optional[Question] = None
