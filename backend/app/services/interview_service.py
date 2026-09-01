from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.models.interview import Interview
from app.models.question import Question
from app.models.interview_result import InterviewResult
from app.services.ai_service import ai_service
from app.services.answer_evaluator import is_meaningful_answer


class InterviewService:

    @staticmethod
    async def initialize_interview(db: Session, interview_id: int, resume_text: str):
        interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not interview:
            return None

        questions_data = await ai_service.generate_interview_questions(
            resume_text=resume_text,
            role=interview.role or "Software Engineer",
            experience_level=interview.experience_level or "FRESHER",
            difficulty=interview.difficulty or "MEDIUM",
            count=interview.question_count or 5,
        )

        questions = []
        for i, q_data in enumerate(questions_data):
            db_question = Question(
                interview_id      = interview_id,
                text              = q_data["text"],
                type              = q_data["type"],
                question_number   = i + 1,
                question_category = q_data.get("category", "General"),
                is_follow_up      = False,
                order             = i,
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
            max_order = (
                db.query(func.max(Question.order))
                .filter(Question.interview_id == interview_id)
                .scalar() or 0
            )
            db_question = Question(
                interview_id = interview_id,
                text         = follow_up_text,
                type         = "situational",
                is_follow_up = True,
                order        = max_order + 1,
            )
            db.add(db_question)
            db.commit()
            db.refresh(db_question)
            return db_question
        return None

    @staticmethod
    def get_next_question(db: Session, interview_id: int) -> Optional[Question]:
        return (
            db.query(Question)
            .filter(Question.interview_id == interview_id)
            .outerjoin(Question.answer)
            .filter(Question.answer == None)   # noqa: E711
            .order_by(Question.order)
            .first()
        )

    @staticmethod
    def calculate_result_label(score: float) -> str:
        if score >= 90: return "EXCELLENT"
        if score >= 80: return "MARVELOUS"
        if score >= 70: return "GOOD"
        if score >= 60: return "NOT BAD"
        if score >= 40: return "BAD"
        return "WORST"

    @staticmethod
    async def finalize_interview(db: Session, interview_id: int):
        interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not interview:
            return None

        # ── Collect all evaluations ──────────────────────────────────────────
        evaluations = []
        for q in interview.questions:
            if q.answer and q.answer.evaluation:
                evaluations.append(q.answer.evaluation)

        # ── Count meaningful answers ─────────────────────────────────────────
        # An answer is meaningful only if its transcript passes the same check
        # used in answer_evaluator — this prevents AI mock scores from inflating
        # the result when the candidate said nothing.
        meaningful_count = 0
        for q in interview.questions:
            if q.answer and is_meaningful_answer(q.answer.text):
                meaningful_count += 1

        total_questions = len(interview.questions)

        # ── NOT ATTEMPTED: zero meaningful answers ───────────────────────────
        if meaningful_count == 0:
            overall_score = 0.0
            avg_tech      = 0.0
            avg_comm      = 0.0
            avg_perf      = 0.0
            result_label  = "WORST"
            summary       = (
                "No meaningful answers were provided during this interview. "
                "The score reflects that the interview was not attempted, "
                "not the candidate's actual ability."
            )
            strengths     = []
            weaknesses    = ["No interview answers were provided."]
            improvements  = [
                "Attempt each interview question.",
                "Speak clearly and provide complete answers.",
                "Use examples from your education, projects, skills, or work experience.",
            ]
            interview_status = "NOT_ATTEMPTED"

        else:
            # ── PARTIAL or COMPLETE: score from evaluations only ─────────────
            # Use evaluations that correspond to meaningful answers.
            meaningful_evals = []
            for q in interview.questions:
                if (
                    q.answer
                    and q.answer.evaluation
                    and is_meaningful_answer(q.answer.text)
                ):
                    meaningful_evals.append(q.answer.evaluation)

            if meaningful_evals:
                raw_avg   = sum(e.score for e in meaningful_evals) / len(meaningful_evals)
                avg_tech  = sum(e.technical_accuracy or 0 for e in meaningful_evals) / len(meaningful_evals)
                avg_comm  = sum(e.communication      or 0 for e in meaningful_evals) / len(meaningful_evals)
                avg_perf  = sum(e.fluency             or 0 for e in meaningful_evals) / len(meaningful_evals)
            else:
                raw_avg = avg_tech = avg_comm = avg_perf = 0.0

            # Weight by participation ratio
            participation = meaningful_count / max(total_questions, 1)
            overall_score = round(raw_avg * participation, 2)

            result_label     = InterviewService.calculate_result_label(overall_score)
            interview_status = "COMPLETED"
            summary = (
                f"Interview completed with an overall score of {overall_score:.1f}. "
                f"Answered {meaningful_count} of {total_questions} questions."
            )
            strengths    = ["Provided answers to interview questions."]
            weaknesses   = [] if meaningful_count >= total_questions else [
                f"Did not answer {total_questions - meaningful_count} question(s)."
            ]
            improvements = ["Review unanswered questions and practise responding to them."]

        # ── Save result ───────────────────────────────────────────────────────
        result = InterviewResult(
            interview_id         = interview_id,
            overall_score        = overall_score,
            answer_quality_score = avg_tech,
            communication_score  = avg_comm,
            performance_score    = avg_perf,
            role_knowledge_score = avg_tech,
            technical_score      = avg_tech,
            summary              = summary,
            strengths            = strengths,
            weaknesses           = weaknesses,
            improvement_areas    = improvements,
            key_points           = [
                "Attempt every question — even a short answer scores better than silence.",
                "Use the STAR format for behavioural questions.",
                "Check that your microphone is working before starting.",
            ],
            recommendations      = improvements,
            result_label         = result_label,
        )

        db.add(result)
        interview.status        = "completed"
        interview.overall_score = overall_score
        interview.result_label  = result_label
        db.commit()
        db.refresh(result)
        return result
