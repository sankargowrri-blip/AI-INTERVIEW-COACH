import { useCallback, useState } from 'react';
import {
  Upload, X, FileText, CheckCircle, AlertCircle, Loader2, AlertTriangle,
} from 'lucide-react';
import { useInterview } from '../../../context/InterviewContext';
import { resumeService } from '../../../services/resumeService';
import type { ResumeProcessResult } from '../../../services/resumeService';
import Button from '../../common/Button';
import { clsx } from 'clsx';

// ── small presentational helpers ─────────────────────────────────────────────

interface TagListProps {
  label: string;
  items: string[];
}
function TagList({ label, items }: TagListProps) {
  const filtered = items.filter(Boolean);
  if (filtered.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {filtered.map((item, i) => (
          <span
            key={`${label}-${i}`}
            className="text-xs bg-surface-100 text-surface-700 px-2 py-0.5 rounded-full"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── component ─────────────────────────────────────────────────────────────────

export default function StepResume() {
  const { setResume, setCurrentStep } = useInterview();

  const [isDragging, setIsDragging]   = useState(false);
  const [file, setFile]               = useState<File | null>(null);
  const [fileError, setFileError]     = useState('');
  const [result, setResult]           = useState<ResumeProcessResult | null>(null);

  // Derive display status from result
  type DisplayStatus = 'idle' | 'processing' | 'valid' | 'invalid' | 'scanned' | 'error';
  const status: DisplayStatus = (() => {
    if (!file && !result) return 'idle';
    if (file && !result)  return 'processing';
    return (result?.status ?? 'idle') as DisplayStatus;
  })();

  // ── core processing ──────────────────────────────────────────────────────

  const processFile = useCallback(async (f: File) => {
    // 1. cheap client-side checks first
    const validation = resumeService.validateFile(f);
    if (!validation.valid) {
      setFileError(validation.error ?? 'Invalid file.');
      return;
    }

    setFile(f);
    setResult(null);           // triggers 'processing' display
    setFileError('');
    setResume({ fileName: f.name, fileSize: f.size, status: 'processing' });

    // 2. parse + validate content
    const res = await resumeService.processResume(f);
    setResult(res);

    if (res.status === 'valid' && res.extractedInfo) {
      setResume({
        fileName:      f.name,
        fileSize:      f.size,
        status:        'valid',
        extractedInfo: res.extractedInfo,
      });
    } else {
      setResume({ fileName: f.name, fileSize: f.size, status: 'invalid' });
    }
  }, [setResume]);

  // ── drag & drop / file input ─────────────────────────────────────────────

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = '';
  };

  const handleRemove = () => {
    setFile(null);
    setResult(null);
    setFileError('');
    setResume(null);
  };

  // ── render ───────────────────────────────────────────────────────────────

  const info = result?.status === 'valid' ? result.extractedInfo : undefined;

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">Upload Your Resume</h2>
      <p className="text-surface-500 text-sm mb-6">
        Your resume helps personalise the interview questions. Accepted formats: PDF, DOCX.
      </p>

      {/* ── Upload zone ── */}
      {status === 'idle' && (
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={clsx(
            'border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer',
            isDragging
              ? 'border-primary-400 bg-primary-50'
              : 'border-surface-300 hover:border-primary-400 hover:bg-primary-50/30',
          )}
        >
          <Upload className="w-10 h-10 text-surface-300 mx-auto mb-3" aria-hidden="true" />
          <p className="font-medium text-surface-700 mb-1">Drag &amp; drop your resume here</p>
          <p className="text-surface-400 text-sm mb-4">or</p>
          <label className="btn-primary cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium">
            <FileText className="w-4 h-4" aria-hidden="true" />
            Browse Files
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              onChange={handleFileChange}
              aria-label="Upload resume file"
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
        <div className="border border-surface-200 rounded-xl p-8 text-center bg-white">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-3" aria-hidden="true" />
          <p className="font-medium text-surface-700">Analysing resume…</p>
          <p className="text-sm text-surface-500 mt-1">Reading content and verifying it's a resume.</p>
        </div>
      )}

      {/* ── Valid ── */}
      {status === 'valid' && info && (
        <div className="border border-emerald-200 rounded-xl bg-emerald-50 p-5">
          {/* header */}
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-emerald-800">✓ Resume Verified</p>
              <p className="text-sm text-emerald-600 truncate">
                {file?.name} · {resumeService.formatFileSize(file?.size ?? 0)}
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="ml-auto p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors"
              aria-label="Remove resume"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* extracted info */}
          <div className="bg-white rounded-lg border border-emerald-100 p-4 space-y-3">
            <h3 className="font-semibold text-surface-900 text-sm">Extracted Information</h3>

            {/* Name */}
            {info.name && (
              <div>
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">Name</p>
                <p className="text-sm text-surface-800 font-medium">{info.name}</p>
              </div>
            )}

            {/* Contact */}
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

            {/* Summary */}
            {info.summary && (
              <div>
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">Summary</p>
                <p className="text-xs text-surface-600 leading-relaxed line-clamp-3">{info.summary}</p>
              </div>
            )}

            <TagList label="Education"       items={info.education}      />
            <TagList label="Skills"          items={info.skills}         />
            <TagList label="Technologies"    items={info.technologies}   />
            <TagList label="Projects"        items={info.projects}       />
            <TagList label="Experience"      items={info.experience}     />
            <TagList label="Internships"     items={info.internships}    />
            <TagList label="Certifications"  items={info.certifications} />
          </div>

          <p className="text-xs text-emerald-600 mt-3 italic">
            * Extraction is done locally in the browser. Full AI-powered analysis will be available once connected to the backend.
          </p>
        </div>
      )}

      {/* ── Scanned PDF ── */}
      {status === 'scanned' && (
        <div className="border border-amber-200 rounded-xl bg-amber-50 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" aria-hidden="true" />
          <h3 className="font-semibold text-amber-800 mb-2">Scanned PDF Detected</h3>
          <p className="text-sm text-amber-700 max-w-sm mx-auto mb-4">
            {result?.reason ?? 'Unable to extract text from this PDF. Please upload a text-based PDF or DOCX file.'}
          </p>
          <Button variant="secondary" onClick={handleRemove}>Upload Another Resume</Button>
        </div>
      )}

      {/* ── Invalid ── */}
      {status === 'invalid' && (
        <div className="border border-red-200 rounded-xl bg-red-50 p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" aria-hidden="true" />
          <h3 className="font-semibold text-red-800 mb-2">Invalid Resume</h3>
          <p className="text-sm text-red-700 max-w-sm mx-auto mb-4">
            {result?.reason ??
              'The uploaded document does not appear to be a resume. Please upload a resume containing education, skills, projects, experience, or certifications.'}
          </p>
          <Button variant="secondary" onClick={handleRemove}>Upload Another Resume</Button>
        </div>
      )}

      {/* ── Error ── */}
      {status === 'error' && (
        <div className="border border-red-200 rounded-xl bg-red-50 p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" aria-hidden="true" />
          <h3 className="font-semibold text-red-800 mb-2">Could Not Read File</h3>
          <p className="text-sm text-red-700 max-w-sm mx-auto mb-4">
            {result?.reason ?? 'The file could not be read. It may be corrupted. Please try another file.'}
          </p>
          <Button variant="secondary" onClick={handleRemove}>Upload Another Resume</Button>
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex justify-between mt-6">
        <Button variant="secondary" onClick={() => setCurrentStep('experience')}>
          Back
        </Button>
        <Button
          onClick={() => setCurrentStep('role')}
          disabled={status !== 'valid'}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
