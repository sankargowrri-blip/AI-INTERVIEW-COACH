import { useState } from 'react';
import { useInterview } from '../../../context/InterviewContext';
import Button from '../../common/Button';
import { clsx } from 'clsx';

const types = [
  {
    value: 'general' as const,
    label: 'General Interview',
    desc: 'A broad mix of introduction, HR, behavioral, and role-based questions.',
    icon: '🎯',
  },
  {
    value: 'hr' as const,
    label: 'HR Interview',
    desc: 'Focuses on soft skills, personality, motivation, and culture fit.',
    icon: '👥',
  },
  {
    value: 'role-specific' as const,
    label: 'Role-Specific Interview',
    desc: 'Deep dive into domain knowledge and technical expertise for your role.',
    icon: '🔬',
  },
  {
    value: 'technical' as const,
    label: 'Technical / Professional',
    desc: 'Challenging questions that test problem-solving and technical depth.',
    icon: '⚙️',
  },
  {
    value: 'mixed' as const,
    label: 'Mixed Interview',
    desc: 'A balanced blend of HR, behavioral, situational, and role-specific questions.',
    icon: '🔀',
  },
  {
    value: 'company-specific' as const,
    label: 'Company-Specific Practice',
    desc: 'Practice inspired by common interview patterns from specific companies.',
    icon: '🏢',
  },
];

const companies = ['Google', 'Amazon', 'Microsoft', 'Infosys', 'TCS', 'Zoho', 'Other Company'];

export default function StepInterviewType() {
  const { config, setInterviewType, setCompanyTarget, setCurrentStep } = useInterview();
  const [selectedCompany, setSelectedCompany] = useState(config.companyTarget || '');

  const handleTypeSelect = (value: typeof types[0]['value']) => {
    setInterviewType(value);
    if (value !== 'company-specific') {
      setCompanyTarget('');
      setSelectedCompany('');
    }
  };

  const handleCompanySelect = (company: string) => {
    setSelectedCompany(company);
    setCompanyTarget(company);
  };

  const canContinue = config.interviewType &&
    (config.interviewType !== 'company-specific' || selectedCompany);

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">Select Interview Type</h2>
      <p className="text-surface-500 text-sm mb-6">
        Choose the type of interview you want to practise.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        {types.map(({ value, label, desc, icon }) => (
          <button
            key={value}
            onClick={() => handleTypeSelect(value)}
            aria-pressed={config.interviewType === value}
            className={clsx(
              'text-left p-4 rounded-xl border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 flex gap-3',
              config.interviewType === value
                ? 'border-primary-600 bg-primary-50'
                : 'border-surface-200 bg-white hover:border-surface-300 hover:shadow-card'
            )}
          >
            <span className="text-xl shrink-0 mt-0.5" role="img" aria-hidden="true">{icon}</span>
            <div>
              <div className="font-semibold text-surface-900 text-sm mb-1">{label}</div>
              <p className="text-xs text-surface-500">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Company selection */}
      {config.interviewType === 'company-specific' && (
        <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-surface-700 mb-1">Select a company:</p>
          <p className="text-xs text-surface-500 mb-3">
            Practice content is AI-generated and intended for preparation purposes. This does not reproduce actual company interviews.
          </p>
          <div className="flex flex-wrap gap-2">
            {companies.map(c => (
              <button
                key={c}
                onClick={() => handleCompanySelect(c)}
                aria-pressed={selectedCompany === c}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all',
                  selectedCompany === c
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-surface-700 border-surface-200 hover:border-surface-300'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => setCurrentStep('difficulty')}>Back</Button>
        <Button onClick={() => setCurrentStep('settings')} disabled={!canContinue}>Continue</Button>
      </div>
    </div>
  );
}
