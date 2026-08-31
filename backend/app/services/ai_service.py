import os
import json
from typing import List, Dict, Any, Optional
from app.core.config import settings

try:
    from openai import AsyncOpenAI
except ImportError:
    AsyncOpenAI = None

try:
    import google.generativeai as genai
except ImportError:
    genai = None

class AIService:
    """Interface for LLMs (Gemini/OpenAI)."""
    
    def __init__(self):
        self.provider = settings.AI_PROVIDER.lower()
        self.openai_key = settings.OPENAI_API_KEY or settings.AI_API_KEY
        self.gemini_key = settings.GOOGLE_API_KEY or settings.AI_API_KEY
        
        self.client = None
        if self.provider == "openai" and self.openai_key and AsyncOpenAI:
            self.client = AsyncOpenAI(api_key=self.openai_key)
        elif self.provider == "gemini" and self.gemini_key and genai:
            genai.configure(api_key=self.gemini_key)
            self.client = genai.GenerativeModel('gemini-pro')
            
        self.is_mock = self.client is None

    async def _call_llm(self, prompt: str, system_message: str) -> str:
        if self.is_mock:
            # Simulate a JSON response if the prompt asks for it
            if "JSON" in prompt:
                if "questions" in prompt:
                    return json.dumps({
                        "questions": [
                            {"text": "Tell me about your experience with React.", "type": "technical", "category": "Frontend"},
                            {"text": "How do you handle conflict in a team?", "type": "behavioral", "category": "Soft Skills"}
                        ]
                    })
                if "evaluation" in prompt:
                    return json.dumps({
                        "score": 85,
                        "technical_accuracy": 80,
                        "communication": 90,
                        "grammar": 85,
                        "fluency": 85,
                        "filler_words": 2,
                        "feedback": "Great answer with clear structure.",
                        "suggestions": "Try to include more technical details.",
                        "strengths": ["Clear communication", "Confident delivery"],
                        "weaknesses": ["Lacked specific metrics"],
                        "key_points": ["Used STAR method", "Addressed the core problem"]
                    })
            return "Mock AI response"
        
        try:
            if self.provider == "openai":
                response = await self.client.chat.completions.create(
                    model="gpt-4-turbo-preview",
                    messages=[
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"} if "JSON" in prompt else None
                )
                return response.choices[0].message.content
            
            elif self.provider == "gemini":
                full_prompt = f"{system_message}\n\nUser Request: {prompt}"
                response = self.client.generate_content(full_prompt)
                return response.text
        except Exception as e:
            print(f"AI Service Error: {e}")
            return "{}" # Return empty JSON on error if JSON expected
            
        return "Error in AI service"

    async def generate_interview_questions(
        self, 
        resume_text: str, 
        role: str, 
        experience_level: str, 
        difficulty: str,
        count: int = 5
    ) -> List[Dict[str, Any]]:
        prompt = f"""
        Generate {count} interview questions for the role of {role} with {experience_level} experience level.
        The difficulty should be {difficulty}.
        Use the candidate's resume for personalization: {resume_text[:2000]}
        
        Return the result as a JSON object with a list of 'questions'.
        Each question should have: 'text', 'type' (behavioral/technical/situational), 'category'.
        """
        system_message = "You are an expert technical interviewer."
        
        response_text = await self._call_llm(prompt, system_message)
        try:
            data = json.loads(response_text)
            return data.get("questions", [])
        except:
            return [{"text": "Tell me about your most challenging project.", "type": "technical", "category": "General"}]

    async def generate_follow_up(self, question: str, answer: str) -> Optional[str]:
        prompt = f"Based on the question: '{question}' and the candidate's answer: '{answer}', generate a relevant follow-up question."
        system_message = "You are a professional interviewer."
        return await self._call_llm(prompt, system_message)

    async def evaluate_answer(self, question: str, answer: str) -> Dict[str, Any]:
        prompt = f"""
        Evaluate the following interview answer:
        Question: {question}
        Answer: {answer}
        
        Provide a detailed evaluation in JSON format including:
        - score (0-100)
        - technical_accuracy (0-100)
        - communication (0-100)
        - grammar (0-100)
        - fluency (0-100)
        - filler_words (count)
        - feedback (string)
        - suggestions (string)
        - strengths (list)
        - weaknesses (list)
        - key_points (list)
        """
        system_message = "You are an expert interview evaluator."
        
        response_text = await self._call_llm(prompt, system_message)
        try:
            return json.loads(response_text)
        except:
            return {
                "score": 50,
                "feedback": "Error in AI evaluation. Manual review recommended.",
                "strengths": [],
                "weaknesses": ["AI evaluation failed"],
                "key_points": []
            }

ai_service = AIService()
