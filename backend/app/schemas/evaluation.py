from pydantic import BaseModel
from typing import Optional, Any, Dict

class EvaluationBase(BaseModel):
    score: float
    technical_accuracy: Optional[float] = None
    communication: Optional[float] = None
    grammar: Optional[float] = None
    fluency: Optional[float] = None
    filler_words: Optional[int] = None
    feedback: str
    suggestions: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None

class EvaluationCreate(EvaluationBase):
    answer_id: int

class Evaluation(EvaluationBase):
    id: int
    answer_id: int

    class Config:
        from_attributes = True
