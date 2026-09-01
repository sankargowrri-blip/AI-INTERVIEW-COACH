/**
 * resumeService.ts
 *
 * Handles all resume upload, parsing, and validation entirely on the frontend.
 * No backend call is made for validation — pdfjs-dist extracts PDF text,
 * mammoth extracts DOCX text, then a content heuristic decides validity.
 *
 * When the FastAPI backend is available, replace processResume() with an
 * axios.post() call and keep validateFile() / formatFileSize() as-is.
 */

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import type { ExtractedResumeInfo } from '../types';

// ── pdfjs worker ──────────────────────────────────────────────────────────────
// Point the worker at the copy shipped inside the pdfjs-dist package so we
// never get a cross-origin worker error in production.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// ── constants ─────────────────────────────────────────────────────────────────
const VALID_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE_MB = 10;

// ── keyword groups ────────────────────────────────────────────────────────────
// We check how many DISTINCT GROUPS are present in the text.
// A document needs hits in at least 2 groups to be considered a resume.
// This prevents a random PDF with one lucky word from passing.
const RESUME_KEYWORD_GROUPS: string[][] = [
  // Identity / contact
  ['email', 'phone', 'mobile', 'linkedin', 'github', 'address', 'contact'],
  // Education
  ['education', 'university', 'college', 'degree', 'bachelor', 'master',
    'b.tech', 'b.e', 'm.tech', 'bsc', 'msc', 'diploma', 'school', 'qualification'],
  // Skills
  ['skills', 'technical skills', 'technologies', 'tools', 'languages',
    'frameworks', 'proficient', 'expertise'],
  // Experience / work
  ['experience', 'work experience', 'employment', 'professional experience',
    'career', 'responsibilities', 'worked at', 'job', 'role', 'position'],
  // Projects
  ['project', 'projects', 'developed', 'built', 'implemented', 'designed',
    'created', 'portfolio'],
  // Achievements / extras
  ['internship', 'intern', 'certification', 'certified', 'achievement',
    'award', 'accomplishment', 'volunteer'],
  // Profile / summary
  ['summary', 'objective', 'profile', 'about me', 'overview', 'introduction'],
];

// Minimum groups that must match for a document to count as a resume
const MIN_GROUP_HITS = 2;

// ── types ─────────────────────────────────────────────────────────────────────
export type ResumeValidationStatus =
  | 'valid'
  | 'invalid'
  | 'scanned'   // PDF with no extractable text
  | 'error';

export interface ResumeProcessResult {
  status: ResumeValidationStatus;
  /** Human-readable reason shown to the user when status !== 'valid' */
  reason?: string;
  extractedInfo?: ExtractedResumeInfo;
  /** Backend resume ID — populated once the real API is wired up */
  id?: string;
  /** Raw extracted text — for debugging or sending to backend later */
  rawText?: string;
}

// ── helpers ───────────────────────────────────────────────────────────────────

/** Safely read a File as an ArrayBuffer */
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}

/** Extract all text from a PDF (all pages) using pdfjs-dist */
async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pageTexts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    pageTexts.push(pageText);
  }
  return pageTexts.join('\n');
}

/** Extract all text from a DOCX using mammoth */
async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

/**
 * Content-based heuristic: is this text likely a resume?
 * Returns the number of keyword groups matched (0–N).
 */
function countGroupHits(text: string): number {
  const lower = text.toLowerCase();
  let hits = 0;
  for (const group of RESUME_KEYWORD_GROUPS) {
    if (group.some(kw => lower.includes(kw))) {
      hits++;
    }
  }
  return hits;
}

/**
 * Extract structured info from raw text.
 * Uses simple regex patterns — good enough for a frontend mock that
 * can later be replaced by a real backend extraction response.
 */
function extractInfoFromText(text: string): ExtractedResumeInfo {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // ── name ── heuristic: first non-empty line that looks like a person name
  // (2-4 words, no digits, not a common section header)
  const SECTION_HEADERS = new Set([
    'education', 'skills', 'experience', 'projects', 'summary', 'objective',
    'profile', 'contact', 'certifications', 'achievements', 'internship',
    'languages', 'references', 'career', 'qualification',
  ]);
  let name = '';
  for (const line of lines.slice(0, 6)) {
    const words = line.split(/\s+/);
    if (
      words.length >= 2 &&
      words.length <= 4 &&
      !/\d/.test(line) &&
      !/@/.test(line) &&
      !SECTION_HEADERS.has(line.toLowerCase())
    ) {
      name = line;
      break;
    }
  }

  // ── email ──
  const emailMatch = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  // ── phone ──
  const phoneMatch = text.match(/(\+?\d[\d\s\-().]{8,14}\d)/);
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  // ── helper: extract lines under a section heading ──
  function extractSection(keywords: string[]): string[] {
    const result: string[] = [];
    let inSection = false;
    const nextSectionRe = /^(education|experience|skills|projects|certifications?|achievements?|internship|summary|objective|profile|contact|languages?|references?|career|qualification)/i;

    for (const line of lines) {
      const lineLower = line.toLowerCase();
      if (keywords.some(kw => lineLower.startsWith(kw))) {
        inSection = true;
        continue;
      }
      if (inSection) {
        if (nextSectionRe.test(lineLower) && !keywords.some(kw => lineLower.startsWith(kw))) {
          break;
        }
        // Skip very short tokens and lines that look like section headers themselves
        if (line.length > 2 && !/^\d+$/.test(line)) {
          result.push(line);
        }
        if (result.length >= 10) break;
      }
    }
    return result;
  }

  // ── skills ── also grab comma/pipe-separated tokens from skill lines
  const skillLines = extractSection(['skill', 'technical skill', 'technologies', 'tools', 'expertise', 'language', 'framework']);
  const skills: string[] = [];
  for (const line of skillLines) {
    const tokens = line.split(/[,|•·\-–/]/).map(t => t.trim()).filter(t => t.length > 1 && t.length < 40);
    skills.push(...tokens);
    if (skills.length >= 20) break;
  }

  // ── education ──
  const education = extractSection(['education', 'qualification', 'academic']).slice(0, 6);

  // ── experience ──
  const experience = extractSection(['experience', 'employment', 'work history', 'professional']).slice(0, 6);

  // ── projects ──
  const projects = extractSection(['project']).slice(0, 6);

  // ── internships ──
  const internships = extractSection(['internship', 'intern']).slice(0, 4);

  // ── certifications ──
  const certifications = extractSection(['certification', 'certificate', 'certified', 'achievement', 'award']).slice(0, 6);

  // ── technologies — pull tech-looking words from full text ──
  const techPattern = /\b(Python|JavaScript|TypeScript|Java|C\+\+|C#|Go|Rust|PHP|Ruby|Swift|Kotlin|React|Angular|Vue|Node\.?js|FastAPI|Django|Flask|Spring|Express|Next\.?js|PostgreSQL|MySQL|MongoDB|Redis|Docker|Kubernetes|AWS|Azure|GCP|Git|Linux|TensorFlow|PyTorch|Pandas|NumPy|SQL|HTML|CSS|Tailwind|Bootstrap|GraphQL|REST|API|Machine Learning|Deep Learning|NLP|OpenCV)\b/gi;
  const techMatches = text.match(techPattern) || [];
  const technologies = [...new Set(techMatches.map(t => t.trim()))].slice(0, 20);

  // ── summary ──
  const summaryLines = extractSection(['summary', 'objective', 'profile', 'about', 'overview']);
  const summary = summaryLines.slice(0, 3).join(' ').trim();

  return {
    name: name || '',
    email,
    phone,
    education,
    skills: [...new Set(skills)].slice(0, 20),
    projects,
    experience,
    internships,
    certifications,
    technologies,
    summary,
  };
}

// ── public API ────────────────────────────────────────────────────────────────

export const resumeService = {
  /**
   * Step 1 — validate file type and size before reading it.
   * This is intentionally cheap (no I/O).
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check MIME type — browsers set this from the OS file association
    const mimeOk = VALID_MIME_TYPES.includes(file.type);
    // Also check extension as a fallback (some OS configs return wrong MIME)
    const extOk = /\.(pdf|docx)$/i.test(file.name);
    if (!mimeOk && !extOk) {
      return { valid: false, error: 'Only PDF and DOCX files are supported.' };
    }
    if (file.size === 0) {
      return { valid: false, error: 'The file is empty.' };
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return { valid: false, error: `File must be under ${MAX_SIZE_MB} MB.` };
    }
    return { valid: true };
  },

  /**
   * Step 2 — parse and validate the file contents entirely in the browser.
   *
   * Flow:
   *   read ArrayBuffer
   *   → extract text (pdfjs / mammoth)
   *   → count keyword-group hits
   *   → return ResumeProcessResult
   *
   * Replace the body of this method with an axios.post() call once the
   * FastAPI /resumes/upload endpoint is ready for production.
   */
  async processResume(file: File): Promise<ResumeProcessResult> {
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

      let rawText = '';

      if (isPdf) {
        rawText = await extractPdfText(buffer);
      } else {
        rawText = await extractDocxText(buffer);
      }

      // Handle scanned / image-only PDFs
      if (isPdf && rawText.trim().length < 50) {
        return {
          status: 'scanned',
          reason:
            'Unable to extract text from this PDF. It may be a scanned or image-based resume. ' +
            'Please upload a text-based PDF or a DOCX file.',
        };
      }

      // Handle DOCX with no meaningful text
      if (!isPdf && rawText.trim().length < 50) {
        return {
          status: 'invalid',
          reason:
            'The DOCX file appears to be empty or contains no readable text. ' +
            'Please upload a resume with actual content.',
        };
      }

      // Content heuristic
      const groupHits = countGroupHits(rawText);
      if (groupHits < MIN_GROUP_HITS) {
        return {
          status: 'invalid',
          reason:
            'The uploaded document does not appear to be a resume. ' +
            'Please upload a resume containing education, skills, projects, experience, or certifications.',
          rawText,
        };
      }

      // Valid — extract structured info
      const extractedInfo = extractInfoFromText(rawText);

      return {
        status: 'valid',
        extractedInfo,
        rawText,
        // id will be populated by the backend once wired up
      };
    } catch (err: any) {
      console.error('Resume processing error:', err);
      return {
        status: 'error',
        reason: 'Failed to read the file. It may be corrupted. Please try another file.',
      };
    }
  },

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },
};
