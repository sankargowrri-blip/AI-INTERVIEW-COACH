"""
resume_validator.py

Two-stage resume validation that mirrors the frontend confidence engine.

Stage 1 – minimum length check (called by the parser before this)
Stage 2 – confidence scoring
  • Positive signals: resume-specific phrases
  • Negative signals: class-notes / question-paper / assignment /
                      certificate / research-paper / circular patterns
  • Hard gate: at least one "anchor" pattern must be present

The net confidence must be ≥ CONFIDENCE_THRESHOLD (55) AND an anchor
must be found for the document to be classified as VALID_RESUME.
"""

import re
from typing import Tuple, List, Dict, Any


CONFIDENCE_THRESHOLD = 55   # net score required to pass


# ── POSITIVE scoring table ─────────────────────────────────────────────────
# Each tuple: (list_of_lowercase_patterns, score_to_add)
# Score is awarded once per entry regardless of how many patterns match.

POSITIVE_SIGNALS: List[Tuple[List[str], int]] = [
    # CV / resume identity
    (["curriculum vitae", " cv ", "\ncv\n", "resume", "résumé", "biodata"], 15),
    # Contact / email
    (["@gmail", "@yahoo", "@outlook", "@hotmail", "@rediffmail",
      "email:", "e-mail:", "mail:"],                                          10),
    # Phone
    (["phone:", "mobile:", "contact no", "tel:", "+91", "+1 ", "+44"],         8),
    # Social / portfolio
    (["linkedin.com", "github.com", "portfolio", "website:"],                  5),

    # Education — degree-specific phrases
    (["b.tech", "b.e.", "b.sc", "m.tech", "m.sc", "mba", "bca", "mca",
      "bachelor of", "master of", "diploma in", "pursuing"],                  12),
    (["university", "institute of technology", "college of engineering",
      "cgpa", "gpa:", "percentage:", "pass out", "graduated"],                10),
    (["education", "academic background", "academic qualification",
      "educational details"],                                                   8),

    # Skills — section headings only (not bare word "skills")
    (["technical skills", "core competencies", "key skills",
      "areas of expertise", "skill set", "proficiencies"],                    10),
    (["programming languages", "frameworks and libraries",
      "tools & technologies", "software skills"],                              8),

    # Work / internship — person-centric
    (["work experience", "professional experience", "employment history",
      "career history", "work history"],                                       12),
    (["internship", "trainee", "apprenticeship", "summer intern",
      "intern at", "interned at"],                                             10),
    (["responsibilities:", "key responsibilities", "designation:",
      "worked at", "working at", "worked as", "working as"],                   8),

    # Projects
    (["personal projects", "academic projects", "project title",
      "developed a", "built a", "implemented a", "created a",
      "technologies used:", "tech stack:"],                                    10),

    # Objective / summary
    (["career objective", "professional summary", "profile summary",
      "about me", "personal statement", "seeking a position",
      "aspiring to", "i am a ", "i have ", "my goal"],                        10),

    # Certifications / awards
    (["certified in", "certification in", "certificate course",
      "completed a course", "awarded", "achievement"],                          6),

    # Declaration — extremely resume-specific
    (["i hereby declare", "i solemnly declare",
      "the above information is true",
      "to the best of my knowledge"],                                          15),

    # References
    (["references available", "references on request",
      "available on request"],                                                   5),
]


# ── NEGATIVE scoring table ─────────────────────────────────────────────────

NEGATIVE_SIGNALS: List[Tuple[List[str], int]] = [
    # Class / lecture notes
    (["unit 1", "unit 2", "unit 3", "unit 4", "unit 5",
      "unit i", "unit ii", "unit iii",
      "lecture notes", "learning objectives",
      "course outcomes", "module 1", "module 2",
      "topic:", "subtopic:"],                                                  -25),
    (["chapter 1", "chapter 2", "chapter 3",
      "chapter i", "chapter ii",
      "definition:", "theorem:", "proof:", "lemma:"],                          -20),
    (["viva questions", "viva voce", "important questions",
      "two marks", "three marks", "five marks", "16 marks",
      "short answer", "long answer"],                                          -25),
    (["syllabus", "course code", "credit hours", "l t p c",
      "l-t-p", "subject code", "regulation:"],                                -20),

    # Question papers / exams
    (["answer all questions", "attempt any", "all questions carry",
      "maximum marks:", "time allowed:", "time: 3 hours",
      "internal marks", "external marks",
      "part a\n", "part b\n", "part c\n",
      "section a\n", "section b\n"],                                           -30),
    (["question no.", "q.no.", "q1.", "q2.", "q3.",
      "choose the best", "choose the correct answer",
      "fill in the blank", "true or false",
      "match the following"],                                                  -25),

    # Assignment / lab report
    (["assignment no", "assignment -", "problem statement:",
      "submission date", "due date:", "submitted by:",
      "submitted to:", "roll no:", "reg no:",
      "experiment no", "aim:", "apparatus:",
      "procedure:", "result:", "observation:"],                                -25),

    # Research paper
    (["abstract:", "keywords:", "methodology:", "literature review",
      "related work", "experimental results",
      "conclusion and future work",
      "doi:", "issn:", "ieee", "springer", "elsevier",
      "volume ", "issue ", "journal of"],                                      -25),

    # Certificate (standalone, not a resume)
    (["this is to certify", "certificate of completion",
      "certificate of participation",
      "has successfully completed",
      "awarded to", "in recognition of", "presented to"],                     -30),

    # College / institutional circular
    (["notice:", "circular:", "all students are informed",
      "attention:", "examination schedule", "timetable",
      "hall ticket", "admit card",
      "announcement:", "this is to inform"],                                   -30),

    # Textbook / book-like structure
    (["table of contents", "index:", "appendix:",
      "bibliography:", "foreword:", "preface:",
      "acknowledgements:", "list of figures",
      "list of tables"],                                                       -20),
]


# ── Hard anchor patterns ───────────────────────────────────────────────────
# At least ONE anchor must be present for the document to pass.

RESUME_ANCHORS: List[List[str]] = [
    ["curriculum vitae", " cv\n", "\ncv ", "resume\n", "résumé"],
    ["career objective", "professional summary", "profile summary",
     "about me", "seeking a position", "i am a fresh", "aspiring"],
    ["i hereby declare", "i solemnly declare",
     "the above information is true"],
    ["@gmail", "@yahoo", "@outlook", "@hotmail", "@rediffmail"],
    ["work experience\n", "professional experience\n",
     "employment history\n", "internship\n", "internships\n"],
    ["cgpa", "gpa:", "percentage:", "pass out year",
     "pursuing b.tech", "pursuing b.e", "pursuing m.tech"],
    ["projects\n", "personal projects\n", "academic projects\n"],
    ["technical skills\n", "key skills\n",
     "core competencies\n", "programming languages\n"],
]


# ── Public helpers ─────────────────────────────────────────────────────────

def score_document(text: str) -> Dict[str, Any]:
    """
    Score the document for resume-likeness.

    Returns:
        confidence      – net integer score (clamped 0-100)
        anchor_found    – bool
        document_type   – human-readable hint for the error message
        positive_hits   – list of matched positive pattern labels
        negative_hits   – list of matched negative pattern labels
    """
    lower = text.lower()

    confidence = 0
    positive_hits: List[str] = []
    negative_hits: List[str] = []

    for patterns, score in POSITIVE_SIGNALS:
        if any(p in lower for p in patterns):
            confidence += score
            positive_hits.append(patterns[0])

    for patterns, score in NEGATIVE_SIGNALS:
        if any(p in lower for p in patterns):
            confidence += score          # score is negative
            negative_hits.append(patterns[0])

    anchor_found = any(
        any(p in lower for p in group)
        for group in RESUME_ANCHORS
    )

    # Derive document type hint
    document_type = "document"
    if any(h in negative_hits for h in
           ["unit 1", "chapter 1", "learning objectives",
            "viva questions", "syllabus"]):
        document_type = "class notes or study material"
    elif any(h in negative_hits for h in
             ["answer all questions", "maximum marks:", "question no."]):
        document_type = "question paper or exam paper"
    elif any(h in negative_hits for h in
             ["assignment no", "problem statement:", "aim:"]):
        document_type = "assignment or lab report"
    elif any(h in negative_hits for h in
             ["abstract:", "doi:", "issn:", "methodology:"]):
        document_type = "research paper or journal article"
    elif any(h in negative_hits for h in
             ["this is to certify", "certificate of completion"]):
        document_type = "certificate"
    elif any(h in negative_hits for h in
             ["notice:", "circular:", "examination schedule"]):
        document_type = "college notice or circular"
    elif any(h in negative_hits for h in
             ["table of contents", "bibliography:", "preface:"]):
        document_type = "textbook or academic document"

    confidence = max(0, min(100, confidence))

    return {
        "confidence":    confidence,
        "anchor_found":  anchor_found,
        "document_type": document_type,
        "positive_hits": positive_hits,
        "negative_hits": negative_hits,
    }


class ResumeValidator:
    """
    Validates whether the extracted text represents a real resume/CV.
    """

    MIN_TEXT_LENGTH = 100   # characters; anything shorter is auto-rejected

    @staticmethod
    def validate(text: str) -> Tuple[bool, List[str], Dict[str, Any]]:
        """
        Returns:
            is_valid   – True if the document is likely a resume
            issues     – list of human-readable rejection reasons
            detail     – full scoring detail dict
        """
        issues: List[str] = []

        if not text or len(text.strip()) < ResumeValidator.MIN_TEXT_LENGTH:
            return False, ["Document is too short or empty."], {}

        detail = score_document(text)
        confidence   = detail["confidence"]
        anchor_found = detail["anchor_found"]
        doc_type     = detail["document_type"]

        import logging
        logging.getLogger(__name__).info(
            "[ResumeValidator] confidence=%d anchor=%s neg=%s",
            confidence, anchor_found, detail["negative_hits"],
        )

        if not anchor_found or confidence < CONFIDENCE_THRESHOLD:
            msg = "The uploaded document does not appear to be a resume or CV."
            if doc_type != "document":
                msg += f" It looks like a {doc_type}."
            issues.append(msg)
            issues.append(
                "Please upload a resume containing your personal information, "
                "education, skills, projects, experience, or certifications."
            )
            return False, issues, detail

        return True, [], detail
