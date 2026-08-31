import os
from typing import Dict, Any, List
from app.services.resume_parser import ResumeParser
from app.services.resume_validator import ResumeValidator
from app.services.ai_service import ai_service

class ResumeService:
    @staticmethod
    async def process_resume(file_path: str) -> Dict[str, Any]:
        # 1. Parse text from file
        text = ResumeParser.parse(file_path)
        
        # 2. Validate if it's a resume
        is_valid, missing_sections = ResumeValidator.validate(text)
        
        if not is_valid:
            return {
                "is_valid_resume": False,
                "missing_sections": missing_sections,
                "text": text[:500] # Return snippet for debugging
            }
        
        # 3. Use AI to extract structured data (Skills, Education, etc.)
        # We can add a method to ai_service for this
        extraction_prompt = f"""
        Extract the following information from this resume text:
        - Skills (list)
        - Education (list of objects with degree, institution)
        - Experience (list of objects with role, company, duration)
        - Summary (string)
        
        Resume text: {text[:4000]}
        
        Return as JSON.
        """
        extracted_data_raw = await ai_service._call_llm(
            extraction_prompt,
            "You are a resume parser. Return only valid JSON."
        )
        
        # In a real app, parse extracted_data_raw as JSON
        # For now, return mock structured data
        return {
            "is_valid_resume": True,
            "text": text,
            "skills": ["Python", "FastAPI", "React"],
            "education": [{"degree": "B.Tech", "institution": "IIT"}],
            "experience": [{"role": "Software Engineer", "company": "Google", "duration": "2 years"}],
            "summary": "Experienced software engineer."
        }
