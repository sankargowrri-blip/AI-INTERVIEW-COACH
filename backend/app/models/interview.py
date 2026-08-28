from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    title = Column(String)
    job_description = Column(Text)
    role = Column(String)
    experience_level = Column(String)  # FRESHER, EXPERIENCED
    difficulty = Column(String)  # EASY, MEDIUM, HARD
    interview_type = Column(String)
    company = Column(String)
    question_count = Column(Integer, default=5)
    duration = Column(Integer)  # in minutes
    overall_score = Column(Float)
    result_label = Column(String)
    status = Column(String, default="pending")  # pending, ongoing, completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="interviews")
    resume = relationship("Resume", back_populates="interviews")
    questions = relationship("Question", back_populates="interview")
    result = relationship("InterviewResult", back_populates="interview", uselist=False)
