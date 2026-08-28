from sqlalchemy import Column, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    total_interviews = Column(Integer, default=0)
    average_score = Column(Integer, default=0)
    skill_breakdown = Column(JSON)  # Scores per skill category

    # Relationships
    user = relationship("User", back_populates="progress")
