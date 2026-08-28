from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.progress import Progress
from app.models.interview import Interview
from app.schemas.progress import Progress as ProgressSchema

router = APIRouter()

@router.get("/")
def get_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get general progress
    progress = db.query(Progress).filter(Progress.user_id == current_user.id).first()
    if not progress:
        progress = Progress(user_id=current_user.id, total_interviews=0, average_score=0)
        db.add(progress)
        db.commit()
        db.refresh(progress)
    
    # Get historical scores for charts
    interviews = db.query(Interview).filter(
        Interview.user_id == current_user.id,
        Interview.status == "completed"
    ).order_by(Interview.created_at.asc()).all()
    
    history = [
        {"date": i.created_at.isoformat(), "score": i.overall_score, "label": i.result_label}
        for i in interviews if i.overall_score is not None
    ]
    
    return {
        "total_interviews": progress.total_interviews,
        "average_score": progress.average_score,
        "skill_breakdown": progress.skill_breakdown,
        "history": history
    }
