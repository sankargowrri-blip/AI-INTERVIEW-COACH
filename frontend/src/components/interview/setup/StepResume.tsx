import { useCallback, useState } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useInterview } from '../../../context/InterviewContext';
import { resumeService } from '../../../services/resumeService';
import Button from '../../common/Button';
import { clsx } from 'clsx';

export default function StepResume() {
  const { config, setResume, setCurrentStep } = useInterview();
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'valid' | 'invalid' | 'error'>(
    config.resume?.status === 'valid' ? 'valid' : 'idle'
  );
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');

  const processFile = useCallback(async (f: File) => {
    const validation = resumeService.validateFile(f);
    if (!validation.valid) {
      setFileError(validation.error || 'Invalid file.');
      return;
    }
    setFile(f);
    setStatus('processing');
    setFileError('');
    setResume({ fileName: f.name, fileSize: f.size, status: 'processing' });

    const result = await resumeService.processResume(f);
    if (result.valid) {
      setStatus('valid');
      setResume({ fileName: f.name, fileSize: f.size, status: 'valid', extractedInfo: result.extractedInfo });
    } else {
      setStatus('invalid');
      setResume({ fileName: f.name, fileSize: f.size, status: 'invalid' });
    }
  }, [setResume]);

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
    setStatus('idle');
    setResume(null);
    setFileError('');
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">Upload Your Resume</h2>
      <p className="text-surface-500 text-sm mb-6">
        Your resume helps personalise the questions asked. Accepted formats: PDF, DOCX.
      </p>

      {/* Upload zone */}
      {status === 'idle' && (
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={clsx(
            'border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer',
            isDragging
              ? 'border-primary-400 bg-primary-50'
              : 'border-surface-300 hover:border-primary-400 hover:bg-primary-50/30'
          )}
        >
          <Upload className="w-10 h-10 text-surface-300 mx-auto mb-3" aria-hidden="true" />
          <p className="font-medium text-surface-700 mb-1">Drag & drop your resume here</p>
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

      {/* Processing */}
      {status === 'processing' && (
        <div className="border border-surface-200 rounded-xl p-8 text-center bg-white">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-3" aria-hidden="true" />
          <p className="font-medium text-surface-700">Analysing resume...</p>
          <p className="text-sm text-surface-500 mt-1">This will take just a moment.</p>
        </div>
      )}

      {/* Valid */}
      {status === 'valid' && config.resume?.extractedInfo && (
        <div className="border border-emerald-200 rounded-xl bg-emerald-50 p-5">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold text-emerald-800">Resume Verified</p>
              <p className="text-sm text-emerald-600">{file?.name} · {resumeService.formatFileSize(file?.size || 0)}</p>
            </div>
            <button
              onClick={handleRemove}
              className="ml-auto p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors"
              aria-label="Remove resume"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Extracted info */}
          <div className="bg-white rounded-lg border border-emerald-100 p-4 space-y-3">
            <h3 className="font-semibold text-surface-900 text-sm">Extracted Information</h3>
            {[
              { label: 'Name', items: [config.resume.extractedInfo.name] },
              { label: 'Education', items: config.resume.extractedInfo.education },
              { label: 'Skills', items: config.resume.extractedInfo.skills },
              { label: 'Projects', items: config.resume.extractedInfo.projects },
              { label: 'Internships', items: config.resume.extractedInfo.internships },
              { label: 'Certifications', items: config.resume.extractedInfo.certifications },
            ].filter(s => s.items.length > 0 && s.items[0]).map(({ label, items }) => (
              <div key={label}>
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">{label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map(item => (
                    <span key={item} className="text-xs bg-surface-100 text-surface-700 px-2 py-0.5 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-emerald-600 mt-3 italic">
            * This is mock-extracted data for frontend demonstration. Real extraction will be done by the backend.
          </p>
        </div>
      )}

      {/* Invalid */}
      {status === 'invalid' && (
        <div className="border border-red-200 rounded-xl bg-red-50 p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" aria-hidden="true" />
          <h3 className="font-semibold text-red-800 mb-2">Invalid Resume</h3>
          <p className="text-sm text-red-700 max-w-sm mx-auto mb-4">
            The uploaded document does not appear to be a valid resume. Please upload a valid resume
            containing information such as education, skills, projects, experience, or certifications.
          </p>
          <Button variant="secondary" onClick={handleRemove}>Upload Another Resume</Button>
        </div>
      )}

      {/* Navigation */}
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
