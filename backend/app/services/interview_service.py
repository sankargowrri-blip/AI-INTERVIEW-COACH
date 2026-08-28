from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from app.models.interview import Interview
from app.models.question import Question
from app.models.interview_result import InterviewResult
from app.services.ai_service import ai_service

class InterviewService:
    @staticmethod
    async def initialize_interview(db: Session, interview_id: int, resume_text: str):
        interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not interview:
            return None
        
        # Generate questions using AI
        questions_data = await ai_service.generate_interview_questions(
            resume_text=resume_text,
            role=interview.role or "Software Engineer",
            experience_level=interview.experience_level or "FRESHER",
            difficulty=interview.difficulty or "MEDIUM",
            count=interview.question_count or 5
        )
        
        # Save questions to DB
        questions = []
        for i, q_data in enumerate(questions_data):
            db_question = Question(
                interview_id=interview_id,
                text=q_data["text"],
                type=q_data["type"],
                question_number=i + 1,
                question_category=q_data.get("category", "General"),
                is_follow_up=False,
                order=i
            )
            db.add(db_question)
            questions.append(db_question)
        
        interview.status = "ongoing"
        db.commit()
        return questions

    @staticmethod
    async def handle_follow_up(db: Session, interview_id: int, last_question: str, last_answer: str):
        follow_up_text = await ai_service.generate_follow_up(last_question, last_answer)
        if follow_up_text:
            # Find the max order to place the follow-up
            max_order = db.query(func.max(Question.order)).filter(Question.interview_id == interview_id).scalar() or 0
            db_question = Question(
                interview_id=interview_id,
                text=follow_up_text,
                type="situational",
                is_follow_up=True,
                order=max_order + 1
            )
            db.add(db_question)
            db.commit()
            db.refresh(db_question)
            return db_question
        return None

    @staticmethod
    def get_next_question(db: Session, interview_id: int) -> Optional[Question]:
        return db.query(Question).filter(
            Question.interview_id == interview_id
        ).outerjoin(Question.answer).filter(
            Question.answer == None
        ).order_by(Question.order).first()

    @staticmethod
    def calculate_result_label(score: float) -> str:
        if 90 <= score <= 100: return "EXCELLENT"
        if 80 <= score < 90: return "MARVELOUS"
        if 70 <= score < 80: return "GOOD"
        if 60 <= score < 70: return "NOT BAD"
        if 40 <= score < 60: return "BAD"
        return "WORST"

    @staticmethod
    async def finalize_interview(db: Session, interview_id: int):
        interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not interview:
            return None

        # Aggregate evaluations
        evaluations = []
        for q in interview.questions:
            if q.answer and q.answer.evaluation:
                evaluations.append(q.answer.evaluation)
        
        if not evaluations:
            overall_score = 0.0
            avg_tech = 0.0
            avg_comm = 0.0
            avg_perf = 0.0
        else:
            overall_score = sum(e.score for e in evaluations) / len(evaluations)
            avg_tech = sum(e.technical_accuracy or 0 for e in evaluations) / len(evaluations)
            avg_comm = sum(e.communication or 0 for e in evaluations) / len(evaluations)
            avg_perf = sum(e.fluency or 0 for e in evaluations) / len(evaluations)
        
        result = InterviewResult(
            interview_id=interview_id,
            overall_score=overall_score,
            answer_quality_score=avg_tech,
            communication_score=avg_comm,
            performance_score=avg_perf,
            role_knowledge_score=avg_tech,
            technical_score=avg_tech,
            summary=f"Interview completed with a score of {overall_score:.1f}. Strong performance in communication.",
            strengths=["Structured thinking", "Clarity"],
            weaknesses=["Needs more technical depth"],
            improvement_areas=["Focus on edge cases"],
            key_points=["Addressed core requirements", "Positive attitude"],
            recommendations=["Review data structures"],
            result_label=InterviewService.calculate_result_label(overall_score)
        )
        
        db.add(result)
        interview.status = "completed"
        interview.overall_score = overall_score
        interview.result_label = result.result_label
        db.commit()
        db.refresh(result)
        return result
