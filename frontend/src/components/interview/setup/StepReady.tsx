import { useNavigate } from 'react-router-dom';
import { Camera, Mic, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { useInterview } from '../../../context/InterviewContext';
import { interviewService } from '../../../services/interviewService';
import Button from '../../common/Button';

export default function StepReady() {
  const { config, setCurrentStep } = useInterview();
  const navigate = useNavigate();

  const summary = [
    { label: 'Experience Level', value: interviewService.formatExperienceLevel(config.experienceLevel || '') },
    { label: 'Resume', value: config.resume?.fileName || 'Uploaded' },
    { label: 'Role', value: config.role },
    { label: 'Difficulty', value: interviewService.formatDifficulty(config.difficulty || '') },
    { label: 'Interview Type', value: interviewService.formatInterviewType(config.interviewType || '') },
    { label: 'Questions', value: `${config.numberOfQuestions} questions` },
    { label: 'Duration', value: `${config.duration} minutes` },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">Ready to Start</h2>
      <p className="text-surface-500 text-sm mb-6">Review your settings before beginning the interview.</p>

      {/* Summary */}
      <div className="bg-white border border-surface-200 rounded-xl divide-y divide-surface-100 mb-6">
        {summary.map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center px-4 py-3">
            <span className="text-sm text-surface-500">{label}</span>
            <span className="text-sm font-semibold text-surface-800 text-right max-w-[60%] truncate">{value}</span>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-amber-800 mb-3">Before You Begin</h3>
        <ul className="space-y-2.5">
          {[
            { icon: Camera, text: 'Your camera will be required throughout the interview.' },
            { icon: Mic, text: 'Your microphone must be active. You answer using your voice only.' },
            { icon: MessageSquare, text: 'Questions will also be displayed as text on screen.' },
            { icon: AlertCircle, text: 'Typing answers is not available. Voice responses only.' },
            { icon: CheckCircle, text: 'Detailed feedback and scores will appear after the interview.' },
          ].map(({ icon: Icon, text }, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-amber-800">
              <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="secondary" onClick={() => setCurrentStep('settings')} className="sm:flex-none">
          Back
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/interview/setup/camera-check')}
          leftIcon={<Camera className="w-4 h-4" />}
          className="sm:flex-1"
        >
          Check Camera & Microphone
        </Button>
        <Button
          onClick={() => navigate('/interview/live')}
          leftIcon={<Mic className="w-4 h-4" />}
          className="sm:flex-1"
        >
          Start Interview
        </Button>
      </div>
    </div>
  );
}
