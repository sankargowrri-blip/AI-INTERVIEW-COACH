import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, TrendingUp, Loader2 } from 'lucide-react';
import { resumeService } from '../services/resumeService';
import ProgressBar from '../components/common/ProgressBar';
import Button from '../components/common/Button';
import { clsx } from 'clsx';

const mockResumeImprovement = {
  atsScore: 78,
  qualityScore: 82,
  suggestions: [
    { category: 'Wording', issue: 'Some bullet points use passive voice.', suggestion: 'Use strong action verbs like "Built", "Achieved", "Led", "Improved".', priority: 'high' as const },
    { category: 'Achievements', issue: 'Most project descriptions lack measurable outcomes.', suggestion: 'Add quantified results: "Reduced load time by 35%", "Processed 10k records/hour".', priority: 'high' as const },
    { category: 'Skills', issue: 'Skills section does not list all relevant tools shown in projects.', suggestion: 'Add tools such as Tableau, Power BI, or any relevant technology used in projects.', priority: 'medium' as const },
    { category: 'Project Descriptions', issue: 'Project descriptions are brief and lack technical depth.', suggestion: 'Expand descriptions to include architecture, your specific contribution, and outcomes.', priority: 'medium' as const },
    { category: 'Formatting', issue: 'Section headers are inconsistent in style.', suggestion: 'Standardise all section headers to the same font size and weight throughout.', priority: 'low' as const },
  ],
};

const priorityColor = { high: 'text-red-600 bg-red-50 border-red-200', medium: 'text-amber-600 bg-amber-50 border-amber-200', low: 'text-surface-600 bg-surface-50 border-surface-200' };

export default function ResumePage() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'valid' | 'invalid'>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);

  const processFile = useCallback(async (f: File) => {
    const v = resumeService.validateFile(f);
    if (!v.valid) { setFileError(v.error || ''); return; }
    setFile(f);
    setStatus('processing');
    setFileError('');
    setShowAnalysis(false);
    const result = await resumeService.processResume(f);
    setStatus(result.valid ? 'valid' : 'invalid');
    if (result.valid) setShowAnalysis(true);
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

  const reset = () => { setFile(null); setStatus('idle'); setShowAnalysis(false); };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Resume</h1>
        <p className="text-surface-500 text-sm mt-1">Upload your resume to get ATS analysis and improvement suggestions.</p>
      </div>

      {/* Upload area */}
      {status === 'idle' && (
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={clsx(
            'border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer',
            isDragging ? 'border-primary-400 bg-primary-50' : 'border-surface-300 hover:border-primary-400 hover:bg-surface-50'
          )}
        >
          <Upload className="w-12 h-12 text-surface-300 mx-auto mb-4" aria-hidden="true" />
          <p className="text-lg font-medium text-surface-700 mb-1">Drop your resume here</p>
          <p className="text-surface-400 text-sm mb-5">or</p>
          <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
            <FileText className="w-4 h-4" aria-hidden="true" /> Browse Files
            <input type="file" accept=".pdf,.docx" className="sr-only" onChange={handleChange} aria-label="Upload resume" />
          </label>
          <p className="text-xs text-surface-400 mt-3">PDF or DOCX · Max 10 MB</p>
          {fileError && <p role="alert" className="text-xs text-red-600 mt-2">{fileError}</p>}
        </div>
      )}

      {/* Processing */}
      {status === 'processing' && (
        <div className="bg-white border border-surface-200 rounded-xl p-10 text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-3" aria-hidden="true" />
          <p className="font-medium text-surface-700">Analysing your resume...</p>
          <p className="text-sm text-surface-500 mt-1">Checking ATS compatibility and quality scores.</p>
        </div>
      )}

      {/* Invalid */}
      {status === 'invalid' && (
        <div className="border border-red-200 rounded-xl bg-red-50 p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" aria-hidden="true" />
          <h2 className="font-bold text-red-800 mb-2">Invalid Resume</h2>
          <p className="text-sm text-red-700 max-w-sm mx-auto mb-5">
            The uploaded document does not appear to be a valid resume. Please upload a resume containing
            education, skills, projects, experience, or certifications.
          </p>
          <Button variant="secondary" onClick={reset}>Upload Another Resume</Button>
        </div>
      )}

      {/* Valid + Analysis */}
      {status === 'valid' && showAnalysis && (
        <>
          {/* File info */}
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-emerald-800 truncate">{file?.name}</p>
              <p className="text-sm text-emerald-600">{resumeService.formatFileSize(file?.size || 0)} · Resume verified</p>
            </div>
            <button onClick={reset} className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-700 transition-colors" aria-label="Remove resume">
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Scores */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white border border-surface-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-primary-600" aria-hidden="true" />
                <h2 className="font-semibold text-surface-900">ATS Score</h2>
              </div>
              <div className="text-4xl font-extrabold text-primary-600 mb-3">{mockResumeImprovement.atsScore}<span className="text-lg text-surface-400 font-normal">/100</span></div>
              <ProgressBar value={mockResumeImprovement.atsScore} showValue={false} size="md" />
              <p className="text-xs text-surface-500 mt-2">ATS = Applicant Tracking System compatibility</p>
            </div>
            <div className="bg-white border border-surface-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                <h2 className="font-semibold text-surface-900">Resume Quality</h2>
              </div>
              <div className="text-4xl font-extrabold text-emerald-600 mb-3">{mockResumeImprovement.qualityScore}<span className="text-lg text-surface-400 font-normal">/100</span></div>
              <ProgressBar value={mockResumeImprovement.qualityScore} showValue={false} size="md" color="success" />
              <p className="text-xs text-surface-500 mt-2">Based on content, structure, and clarity</p>
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-white border border-surface-200 rounded-xl p-5 sm:p-6">
            <h2 className="font-semibold text-surface-900 mb-4">Improvement Suggestions</h2>
            <div className="space-y-3">
              {mockResumeImprovement.suggestions.map((s, i) => (
                <div key={i} className={clsx('rounded-xl border p-4', priorityColor[s.priority])}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={clsx('text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border', priorityColor[s.priority])}>
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
              *Resume scores and suggestions are mock data for frontend demonstration only.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
