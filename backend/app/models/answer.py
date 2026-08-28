from sqlalchemy import Column, Integer, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.database.session import Base

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    text = Column(Text, nullable=False)
    audio_path = Column(Text)  # If voice recording is saved
    duration = Column(Float)  # Time taken to answer

    # Relationships
    question = relationship("Question", back_populates="answer")
    evaluation = relationship("Evaluation", back_populates="answer", uselist=False)
