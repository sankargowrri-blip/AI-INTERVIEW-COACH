from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/")
async def get_practice_plan(current_user: User = Depends(get_current_user)):
    # personalized practice plan (mock for now, or AI-generated)
    return {
        "plan_name": "Personalized Interview Prep",
        "focus_areas": ["System Design", "Concurrency", "Algorithms"],
        "recommended_tasks": [
            {"task": "Solve 2 Medium LeetCode problems", "status": "pending"},
            {"task": "Review React Hooks documentation", "status": "completed"},
            {"task": "Mock interview on Behavioral questions", "status": "pending"}
        ],
        "daily_goal": "2 hours",
        "ai_insight": "Your communication is strong, but focus on optimizing space complexity in your solutions."
    }
