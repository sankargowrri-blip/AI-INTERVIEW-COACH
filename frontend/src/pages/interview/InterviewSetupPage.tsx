import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../../context/InterviewContext';
import StepExperience from '../../components/interview/setup/StepExperience';
import StepResume from '../../components/interview/setup/StepResume';
import StepRole from '../../components/interview/setup/StepRole';
import StepDifficulty from '../../components/interview/setup/StepDifficulty';
import StepInterviewType from '../../components/interview/setup/StepInterviewType';
import StepSettings from '../../components/interview/setup/StepSettings';
import StepReady from '../../components/interview/setup/StepReady';
import SetupProgress from '../../components/interview/setup/SetupProgress';

const STEPS = [
  { key: 'experience', label: 'Experience' },
  { key: 'resume', label: 'Resume' },
  { key: 'role', label: 'Role' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'type', label: 'Type' },
  { key: 'settings', label: 'Settings' },
  { key: 'ready', label: 'Ready' },
] as const;

export default function InterviewSetupPage() {
  const { currentStep, resetSetup } = useInterview();
  const navigate = useNavigate();

  // Reset setup when entering fresh
  useEffect(() => {
    resetSetup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stepIndex = STEPS.findIndex(s => s.key === currentStep);

  const renderStep = () => {
    switch (currentStep) {
      case 'experience': return <StepExperience />;
      case 'resume': return <StepResume />;
      case 'role': return <StepRole />;
      case 'difficulty': return <StepDifficulty />;
      case 'type': return <StepInterviewType />;
      case 'settings': return <StepSettings />;
      case 'ready': return <StepReady />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-surface-500 hover:text-surface-700 mb-4 flex items-center gap-1 transition-colors"
          aria-label="Back to dashboard"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-surface-900">Set Up Your Interview</h1>
        <p className="text-surface-500 text-sm mt-1">Complete each step to configure your personalised mock interview.</p>
      </div>

      {/* Progress */}
      <SetupProgress steps={STEPS} currentIndex={stepIndex} />

      {/* Step content */}
      <div className="mt-8 page-enter" key={currentStep}>
        {renderStep()}
      </div>
    </div>
  );
}
