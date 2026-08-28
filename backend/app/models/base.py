# Import all models here so that Base has them registered
from app.database.session import Base
from app.models.user import User, UserProfile
from app.models.resume import Resume
from app.models.interview import Interview
from app.models.question import Question
from app.models.answer import Answer
from app.models.evaluation import Evaluation
from app.models.progress import Progress
from app.models.interview_result import InterviewResult
