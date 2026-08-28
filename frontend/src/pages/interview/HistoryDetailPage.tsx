import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService } from '../../services/interviewService';
import { mockInterviewHistory } from '../../data/mockInterviews';
import type { InterviewResult, InterviewHistoryItem } from '../../types';
import LoadingState from '../../components/common/LoadingState';
import ProgressBar from '../../components/common/ProgressBar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { clsx } from 'clsx';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [historyItem, setHistoryItem] = useState<InterviewHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const item = mockInterviewHistory.find(h => h.id === id);
    setHistoryItem(item || null);
    interviewService.getHistoryItemResult(id || '').then((r: InterviewResult) => {
      setResult(r);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <LoadingState message="Loading results..." />;
  if (!result || !historyItem) return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-center">
      <p className="text-surface-500">Interview record not found.</p>
      <Button className="mt-4" onClick={() => navigate('/interview/history')}>Back to History</Button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <button onClick={() => navigate('/interview/history')} className="text-sm text-surface-500 hover:text-surface-700 mb-4 flex items-center gap-1">
          ← Back to History
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-surface-900">{historyItem.role}</h1>
          <Badge variant={historyItem.experienceLevel === 'fresher' ? 'primary' : 'info'}>
            {interviewService.formatExperienceLevel(historyItem.experienceLevel)}
          </Badge>
          <Badge variant="default">{interviewService.formatDifficulty(historyItem.difficulty)}</Badge>
        </div>
        <p className="text-surface-500 text-sm mt-1">
          {new Date(historyItem.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          {' · '}{interviewService.formatInterviewType(historyItem.interviewType)}
        </p>
      </div>

      {/* Score */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 text-center">
        <div className="text-6xl font-extrabold text-primary-600">{result.totalScore}</div>
        <div className="text-surface-400 text-sm">/100</div>
        <div className={clsx('mt-2 inline-block px-4 py-1.5 rounded-full border-2 font-bold text-sm', interviewService.getClassificationColor(result.classification))}>
          {result.classification}
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(result.scoreBreakdown).map(([key, val]) => (
            <div key={key} className="bg-surface-50 rounded-lg p-3">
              <div className={clsx('text-xl font-bold', interviewService.getScoreColor(val))}>{val}%</div>
              <div className="text-xs text-surface-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="bg-white rounded-xl border border-surface-200 p-5 sm:p-6">
        <h2 className="font-semibold text-surface-900 mb-4">Score Breakdown</h2>
        <div className="space-y-4">
          <ProgressBar label="Answer Quality" value={result.scoreBreakdown.answerQuality} />
          <ProgressBar label="Communication" value={result.scoreBreakdown.communication} />
          <ProgressBar label="Performance" value={result.scoreBreakdown.performance} />
          <ProgressBar label="Role Knowledge" value={result.scoreBreakdown.roleKnowledge} />
        </div>
      </div>

      {/* Strengths / Improvements */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            <h2 className="font-semibold text-surface-900 text-sm">What You Did Well</h2>
          </div>
          <ul className="space-y-2">
            {result.strengths.slice(0, 3).map((s, i) => (
              <li key={i} className="text-sm text-surface-700 flex gap-2">
                <span className="text-emerald-400" aria-hidden="true">✓</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-500" aria-hidden="true" />
            <h2 className="font-semibold text-surface-900 text-sm">What Could Be Better</h2>
          </div>
          <ul className="space-y-2">
            {result.improvements.slice(0, 3).map((s, i) => (
              <li key={i} className="text-sm text-surface-700 flex gap-2">
                <span className="text-amber-400" aria-hidden="true">→</span> {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate('/interview/history')}>Back</Button>
        <Button onClick={() => navigate('/interview/setup')}>Practice Again</Button>
      </div>
    </div>
  );
}
