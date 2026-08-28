import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Filter } from 'lucide-react';
import { interviewService } from '../../services/interviewService';
import type { InterviewHistoryItem } from '../../types';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { clsx } from 'clsx';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'fresher' | 'experienced'>('all');

  useEffect(() => {
    interviewService.getHistory().then(h => {
      setHistory(h);
      setLoading(false);
    });
  }, []);

  const filtered = filter === 'all' ? history : history.filter(h => h.experienceLevel === filter);

  if (loading) return <LoadingState message="Loading history..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Interview History</h1>
          <p className="text-surface-500 text-sm mt-1">{history.length} session{history.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-surface-400" aria-hidden="true" />
          <select
            className="text-sm border border-surface-200 rounded-lg px-3 py-1.5 bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filter}
            onChange={e => setFilter(e.target.value as typeof filter)}
            aria-label="Filter by experience"
          >
            <option value="all">All</option>
            <option value="fresher">Fresher</option>
            <option value="experienced">Experienced</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-8 h-8" />}
          title="No interviews yet"
          description="Complete your first mock interview to start tracking your progress."
          action={{ label: 'Start Interview', onClick: () => navigate('/interview/setup') }}
        />
      ) : (
        <div className="space-y-3">
          {[...filtered].reverse().map(item => (
            <button
              key={item.id}
              onClick={() => navigate(`/interview/history/${item.id}`)}
              className="w-full text-left bg-white rounded-xl border border-surface-200 p-4 sm:p-5 hover:shadow-card-hover hover:border-surface-300 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label={`${item.role} interview on ${new Date(item.date).toLocaleDateString()}, score ${item.score}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-surface-900">{item.role}</h3>
                    <Badge variant={item.experienceLevel === 'fresher' ? 'primary' : 'info'}>
                      {interviewService.formatExperienceLevel(item.experienceLevel)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-surface-500">
                    <span>{interviewService.formatInterviewType(item.interviewType)}</span>
                    <span>·</span>
                    <span className="capitalize">{item.difficulty}</span>
                    <span>·</span>
                    <span>{item.duration} min</span>
                    <span>·</span>
                    <span>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className={clsx('text-2xl font-bold', interviewService.getScoreColor(item.score))}>
                      {item.score}
                    </div>
                    <div className="text-xs text-surface-400">/100</div>
                  </div>
                  <span className={clsx('badge border text-xs', interviewService.getClassificationColor(item.classification))}>
                    {item.classification}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
