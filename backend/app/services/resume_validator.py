from typing import List, Tuple
from app.utils.text_utils import clean_text

class ResumeValidator:
    REQUIRED_SECTIONS = [
        "experience", "work", "education", "skills", "projects", "summary", "objective"
    ]

    @staticmethod
    def validate(text: str) -> Tuple[bool, List[str]]:
        """
        Validates if the text is likely a resume by checking for common sections.
        Returns (is_valid, missing_sections)
        """
        if not text or len(text) < 200:
            return False, ["Content too short"]

        clean_content = clean_text(text).lower()
        found_sections = []
        
        for section in ResumeValidator.REQUIRED_SECTIONS:
            if section in clean_content:
                found_sections.append(section)
        
        # A simple heuristic: if it has at least 2 common sections, we consider it a resume
        is_valid = len(found_sections) >= 2
        missing = [s for s in ResumeValidator.REQUIRED_SECTIONS if s not in found_sections]
        
        return is_valid, missing
