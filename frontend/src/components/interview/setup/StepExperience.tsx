import { useInterview } from '../../../context/InterviewContext';
import Button from '../../common/Button';
import { clsx } from 'clsx';

const options = [
  {
    value: 'fresher' as const,
    title: 'FRESHER',
    subtitle: 'Student or little / no professional experience',
    emoji: '🎓',
    bullets: ['Fundamentals & education', 'Academic projects', 'Internships', 'HR questions', 'Career goals'],
  },
  {
    value: 'experienced' as const,
    title: 'EXPERIENCED',
    subtitle: 'Have professional work experience',
    emoji: '💼',
    bullets: ['Professional experience', 'Previous roles', 'Responsibilities', 'Achievements', 'Workplace scenarios'],
  },
];

export default function StepExperience() {
  const { config, setExperienceLevel, setCurrentStep } = useInterview();

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">What describes your experience level?</h2>
      <p className="text-surface-500 text-sm mb-6">
        This determines the type of questions asked. Difficulty is set separately in a later step.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {options.map(({ value, title, subtitle, emoji, bullets }) => (
          <button
            key={value}
            onClick={() => setExperienceLevel(value)}
            aria-pressed={config.experienceLevel === value}
            className={clsx(
              'text-left p-5 rounded-xl border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              config.experienceLevel === value
                ? 'border-primary-600 bg-primary-50 shadow-card'
                : 'border-surface-200 bg-white hover:border-surface-300 hover:shadow-card'
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl" role="img" aria-hidden="true">{emoji}</span>
              <div>
                <div className="font-bold text-surface-900">{title}</div>
                {config.experienceLevel === value && (
                  <div className="w-2 h-2 rounded-full bg-primary-600 mt-0.5" aria-hidden="true" />
                )}
              </div>
            </div>
            <p className="text-sm text-surface-500 mb-3">{subtitle}</p>
            <ul className="space-y-1">
              {bullets.map(b => (
                <li key={b} className="flex items-center gap-2 text-xs text-surface-600">
                  <span className="w-1 h-1 rounded-full bg-surface-400" aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-800">
        <strong>Note:</strong> Experience level and difficulty are separate settings. A Fresher can choose Hard difficulty — this makes questions more complex while keeping them fresher-appropriate.
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => setCurrentStep('resume')}
          disabled={!config.experienceLevel}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
