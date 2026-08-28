import re

def clean_text(text: str) -> str:
    """Basic text cleaning."""
    if not text:
        return ""
    # Remove extra whitespaces
    text = re.sub(r'\s+', ' ', text).strip()
    # Remove non-printable characters
    text = "".join(filter(lambda x: x.isprintable(), text))
    return text

def extract_sections(text: str, keywords: list) -> dict:
    """Roughly extract sections based on keywords."""
    sections = {}
    lines = text.split('\n')
    current_section = "General"
    sections[current_section] = []

    for line in lines:
        matched = False
        for kw in keywords:
            if kw.lower() in line.lower() and len(line) < 50:
                current_section = kw
                sections[current_section] = []
                matched = True
                break
        if not matched:
            sections[current_section].append(line)
    
    return {k: "\n".join(v) for k, v in sections.items()}
