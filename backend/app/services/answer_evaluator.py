from sqlalchemy.orm import Session
from app.models.answer import Answer
from app.models.evaluation import Evaluation
from app.services.ai_service import ai_service

class AnswerEvaluator:
    @staticmethod
    async def evaluate(db: Session, answer_id: int):
        answer = db.query(Answer).filter(Answer.id == answer_id).first()
        if not answer:
            return None
        
        question_text = answer.question.text
        answer_text = answer.text
        
        # Use AI to evaluate
        eval_result = await ai_service.evaluate_answer(question_text, answer_text)
        
        # Save evaluation with detailed metrics
        db_eval = Evaluation(
            answer_id=answer_id,
            score=float(eval_result.get("score", 0)),
            technical_accuracy=float(eval_result.get("technical_accuracy", 0)),
            communication=float(eval_result.get("communication", 0)),
            grammar=float(eval_result.get("grammar", 0)),
            fluency=float(eval_result.get("fluency", 0)),
            filler_words=int(eval_result.get("filler_words", 0)),
            feedback=eval_result.get("feedback", ""),
            suggestions=eval_result.get("suggestions", ""),
            metrics={
                "strengths": eval_result.get("strengths", []),
                "weaknesses": eval_result.get("weaknesses", []),
                "key_points": eval_result.get("key_points", [])
            }
        )
        db.add(db_eval)
        db.commit()
        db.refresh(db_eval)
        
        return db_eval
