from sqlalchemy import Column, Integer, String, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.database.session import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"))
    text = Column(Text, nullable=False)
    type = Column(String)  # behavioral, technical, situational
    question_number = Column(Integer)
    question_category = Column(String)
    is_follow_up = Column(Boolean, default=False)
    order = Column(Integer)

    # Relationships
    interview = relationship("Interview", back_populates="questions")
    answer = relationship("Answer", back_populates="question", uselist=False)
