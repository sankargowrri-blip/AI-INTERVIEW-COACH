"""
resume.py — Resume upload and validation routes.

Routes:
  POST /api/resumes/validate  – validate without saving (used by frontend)
  POST /api/resumes/upload    – validate + save (authenticated)
  GET  /api/resumes/{id}      – fetch a saved resume (authenticated)
"""

import os
import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import Resume as ResumeSchema
from app.services.resume_parser import ResumeParser
from app.services.resume_validator import ResumeValidator
from app.utils.file_utils import save_upload_file, ensure_dir

logger     = logging.getLogger(__name__)
router     = APIRouter()
UPLOAD_DIR = "uploads/resumes"

ALLOWED_MIME = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
ALLOWED_EXT = {".pdf", ".docx"}
MAX_SIZE_MB = 10


# ── response models ────────────────────────────────────────────────────────

class ExtractedData(BaseModel):
    name:           Optional[str]       = ""
    email:          Optional[str]       = ""
    phone:          Optional[str]       = ""
    skills:         Optional[List[str]] = []
    education:      Optional[List[str]] = []
    experience:     Optional[List[str]] = []
    projects:       Optional[List[str]] = []
    certifications: Optional[List[str]] = []
    technologies:   Optional[List[str]] = []
    summary:        Optional[str]       = ""


class ValidateResponse(BaseModel):
    valid:         bool
    confidence:    int
    document_type: str
    message:       Optional[str]        = None
    extracted_data: Optional[ExtractedData] = None


# ── helpers ────────────────────────────────────────────────────────────────

def _check_file(file: UploadFile) -> None:
    """Raise HTTPException for unsupported type or oversized files."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if file.content_type not in ALLOWED_MIME and ext not in ALLOWED_EXT:
        raise HTTPException(
            status_code=422,
            detail=(
                "Unsupported file type. "
                "Please upload your resume as a PDF or DOCX file."
            ),
        )


async def _read_upload(file: UploadFile) -> bytes:
    data = await file.read()
    if not data:
        raise HTTPException(status_code=422, detail="The uploaded file is empty.")
    if len(data) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=422,
            detail=f"File size exceeds the {MAX_SIZE_MB} MB limit.",
        )
    return data


def _extract_text_from_bytes(data: bytes, filename: str) -> str:
    """Write bytes to a temp file, parse text, clean up."""
    import tempfile
    ext = os.path.splitext(filename or "file.pdf")[1].lower() or ".pdf"
    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(data)
        tmp_path = tmp.name
    try:
        return ResumeParser.parse(tmp_path)
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


def _extract_structured(text: str) -> ExtractedData:
    """
    Very lightweight structured extraction from validated resume text.
    The frontend already does this client-side; this backend version is
    used when the full upload+validate flow is triggered server-side.
    """
    import re
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    # Email
    email_m = re.search(
        r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text
    )
    email = email_m.group(0) if email_m else ""

    # Phone
    phone_m = re.search(r"(\+?\d[\d\s\-().]{8,14}\d)", text)
    phone = phone_m.group(0).strip() if phone_m else ""

    # Name heuristic – first 2-5 word line near top
    HEADERS = {
        "education", "skills", "experience", "projects", "summary",
        "objective", "profile", "contact", "certifications", "achievements",
        "internship", "languages", "references", "career", "qualification",
    }
    name = ""
    for line in lines[:8]:
        words = line.split()
        if (
            2 <= len(words) <= 5
            and not re.search(r"\d", line)
            and "@" not in line
            and line.lower() not in HEADERS
            and len(line) < 60
        ):
            name = line
            break

    def extract_section(kws: List[str]) -> List[str]:
        result: List[str] = []
        in_sec = False
        next_re = re.compile(
            r"^(education|experience|skills|projects|certifications?|"
            r"achievements?|internship|summary|objective|profile|contact|"
            r"languages?|references?|career|qualification|declaration|"
            r"hobbies|interests)",
            re.IGNORECASE,
        )
        for line in lines:
            ll = line.lower()
            if any(ll.startswith(kw) for kw in kws):
                in_sec = True
                continue
            if in_sec:
                if next_re.match(ll) and not any(ll.startswith(kw) for kw in kws):
                    break
                if len(line) > 2 and not line.isdigit():
                    result.append(line)
                if len(result) >= 10:
                    break
        return result

    skill_lines = extract_section([
        "skill", "technical skill", "core competenc",
        "technologies", "tools", "expertise",
        "programming language", "framework",
    ])
    skills: List[str] = []
    for sl in skill_lines:
        for tok in re.split(r"[,|•·\-–/]", sl):
            t = tok.strip()
            if 1 < len(t) < 40:
                skills.append(t)
        if len(skills) >= 20:
            break

    education      = extract_section(["education", "qualification", "academic"])[:6]
    experience     = extract_section(["experience", "employment", "work history", "professional"])[:6]
    projects       = extract_section(["project"])[:6]
    certifications = extract_section(["certification", "certificate", "certified", "achievement"])[:6]

    tech_re = re.compile(
        r"\b(Python|JavaScript|TypeScript|Java|C\+\+|C#|Go|Rust|PHP|Ruby|"
        r"Swift|Kotlin|React|Angular|Vue|Node\.?js|FastAPI|Django|Flask|"
        r"Spring|Express|Next\.?js|PostgreSQL|MySQL|MongoDB|Redis|Docker|"
        r"Kubernetes|AWS|Azure|GCP|Git|Linux|TensorFlow|PyTorch|Pandas|"
        r"NumPy|SQL|HTML|CSS|Tailwind|Bootstrap|GraphQL|REST|"
        r"Machine Learning|Deep Learning|NLP|OpenCV)\b",
        re.IGNORECASE,
    )
    technologies = list({m.strip() for m in tech_re.findall(text)})[:20]

    summary_lines = extract_section(["summary", "objective", "profile", "about", "career objective"])
    summary = " ".join(summary_lines[:3]).strip()

    return ExtractedData(
        name=name, email=email, phone=phone, summary=summary,
        skills=list(dict.fromkeys(skills))[:20],
        education=education, experience=experience,
        projects=projects, certifications=certifications,
        technologies=technologies,
    )


# ── routes ─────────────────────────────────────────────────────────────────

@router.post("/validate", response_model=ValidateResponse)
async def validate_resume(file: UploadFile = File(...)):
    """
    Validate a resume file WITHOUT saving it or requiring authentication.

    The frontend can call this to get a backend-authoritative validation
    result.  Returns confidence score, document type, and extracted data
    on success.

    Security note: no auth required intentionally (validation is read-only
    and stateless — no data is persisted).
    """
    _check_file(file)
    data = await _read_upload(file)

    try:
        text = _extract_text_from_bytes(data, file.filename or "upload.pdf")
    except Exception as exc:
        logger.error("[ResumeValidate] parse error: %s", exc)
        raise HTTPException(
            status_code=422,
            detail="Unable to read the file. It may be corrupted or password-protected.",
        )

    is_pdf = (file.filename or "").lower().endswith(".pdf")
    if is_pdf and len(text.strip()) < 80:
        return ValidateResponse(
            valid=False,
            confidence=0,
            document_type="scanned_pdf",
            message=(
                "Unable to extract text from this PDF. "
                "It may be scanned or image-based. "
                "Please upload a text-based PDF or DOCX version of your resume."
            ),
        )

    is_valid, issues, detail = ResumeValidator.validate(text)

    if not is_valid:
        msg = " ".join(issues) if issues else (
            "The uploaded document does not appear to be a resume or CV."
        )
        return ValidateResponse(
            valid=False,
            confidence=detail.get("confidence", 0),
            document_type=detail.get("document_type", "invalid"),
            message=msg,
        )

    extracted = _extract_structured(text)
    return ValidateResponse(
        valid=True,
        confidence=detail.get("confidence", 0),
        document_type="VALID_RESUME",
        extracted_data=extracted,
    )


@router.post("/upload", response_model=ResumeSchema)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload, validate, and save a resume.  Requires authentication.
    Returns 422 if the document fails resume validation.
    """
    _check_file(file)
    data = await _read_upload(file)

    # Save to disk first (parser needs a file path)
    ensure_dir(UPLOAD_DIR)
    safe_name  = os.path.basename(file.filename or "resume.pdf")
    file_path  = os.path.join(UPLOAD_DIR, f"{current_user.id}_{safe_name}")
    with open(file_path, "wb") as f:
        f.write(data)

    # Parse
    try:
        content = ResumeParser.parse(file_path)
    except Exception as exc:
        os.unlink(file_path)
        logger.error("[ResumeUpload] parse error: %s", exc)
        raise HTTPException(
            status_code=422,
            detail="Unable to read the file. It may be corrupted or password-protected.",
        )

    # Validate
    is_pdf = safe_name.lower().endswith(".pdf")
    if is_pdf and len(content.strip()) < 80:
        os.unlink(file_path)
        raise HTTPException(
            status_code=422,
            detail=(
                "Unable to extract text from this PDF. "
                "It may be scanned or image-based. "
                "Please upload a text-based PDF or DOCX file."
            ),
        )

    is_valid, issues, detail = ResumeValidator.validate(content)
    if not is_valid:
        os.unlink(file_path)
        msg = " ".join(issues) if issues else (
            "The uploaded document does not appear to be a resume or CV."
        )
        logger.info(
            "[ResumeUpload] rejected user=%d confidence=%d doc_type=%s",
            current_user.id,
            detail.get("confidence", 0),
            detail.get("document_type", "unknown"),
        )
        raise HTTPException(status_code=422, detail=msg)

    # Persist to DB
    db_resume = Resume(
        user_id=current_user.id,
        file_name=safe_name,
        file_path=file_path,
        content=content,
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    return db_resume


@router.get("/{id}", response_model=ResumeSchema)
def get_resume(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return resume
