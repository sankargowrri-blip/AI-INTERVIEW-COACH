import re
from sqlalchemy.orm import Session
from app.models.answer import Answer
from app.models.evaluation import Evaluation
from app.services.ai_service import ai_service

# ── empty-answer detection ────────────────────────────────────────────────────

EMPTY_PATTERNS = [
    r'^\s*$',
    r'^\(no answer recorded\)$',
    r'^\[silence\]$',
    r'^\[no speech detected\]$',
    r'^no answer$',
    r'^null$',
    r'^undefined$',
    r'^n/a$',
    r'^transcribed text from audio$',   # backend stub placeholder
]
_EMPTY_RE = [re.compile(p, re.IGNORECASE) for p in EMPTY_PATTERNS]

MIN_WORD_COUNT = 3  # anything below this is treated as not answered


def is_meaningful_answer(text: str | None) -> bool:
    """Return True only if the transcript contains a real candidate response."""
    if not text:
        return False
    t = text.strip()
    for pattern in _EMPTY_RE:
        if pattern.match(t):
            return False
    words = [w for w in t.split() if w]
    return len(words) >= MIN_WORD_COUNT


def _zero_evaluation(answer_id: int, reason: str = "No meaningful answer provided.") -> dict:
    """Return a deterministic zero-score evaluation dict (no AI called)."""
    return {
        "score": 0,
        "technical_accuracy": 0,
        "communication": 0,
        "grammar": 0,
        "fluency": 0,
        "filler_words": 0,
        "feedback": reason,
        "suggestions": "Attempt the question and provide a spoken answer.",
        "strengths": [],
        "weaknesses": ["No answer was provided for this question."],
        "key_points": [],
    }


class AnswerEvaluator:
    @staticmethod
    async def evaluate(db: Session, answer_id: int):
        answer = db.query(Answer).filter(Answer.id == answer_id).first()
        if not answer:
            return None

        question_text = answer.question.text if answer.question else "Unknown question"
        answer_text   = answer.text or ""

        # ── Guard: do NOT call AI for empty/meaningless answers ──────────────
        if not is_meaningful_answer(answer_text):
            eval_result = _zero_evaluation(
                answer_id,
                "Candidate did not provide a meaningful answer for this question."
            )
        else:
            # ── Real AI evaluation ────────────────────────────────────────────
            eval_result = await ai_service.evaluate_answer(question_text, answer_text)

            # ── Backend validation: never trust AI with empty-answer inputs ───
            # If AI returned suspicious default scores on a real answer, keep them.
            # But clamp score to 0 if the answer was actually empty (double-check).
            if not is_meaningful_answer(answer_text):
                eval_result = _zero_evaluation(answer_id)

        # ── Persist evaluation ────────────────────────────────────────────────
        db_eval = Evaluation(
            answer_id          = answer_id,
            score              = float(eval_result.get("score", 0)),
            technical_accuracy = float(eval_result.get("technical_accuracy", 0)),
            communication      = float(eval_result.get("communication", 0)),
            grammar            = float(eval_result.get("grammar", 0)),
            fluency            = float(eval_result.get("fluency", 0)),
            filler_words       = int(eval_result.get("filler_words", 0)),
            feedback           = eval_result.get("feedback", ""),
            suggestions        = eval_result.get("suggestions", ""),
            metrics            = {
                "strengths":   eval_result.get("strengths", []),
                "weaknesses":  eval_result.get("weaknesses", []),
                "key_points":  eval_result.get("key_points", []),
            },
        )
        db.add(db_eval)
        db.commit()
        db.refresh(db_eval)
        return db_eval
