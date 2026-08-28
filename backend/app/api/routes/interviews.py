from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.interview import Interview
from app.models.interview_result import InterviewResult
from app.models.question import Question
from app.models.answer import Answer
from app.schemas.interview import Interview as InterviewSchema, InterviewCreate, InterviewResult as InterviewResultSchema
from app.schemas.answer import AnswerCreate, Answer as AnswerSchema, AnswerResponse
from app.schemas.question import Question as QuestionSchema
from app.services.interview_service import InterviewService
from app.services.answer_evaluator import AnswerEvaluator
from app.services.speech_service import SpeechService

router = APIRouter()

@router.post("/", response_model=InterviewSchema)
def create_interview(
    interview_in: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_interview = Interview(
        user_id=current_user.id,
        resume_id=interview_in.resume_id,
        title=interview_in.title,
        job_description=interview_in.job_description,
        role=interview_in.role,
        experience_level=interview_in.experience_level,
        difficulty=interview_in.difficulty,
        interview_type=interview_in.interview_type,
        company=interview_in.company,
        question_count=interview_in.question_count,
        status="pending"
    )
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview

@router.post("/{id}/start", response_model=List[QuestionSchema])
async def start_interview(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interview = db.query(Interview).filter(Interview.id == id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Get resume text (assuming it's stored or accessible)
    resume_text = interview.resume.content if interview.resume else "Generic Resume"
    
    questions = await InterviewService.initialize_interview(db, id, resume_text)
    if questions is None:
        raise HTTPException(status_code=500, detail="Failed to initialize interview")
    
    return questions

@router.post("/{id}/answers", response_model=AnswerResponse)
async def submit_answer(
    id: int,
    answer_in: AnswerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interview = db.query(Interview).filter(Interview.id == id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Process transcript via speech service if audio provided
    transcript = answer_in.text
    if not transcript and answer_in.audio_path:
        # In a real implementation, we'd open the file and transcribe it
        # transcript = await SpeechService.transcribe_audio(open(answer_in.audio_path, 'rb'))
        transcript = "Transcribed text from audio" 

    db_answer = Answer(
        question_id=answer_in.question_id,
        text=transcript,
        audio_path=answer_in.audio_path,
        duration=answer_in.duration
    )
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    
    # Trigger evaluation
    evaluation = await AnswerEvaluator.evaluate(db, db_answer.id)
    
    # Check for next question
    next_q = InterviewService.get_next_question(db, id)
    
    # AI Decides to follow up if score is mediocre or communication needs clarification
    if evaluation and evaluation.score < 80 and not db_answer.question.is_follow_up:
        follow_up = await InterviewService.handle_follow_up(
            db, id, db_answer.question.text, transcript
        )
        if follow_up:
            next_q = follow_up

    return AnswerResponse(
        transcript=transcript,
        evaluation=evaluation,
        next_question=next_q
    )

@router.websocket("/ws/interviews/{interview_id}")
async def interview_websocket(websocket: WebSocket, interview_id: int):
    await websocket.accept()
    try:
        # Broadcast initial state
        await websocket.send_json({"event": "CONNECTED", "interview_id": interview_id})
        while True:
            data = await websocket.receive_text()
            # Simple Echo/State simulation
            if "status" in data:
                await websocket.send_json({"event": "AI_SPEAKING", "interview_id": interview_id})
            else:
                await websocket.send_json({"event": "LISTENING", "interview_id": interview_id})
    except WebSocketDisconnect:
        pass

@router.post("/{id}/finish", response_model=InterviewResultSchema)
async def finish_interview(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interview = db.query(Interview).filter(Interview.id == id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    result = await InterviewService.finalize_interview(db, id)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to finalize interview")
        
    return result

@router.get("/{id}/result", response_model=InterviewResultSchema)
def get_interview_result(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = db.query(InterviewResult).filter(InterviewResult.interview_id == id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found. Finish the interview first.")
    
    return result

@router.get("/history", response_model=List[InterviewSchema])
def get_interview_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Interview).filter(Interview.user_id == current_user.id).all()

@router.post("/{id}/finish", response_model=InterviewResultSchema)
async def finish_interview(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interview = db.query(Interview).filter(Interview.id == id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    result = await InterviewService.finalize_interview(db, id)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to finalize interview")
        
    return result

@router.get("/{id}/result", response_model=InterviewResultSchema)
def get_interview_result(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = db.query(InterviewResult).filter(InterviewResult.interview_id == id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found. Finish the interview first.")
    
    return result

@router.get("/history", response_model=List[InterviewSchema])
def get_interview_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Interview).filter(Interview.user_id == current_user.id).all()
