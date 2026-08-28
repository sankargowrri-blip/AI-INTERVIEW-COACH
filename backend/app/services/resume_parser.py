import fitz  # PyMuPDF
from docx import Document
import os

class ResumeParser:
    @staticmethod
    def parse_pdf(file_path: str) -> str:
        text = ""
        try:
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
            doc.close()
        except Exception as e:
            print(f"Error parsing PDF: {e}")
        return text

    @staticmethod
    def parse_docx(file_path: str) -> str:
        text = ""
        try:
            doc = Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception as e:
            print(f"Error parsing DOCX: {e}")
        return text

    @classmethod
    def parse(cls, file_path: str) -> str:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.pdf':
            return cls.parse_pdf(file_path)
        elif ext in ['.docx', '.doc']:
            return cls.parse_docx(file_path)
        else:
            raise ValueError(f"Unsupported file extension: {ext}")
