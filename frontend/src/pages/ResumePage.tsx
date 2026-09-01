import { useState, useCallback } from 'react';
import {
  Upload, FileText, CheckCircle, AlertCircle, AlertTriangle,
  X, TrendingUp, Loader2,
} from 'lucide-react';
import { resumeService } from '../services/resumeService';
import type { ResumeProcessResult } from '../services/resumeService';
import type { ExtractedResumeInfo } from '../types';
import ProgressBar from '../components/common/ProgressBar';
import Button from '../components/common/Button';
import { clsx } from 'clsx';

// ── mock ATS data (replaced by real backend data once API is wired) ───────────
const MOCK_ATS = {
  atsScore: 78,
  qualityScore: 82,
  suggestions: [
    {
      category: 'Wording',
      issue: 'Some bullet points use passive voice.',
      suggestion: 'Use strong action verbs like "Built", "Achieved", "Led", "Improved".',
      priority: 'high' as const,
    },
    {
      category: 'Achievements',
      issue: 'Most project descriptions lack measurable outcomes.',
      suggestion: 'Add quantified results: "Reduced load time by 35%", "Processed 10k records/hour".',
      priority: 'high' as const,
    },
    {
      category: 'Skills',
      issue: 'Skills section does not list all relevant tools shown in projects.',
      suggestion: 'Add tools such as Tableau, Power BI, or any relevant technology used in projects.',
      priority: 'medium' as const,
    },
    {
      category: 'Project Descriptions',
      issue: 'Project descriptions are brief and lack technical depth.',
      suggestion: 'Expand descriptions to include architecture, your specific contribution, and outcomes.',
      priority: 'medium' as const,
    },
    {
      category: 'Formatting',
      issue: 'Section headers are inconsistent in style.',
      suggestion: 'Standardise all section headers to the same font size and weight throughout.',
      priority: 'low' as const,
    },
  ],
};

const PRIORITY_COLOR = {
  high:   'text-red-600 bg-red-50 border-red-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  low:    'text-surface-600 bg-surface-50 border-surface-200',
};

// ── small helpers ─────────────────────────────────────────────────────────────

interface TagListProps { label: string; items: string[] }
function TagList({ label, items }: TagListProps) {
  const filtered = items.filter(Boolean);
  if (filtered.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {filtered.map((item, i) => (
          <span key={`${label}-${i}`} className="text-xs bg-surface-100 text-surface-700 px-2 py-0.5 rounded-full">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── component ─────────────────────────────────────────────────────────────────

type DisplayStatus = 'idle' | 'processing' | 'valid' | 'invalid' | 'scanned' | 'error';

export default function ResumePage() {
  const [file, setFile]           = useState<File | null>(null);
  const [result, setResult]       = useState<ResumeProcessResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');

  const status: DisplayStatus = (() => {
    if (!file && !result) return 'idle';
    if (file && !result)  return 'processing';
    return (result?.status ?? 'idle') as DisplayStatus;
  })();

  // ── process ──────────────────────────────────────────────────────────────

  const processFile = useCallback(async (f: File) => {
    const v = resumeService.validateFile(f);
    if (!v.valid) { setFileError(v.error ?? ''); return; }
    setFile(f);
    setResult(null);
    setFileError('');
    const res = await resumeService.processResume(f);
    setResult(res);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = '';
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setFileError('');
  };

  const info: ExtractedResumeInfo | undefined =
    result?.status === 'valid' ? result.extractedInfo : undefined;

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Resume</h1>
        <p className="text-surface-500 text-sm mt-1">
          Upload your resume to get ATS analysis and improvement suggestions.
        </p>
      </div>

      {/* ── Upload area ── */}
      {status === 'idle' && (
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={clsx(
            'border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer',
            isDragging
              ? 'border-primary-400 bg-primary-50'
              : 'border-surface-300 hover:border-primary-400 hover:bg-surface-50',
          )}
        >
          <Upload className="w-12 h-12 text-surface-300 mx-auto mb-4" aria-hidden="true" />
          <p className="text-lg font-medium text-surface-700 mb-1">Drop your resume here</p>
          <p className="text-surface-400 text-sm mb-5">or</p>
          <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
            <FileText className="w-4 h-4" aria-hidden="true" /> Browse Files
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              onChange={handleChange}
              aria-label="Upload resume"
            />
          </label>
          <p className="text-xs text-surface-400 mt-3">PDF or DOCX · Max 10 MB</p>
          {fileError && (
            <p role="alert" className="text-xs text-red-600 mt-2">{fileError}</p>
          )}
        </div>
      )}

      {/* ── Processing ── */}
      {status === 'processing' && (
        <div className="bg-white border border-surface-200 rounded-xl p-10 text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-3" aria-hidden="true" />
          <p className="font-medium text-surface-700">Analysing your resume…</p>
          <p className="text-sm text-surface-500 mt-1">Reading content and verifying it's a resume.</p>
        </div>
      )}

      {/* ── Scanned PDF ── */}
      {status === 'scanned' && (
        <div className="border border-amber-200 rounded-xl bg-amber-50 p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" aria-hidden="true" />
          <h2 className="font-bold text-amber-800 mb-2">Scanned PDF Detected</h2>
          <p className="text-sm text-amber-700 max-w-sm mx-auto mb-5">
            {result?.reason ??
              'Unable to extract text from this PDF. Please upload a text-based PDF or DOCX file.'}
          </p>
          <Button variant="secondary" onClick={reset}>Upload Another Resume</Button>
        </div>
      )}

      {/* ── Invalid ── */}
      {(status === 'invalid' || status === 'error') && (
        <div className="border border-red-200 rounded-xl bg-red-50 p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" aria-hidden="true" />
          <h2 className="font-bold text-red-800 mb-2">
            {status === 'error' ? 'Could Not Read File' : 'Invalid Resume'}
          </h2>
          <p className="text-sm text-red-700 max-w-sm mx-auto mb-5">
            {result?.reason ??
              'The uploaded document does not appear to be a resume. Please upload a resume containing education, skills, projects, experience, or certifications.'}
          </p>
          <Button variant="secondary" onClick={reset}>Upload Another Resume</Button>
        </div>
      )}

      {/* ── Valid ── */}
      {status === 'valid' && info && (
        <>
          {/* File info bar */}
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-emerald-800 truncate">{file?.name}</p>
              <p className="text-sm text-emerald-600">
                {resumeService.formatFileSize(file?.size ?? 0)} · Resume verified
              </p>
            </div>
            <button
              onClick={reset}
              className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-700 transition-colors"
              aria-label="Remove resume"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Extracted info panel */}
          <div className="bg-white border border-surface-200 rounded-xl p-5 sm:p-6 space-y-4">
            <h2 className="font-semibold text-surface-900">Extracted Information</h2>

            {info.name && (
              <div>
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">Name</p>
                <p className="text-sm font-medium text-surface-800">{info.name}</p>
              </div>
            )}

            {(info.email || info.phone) && (
              <div>
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">Contact</p>
                <div className="flex flex-wrap gap-2">
                  {info.email && (
                    <span className="text-xs bg-surface-100 text-surface-700 px-2 py-0.5 rounded-full">
                      {info.email}
                    </span>
                  )}
                  {info.phone && (
                    <span className="text-xs bg-surface-100 text-surface-700 px-2 py-0.5 rounded-full">
                      {info.phone}
                    </span>
                  )}
                </div>
              </div>
            )}

            {info.summary && (
              <div>
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">Summary</p>
                <p className="text-xs text-surface-600 leading-relaxed">{info.summary}</p>
              </div>
            )}

            <TagList label="Education"      items={info.education}      />
            <TagList label="Skills"         items={info.skills}         />
            <TagList label="Technologies"   items={info.technologies}   />
            <TagList label="Projects"       items={info.projects}       />
            <TagList label="Experience"     items={info.experience}     />
            <TagList label="Internships"    items={info.internships}    />
            <TagList label="Certifications" items={info.certifications} />

            <p className="text-xs text-surface-400 italic pt-1">
              * Extraction is done locally in the browser. Full AI-powered analysis will be available once connected to the backend.
            </p>
          </div>

          {/* ATS Scores */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white border border-surface-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-primary-600" aria-hidden="true" />
                <h2 className="font-semibold text-surface-900">ATS Score</h2>
              </div>
              <div className="text-4xl font-extrabold text-primary-600 mb-3">
                {MOCK_ATS.atsScore}
                <span className="text-lg text-surface-400 font-normal">/100</span>
              </div>
              <ProgressBar value={MOCK_ATS.atsScore} showValue={false} size="md" />
              <p className="text-xs text-surface-500 mt-2">ATS = Applicant Tracking System compatibility</p>
            </div>
            <div className="bg-white border border-surface-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                <h2 className="font-semibold text-surface-900">Resume Quality</h2>
              </div>
              <div className="text-4xl font-extrabold text-emerald-600 mb-3">
                {MOCK_ATS.qualityScore}
                <span className="text-lg text-surface-400 font-normal">/100</span>
              </div>
              <ProgressBar value={MOCK_ATS.qualityScore} showValue={false} size="md" color="success" />
              <p className="text-xs text-surface-500 mt-2">Based on content, structure, and clarity</p>
            </div>
          </div>

          {/* Improvement Suggestions */}
          <div className="bg-white border border-surface-200 rounded-xl p-5 sm:p-6">
            <h2 className="font-semibold text-surface-900 mb-4">Improvement Suggestions</h2>
            <div className="space-y-3">
              {MOCK_ATS.suggestions.map((s, i) => (
                <div key={i} className={clsx('rounded-xl border p-4', PRIORITY_COLOR[s.priority])}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={clsx(
                      'text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border',
                      PRIORITY_COLOR[s.priority],
                    )}>
                      {s.priority}
                    </span>
                    <span className="text-sm font-semibold">{s.category}</span>
                  </div>
                  <p className="text-sm mb-1.5 opacity-80">⚠ {s.issue}</p>
                  <p className="text-sm font-medium">✓ {s.suggestion}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-surface-400 mt-4 italic">
              * Resume scores and suggestions are indicative. Full AI-powered analysis will be available once connected to the backend.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
