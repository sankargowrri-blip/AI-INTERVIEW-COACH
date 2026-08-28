from sqlalchemy import Column, Integer, ForeignKey, Text, Float, JSON, String
from sqlalchemy.orm import relationship
from app.database.session import Base

class InterviewResult(Base):
    __tablename__ = "interview_results"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), unique=True)
    
    overall_score = Column(Float)
    answer_quality_score = Column(Float)
    communication_score = Column(Float)
    performance_score = Column(Float)
    role_knowledge_score = Column(Float)
    technical_score = Column(Float)
    
    summary = Column(Text)
    strengths = Column(JSON)
    weaknesses = Column(JSON)
    improvement_areas = Column(JSON)
    key_points = Column(JSON)
    recommendations = Column(JSON)
    result_label = Column(String)

    # Relationships
    interview = relationship("Interview", back_populates="result")
