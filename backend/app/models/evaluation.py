from sqlalchemy import Column, Integer, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)
    answer_id = Column(Integer, ForeignKey("answers.id"))
    score = Column(Float)
    technical_accuracy = Column(Float)
    communication = Column(Float)
    grammar = Column(Float)
    fluency = Column(Float)
    filler_words = Column(Integer)
    feedback = Column(Text)
    suggestions = Column(Text)
    metrics = Column(JSON)  # Detailed metrics like clarity, relevance, etc.

    # Relationships
    answer = relationship("Answer", back_populates="evaluation")
