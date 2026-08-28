import { useInterview } from '../../../context/InterviewContext';
import Button from '../../common/Button';
import { clsx } from 'clsx';

const levels = [
  {
    value: 'easy' as const,
    label: 'EASY',
    desc: 'Basic and straightforward questions.',
    detail: 'Great for initial practice, warm-up sessions, or building confidence.',
    color: 'emerald',
    emoji: '🟢',
  },
  {
    value: 'medium' as const,
    label: 'MEDIUM',
    desc: 'Moderate questions and practical scenarios.',
    detail: 'The right balance for regular practice and targeted improvement.',
    color: 'amber',
    emoji: '🟡',
  },
  {
    value: 'hard' as const,
    label: 'HARD',
    desc: 'Challenging questions requiring deeper reasoning.',
    detail: 'For candidates who want to push themselves to a higher level.',
    color: 'red',
    emoji: '🔴',
  },
];

const colorMap: Record<string, string> = {
  emerald: 'border-emerald-500 bg-emerald-50',
  amber: 'border-amber-500 bg-amber-50',
  red: 'border-red-500 bg-red-50',
};

export default function StepDifficulty() {
  const { config, setDifficulty, setCurrentStep } = useInterview();

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">Choose Difficulty Level</h2>
      <p className="text-surface-500 text-sm mb-2">
        Difficulty controls how complex and challenging the questions are.
      </p>
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 mb-6 text-sm text-blue-700">
        Your experience level (<strong>{config.experienceLevel === 'fresher' ? 'Fresher' : 'Experienced'}</strong>) determines what the questions are about.
        Difficulty determines how challenging they are. These are independent settings.
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {levels.map(({ value, label, desc, detail, color, emoji }) => (
          <button
            key={value}
            onClick={() => setDifficulty(value)}
            aria-pressed={config.difficulty === value}
            className={clsx(
              'text-left p-5 rounded-xl border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              config.difficulty === value
                ? colorMap[color]
                : 'border-surface-200 bg-white hover:border-surface-300 hover:shadow-card'
            )}
          >
            <div className="text-2xl mb-3" role="img" aria-hidden="true">{emoji}</div>
            <div className="font-bold text-surface-900 mb-1">{label}</div>
            <p className="text-sm text-surface-600 mb-2">{desc}</p>
            <p className="text-xs text-surface-500">{detail}</p>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => setCurrentStep('role')}>Back</Button>
        <Button onClick={() => setCurrentStep('type')} disabled={!config.difficulty}>Continue</Button>
      </div>
    </div>
  );
}
