import { useInterview } from '../../../context/InterviewContext';
import Button from '../../common/Button';
import { clsx } from 'clsx';
import { interviewService } from '../../../services/interviewService';

const questionOptions = [5, 10, 15, 20];
const durationOptions = [10, 15, 20, 30];

export default function StepSettings() {
  const { config, setNumberOfQuestions, setDuration, setCurrentStep } = useInterview();

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">Interview Settings</h2>
      <p className="text-surface-500 text-sm mb-6">Customise the length and duration of your session.</p>

      {/* Number of questions */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-surface-700 mb-3">Number of Questions</label>
        <div className="grid grid-cols-4 gap-3">
          {questionOptions.map(n => (
            <button
              key={n}
              onClick={() => setNumberOfQuestions(n)}
              aria-pressed={config.numberOfQuestions === n}
              className={clsx(
                'py-3 rounded-xl border-2 font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                config.numberOfQuestions === n
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-surface-200 bg-white text-surface-700 hover:border-surface-300'
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-surface-700 mb-3">Session Duration</label>
        <div className="grid grid-cols-4 gap-3">
          {durationOptions.map(d => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              aria-pressed={config.duration === d}
              className={clsx(
                'py-3 rounded-xl border-2 font-semibold text-xs sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                config.duration === d
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-surface-200 bg-white text-surface-700 hover:border-surface-300'
              )}
            >
              {d} min
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-surface-800 text-sm mb-3">Interview Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Experience', value: interviewService.formatExperienceLevel(config.experienceLevel || '') },
            { label: 'Role', value: config.role || '—' },
            { label: 'Difficulty', value: interviewService.formatDifficulty(config.difficulty || '') },
            { label: 'Type', value: interviewService.formatInterviewType(config.interviewType || '') },
            { label: 'Questions', value: `${config.numberOfQuestions} questions` },
            { label: 'Duration', value: `${config.duration} minutes` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-lg border border-surface-100 p-2.5">
              <p className="text-xs text-surface-400 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-surface-800 truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => setCurrentStep('type')}>Back</Button>
        <Button onClick={() => setCurrentStep('ready')}>Continue</Button>
      </div>
    </div>
  );
}
