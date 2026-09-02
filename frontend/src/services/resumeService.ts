/**
 * resumeService.ts
 *
 * Two-stage resume validation:
 *   Stage 1 – file type + size check (cheap, no I/O)
 *   Stage 2 – text extraction + confidence scoring
 *
 * CONFIDENCE SCORING
 * ------------------
 * Positive signals: resume identity markers, contact info, sections
 * Negative signals: class-note / question-paper / assignment / certificate
 *                   / research-paper / academic-document patterns
 *
 * A document must reach a NET confidence ≥ 55 AND pass a hard structural
 * gate (name/contact + at least one substantive resume section) to be
 * accepted.  Simple keyword presence is never enough on its own.
 */

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import type { ExtractedResumeInfo } from '../types';

// ── pdfjs worker ───────────────────────────────────────────────────────────
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// ── constants ──────────────────────────────────────────────────────────────
const VALID_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE_MB = 10;

/** Net confidence threshold — must be ≥ this to pass */
const CONFIDENCE_THRESHOLD = 55;

// ── POSITIVE scoring tables ────────────────────────────────────────────────
// Each entry: [patterns_to_match, score_awarded]
// A pattern matches if the LOWERCASED full text contains the string.
// Score is awarded only ONCE per entry regardless of how many patterns match.

const POSITIVE_SIGNALS: [string[], number][] = [
  // Identity / contact — strongest resume markers
  [['curriculum vitae', ' cv ', '\ncv\n', 'resume', 'résumé'],            15],
  [['@gmail', '@yahoo', '@outlook', '@hotmail', '@email', 'email:', 'e-mail:'], 10],
  [['phone:', 'mobile:', 'contact:', 'tel:', '+91', '+1 ', '+44'],          8],
  [['linkedin.com', 'github.com', 'portfolio', 'website:'],                 5],

  // Education section — genuine resume phrasing
  [['b.tech', 'b.e.', 'b.sc', 'm.tech', 'm.sc', 'mba', 'bca', 'mca',
    'bachelor of', 'master of', 'diploma in', 'pursuing'],                 12],
  [['university', 'institute of technology', 'college of engineering',
    'cgpa', 'gpa', 'percentage:', 'pass out', 'graduated'],                10],
  [['education', 'academic background', 'academic qualification',
    'academic details', 'educational qualification'],                        8],

  // Skills / tech — only if under a recognisable section heading
  [['technical skills', 'core competencies', 'key skills',
    'areas of expertise', 'skill set', 'proficiencies'],                   10],
  [['programming languages', 'frameworks and libraries',
    'tools & technologies', 'software skills'],                              8],

  // Work / experience — person-centric phrasing
  [['work experience', 'professional experience', 'employment history',
    'career history', 'job experience', 'work history'],                   12],
  [['internship', 'trainee', 'apprenticeship', 'summer intern',
    'intern at', 'interned at'],                                            10],
  [['responsibilities:', 'key responsibilities', 'role:', 'designation:',
    'worked at', 'working at', 'worked as', 'working as'],                  8],

  // Projects — personal project descriptions
  [['personal projects', 'academic projects', 'project title',
    'developed a', 'built a', 'implemented a', 'created a',
    'technologies used:', 'tech stack:'],                                   10],

  // Objective / summary — person speaking about themselves
  [['career objective', 'professional summary', 'profile summary',
    'about me', 'personal statement', 'objective:',
    'seeking a position', 'looking for an opportunity',
    'aspiring to', 'i am a', 'i have', 'my goal'],                        10],

  // Certifications / achievements
  [['certified in', 'certification in', 'certificate course',
    'completed a course', 'awarded', 'achievement'],                         6],

  // Declaration (very resume-specific)
  [['i hereby declare', 'i solemnly declare',
    'the above information is true', 'to the best of my knowledge'],       15],

  // References
  [['references available', 'references on request',
    'available on request'],                                                  5],
];

// ── NEGATIVE scoring tables ────────────────────────────────────────────────
// Match any pattern → subtract score from confidence.

const NEGATIVE_SIGNALS: [string[], number][] = [
  // Class notes / lecture notes
  [['unit 1', 'unit 2', 'unit 3', 'unit 4', 'unit 5',
    'unit i', 'unit ii', 'unit iii', 'lecture notes',
    'learning objectives', 'course outcomes', 'module 1',
    'module 2', 'topic:', 'subtopic:'],                                    -25],
  [['chapter 1', 'chapter 2', 'chapter 3', 'chapter 4',
    'chapter i', 'chapter ii', 'introduction to',
    'definition:', 'theorem:', 'proof:', 'lemma:'],                        -20],
  [['viva questions', 'viva voce', 'important questions',
    'two marks', 'three marks', 'five marks', '16 marks',
    'short answer', 'long answer'],                                        -25],
  [['syllabus', 'course code', 'credit hours', 'l t p c',
    'l-t-p', 'subject code', 'regulation:'],                               -20],

  // Question papers / exams
  [['answer all questions', 'attempt any', 'all questions carry',
    'maximum marks', 'time allowed', 'time: 3 hours',
    'internal marks', 'external marks',
    'part a', 'part b', 'part c', 'section a', 'section b'],              -30],
  [['question no.', 'q.no.', 'q1.', 'q2.', 'q3.',
    'choose the best', 'choose the correct answer',
    'fill in the blank', 'true or false', 'match the following'],          -25],

  // Assignment / homework
  [['assignment no', 'assignment -', 'problem statement:',
    'submission date', 'due date:', 'submitted by:',
    'submitted to:', 'roll no:', 'reg no:',
    'experiment no', 'aim:', 'apparatus:', 'procedure:', 'result:'],       -25],

  // Research paper
  [['abstract:', 'keywords:', 'methodology:', 'literature review',
    'related work', 'experimental results', 'conclusion and future work',
    'doi:', 'issn:', 'ieee', 'springer', 'elsevier',
    'volume ', 'issue ', 'journal of'],                                    -25],

  // Certificate (not a resume)
  [['this is to certify', 'certificate of completion',
    'certificate of participation', 'has successfully completed',
    'awarded to', 'in recognition of', 'presented to'],                    -30],

  // College / institutional circular / notice
  [['notice:', 'circular:', 'all students are informed',
    'attention:', 'examination schedule', 'timetable',
    'hall ticket', 'admit card', 'internal assessment',
    'announcement:', 'this is to inform'],                                  -30],

  // Textbook / book-like structure
  [['table of contents', 'index:', 'appendix:', 'bibliography:',
    'foreword:', 'preface:', 'acknowledgements:',
    'list of figures', 'list of tables'],                                   -20],
];

// ── HARD-GATE checks ───────────────────────────────────────────────────────
// Document passes only if at least ONE of these "anchor" groups is found.
// These are phrases that appear in real resumes but almost never elsewhere.

const RESUME_ANCHOR_PATTERNS: string[][] = [
  // Personal identity
  ['curriculum vitae', ' cv\n', '\ncv ', 'resume\n', 'résumé'],
  // Career objective phrasing
  ['career objective', 'professional summary', 'profile summary',
   'about me', 'seeking a position', 'i am a fresh', 'aspiring'],
  // Declaration
  ['i hereby declare', 'i solemnly declare', 'the above information is true'],
  // Contact block
  ['@gmail', '@yahoo', '@outlook', '@hotmail'],
  // Work/internship section heading (exact headings only, not loose words)
  ['work experience\n', 'professional experience\n', 'employment history\n',
   'internship\n', 'internships\n'],
  // Education with grades
  ['cgpa', 'gpa:', 'percentage:', 'pass out year', 'pursuing b.tech',
   'pursuing b.e', 'pursuing m.tech'],
  // Project section heading (exact)
  ['projects\n', 'personal projects\n', 'academic projects\n'],
  // Skills section heading (exact)
  ['technical skills\n', 'key skills\n', 'core competencies\n',
   'programming languages\n'],
];

// ── types ──────────────────────────────────────────────────────────────────

export type ResumeValidationStatus =
  | 'valid'
  | 'invalid'
  | 'scanned'
  | 'error';

export interface ResumeProcessResult {
  status: ResumeValidationStatus;
  reason?: string;
  extractedInfo?: ExtractedResumeInfo;
  id?: string;
  rawText?: string;
  /** Internal confidence 0-100 — useful for debugging */
  confidence?: number;
}

// ── file I/O helpers ───────────────────────────────────────────────────────

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(
      content.items.map((item: any) => ('str' in item ? item.str : '')).join(' '),
    );
  }
  return pages.join('\n');
}

async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

// ── confidence engine ──────────────────────────────────────────────────────

interface ScoreResult {
  confidence: number;
  positiveHits: string[];
  negativeHits: string[];
  anchorFound: boolean;
  documentTypeHint: string;
}

function scoreDocument(raw: string): ScoreResult {
  // Normalise: lowercase, collapse whitespace, preserve newlines
  const lower = raw.toLowerCase().replace(/[^\S\n]+/g, ' ');

  let confidence = 0;
  const positiveHits: string[] = [];
  const negativeHits: string[] = [];

  // Positive signals
  for (const [patterns, score] of POSITIVE_SIGNALS) {
    if (patterns.some(p => lower.includes(p))) {
      confidence += score;
      positiveHits.push(patterns[0]);
    }
  }

  // Negative signals
  for (const [patterns, score] of NEGATIVE_SIGNALS) {
    if (patterns.some(p => lower.includes(p))) {
      confidence += score; // score is already negative
      negativeHits.push(patterns[0]);
    }
  }

  // Hard anchor check — at least one anchor must be present
  const anchorFound = RESUME_ANCHOR_PATTERNS.some(group =>
    group.some(p => lower.includes(p)),
  );

  // Derive a human-readable document type hint for the error message
  let documentTypeHint = 'document';
  if (negativeHits.some(h =>
    ['unit 1', 'chapter 1', 'learning objectives', 'viva questions',
     'important questions', 'syllabus'].includes(h))) {
    documentTypeHint = 'class notes or study material';
  } else if (negativeHits.some(h =>
    ['answer all questions', 'maximum marks', 'part a', 'question no.'].includes(h))) {
    documentTypeHint = 'question paper or exam paper';
  } else if (negativeHits.some(h =>
    ['assignment no', 'problem statement:', 'aim:'].includes(h))) {
    documentTypeHint = 'assignment or lab report';
  } else if (negativeHits.some(h =>
    ['abstract:', 'doi:', 'issn:', 'methodology:'].includes(h))) {
    documentTypeHint = 'research paper or journal article';
  } else if (negativeHits.some(h =>
    ['this is to certify', 'certificate of completion'].includes(h))) {
    documentTypeHint = 'certificate';
  } else if (negativeHits.some(h =>
    ['notice:', 'circular:', 'examination schedule'].includes(h))) {
    documentTypeHint = 'college notice or circular';
  } else if (negativeHits.some(h =>
    ['table of contents', 'bibliography:', 'preface:'].includes(h))) {
    documentTypeHint = 'textbook or academic document';
  }

  // Cap between 0 and 100
  confidence = Math.min(100, Math.max(0, confidence));

  return { confidence, positiveHits, negativeHits, anchorFound, documentTypeHint };
}

// ── info extractor ─────────────────────────────────────────────────────────

function extractInfoFromText(text: string): ExtractedResumeInfo {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const SECTION_HEADERS = new Set([
    'education', 'skills', 'experience', 'projects', 'summary', 'objective',
    'profile', 'contact', 'certifications', 'achievements', 'internship',
    'languages', 'references', 'career', 'qualification', 'declaration',
  ]);

  // Name — first 2–4 word line near the top, no digits, not a header
  let name = '';
  for (const line of lines.slice(0, 8)) {
    const words = line.split(/\s+/);
    if (
      words.length >= 2 && words.length <= 5 &&
      !/\d/.test(line) && !/@/.test(line) &&
      !SECTION_HEADERS.has(line.toLowerCase()) &&
      line.length < 60
    ) {
      name = line;
      break;
    }
  }

  const emailMatch = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch?.[0] ?? '';

  const phoneMatch = text.match(/(\+?\d[\d\s\-().]{8,14}\d)/);
  const phone = phoneMatch?.[0]?.trim() ?? '';

  function extractSection(keywords: string[]): string[] {
    const result: string[] = [];
    let inSection = false;
    const nextSectionRe = /^(education|experience|skills|projects|certifications?|achievements?|internship|summary|objective|profile|contact|languages?|references?|career|qualification|declaration|hobbies|interests)/i;
    for (const line of lines) {
      const lineLower = line.toLowerCase();
      if (keywords.some(kw => lineLower.startsWith(kw))) {
        inSection = true;
        continue;
      }
      if (inSection) {
        if (nextSectionRe.test(lineLower) && !keywords.some(kw => lineLower.startsWith(kw))) break;
        if (line.length > 2 && !/^\d+$/.test(line)) result.push(line);
        if (result.length >= 10) break;
      }
    }
    return result;
  }

  const skillLines = extractSection([
    'skill', 'technical skill', 'core competenc', 'technologies', 'tools',
    'expertise', 'programming language', 'framework',
  ]);
  const skills: string[] = [];
  for (const line of skillLines) {
    line.split(/[,|•·\-–/]/).map(t => t.trim()).filter(t => t.length > 1 && t.length < 40).forEach(t => skills.push(t));
    if (skills.length >= 20) break;
  }

  const education      = extractSection(['education', 'qualification', 'academic']).slice(0, 6);
  const experience     = extractSection(['experience', 'employment', 'work history', 'professional']).slice(0, 6);
  const projects       = extractSection(['project']).slice(0, 6);
  const internships    = extractSection(['internship', 'intern']).slice(0, 4);
  const certifications = extractSection(['certification', 'certificate', 'certified', 'achievement', 'award']).slice(0, 6);

  const techPattern = /\b(Python|JavaScript|TypeScript|Java|C\+\+|C#|Go|Rust|PHP|Ruby|Swift|Kotlin|React|Angular|Vue|Node\.?js|FastAPI|Django|Flask|Spring|Express|Next\.?js|PostgreSQL|MySQL|MongoDB|Redis|Docker|Kubernetes|AWS|Azure|GCP|Git|Linux|TensorFlow|PyTorch|Pandas|NumPy|SQL|HTML|CSS|Tailwind|Bootstrap|GraphQL|REST|Machine Learning|Deep Learning|NLP|OpenCV|Hadoop|Spark|R\b|MATLAB|PowerBI|Tableau)\b/gi;
  const technologies  = [...new Set((text.match(techPattern) || []).map(t => t.trim()))].slice(0, 20);

  const summaryLines = extractSection(['summary', 'objective', 'profile', 'about', 'overview', 'career objective']);
  const summary = summaryLines.slice(0, 3).join(' ').trim();

  return {
    name, email, phone, summary,
    education,
    skills: [...new Set(skills)].slice(0, 20),
    projects, experience, internships, certifications, technologies,
  };
}

// ── public API ─────────────────────────────────────────────────────────────

export const resumeService = {
  validateFile(file: File): { valid: boolean; error?: string } {
    const mimeOk = VALID_MIME_TYPES.includes(file.type);
    const extOk  = /\.(pdf|docx)$/i.test(file.name);
    if (!mimeOk && !extOk) {
      return { valid: false, error: 'Unsupported file type. Please upload your resume as a PDF or DOCX file.' };
    }
    if (file.size === 0) {
      return { valid: false, error: 'The file is empty.' };
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return { valid: false, error: `File must be under ${MAX_SIZE_MB} MB.` };
    }
    return { valid: true };
  },

  async processResume(file: File): Promise<ResumeProcessResult> {
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const isPdf  = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

      let rawText = '';
      if (isPdf) {
        rawText = await extractPdfText(buffer);
      } else {
        rawText = await extractDocxText(buffer);
      }

      // ── Scanned / empty PDF ──────────────────────────────────────────────
      if (isPdf && rawText.trim().length < 80) {
        return {
          status: 'scanned',
          reason:
            'Unable to extract text from this PDF. It may be a scanned or image-based document. ' +
            'Please upload a text-based PDF or DOCX version of your resume.',
        };
      }

      // ── Empty DOCX ───────────────────────────────────────────────────────
      if (!isPdf && rawText.trim().length < 80) {
        return {
          status: 'invalid',
          reason: 'The DOCX file appears to be empty or contains no readable text. Please upload a resume with actual content.',
        };
      }

      // ── Confidence scoring ───────────────────────────────────────────────
      const { confidence, anchorFound, documentTypeHint, negativeHits } = scoreDocument(rawText);

      console.log(
        `[ResumeValidator] confidence=${confidence} anchorFound=${anchorFound}` +
        ` negativeHits=[${negativeHits.join(', ')}]`,
      );

      // A document fails if:
      //   • confidence is below threshold, OR
      //   • no resume anchor pattern was found (catches clever documents that
      //     happen to score well on positive signals alone)
      if (confidence < CONFIDENCE_THRESHOLD || !anchorFound) {
        let reason = 'The uploaded document does not appear to be a resume or CV. ';
        if (documentTypeHint !== 'document') {
          reason += `It looks like a ${documentTypeHint}. `;
        }
        reason += 'Please upload a resume containing your personal information, education, skills, projects, experience, or certifications.';
        return { status: 'invalid', reason, confidence };
      }

      // ── Passed — extract structured info ────────────────────────────────
      const extractedInfo = extractInfoFromText(rawText);
      return { status: 'valid', extractedInfo, rawText, confidence };

    } catch (err: any) {
      console.error('[ResumeValidator] error:', err);
      return {
        status: 'error',
        reason: 'Failed to read the file. It may be corrupted or password-protected. Please try another file.',
      };
    }
  },

  formatFileSize(bytes: number): string {
    if (bytes < 1024)           return `${bytes} B`;
    if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },
};
