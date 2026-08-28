import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Award, BarChart2, Target } from 'lucide-react';
import { progressService } from '../services/progressService';
import type { ProgressDataPoint, ProgressStats } from '../types';
import LoadingState from '../components/common/LoadingState';
import ProgressBar from '../components/common/ProgressBar';
import ScoreCard from '../components/common/ScoreCard';
import { clsx } from 'clsx';

export default function ProgressPage() {
  const [data, setData] = useState<ProgressDataPoint[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressService.getProgress().then(result => {
      setData(result.data);
      setStats(result.stats);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState message="Loading progress..." />;
  if (!stats) return null;

  const readinessColor = stats.readinessScore >= 80 ? 'text-emerald-600' : stats.readinessScore >= 60 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Progress Dashboard</h1>
        <p className="text-surface-500 text-sm mt-1">Track your improvement across sessions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Progress statistics">
        <ScoreCard label="Current Score" value={`${stats.currentScore}/100`} icon={<BarChart2 className="w-5 h-5" />} color="blue" />
        <ScoreCard label="Best Score" value={`${stats.bestScore}/100`} icon={<Award className="w-5 h-5" />} color="green" />
        <ScoreCard label="Average Score" value={`${stats.averageScore}/100`} icon={<Target className="w-5 h-5" />} color="amber" />
        <ScoreCard label="Improvement" value={`+${stats.improvementPercentage}%`} sub={`${stats.totalInterviews} sessions`} icon={<TrendingUp className="w-5 h-5" />} color="purple" />
      </div>

      {/* Readiness Score */}
      <div className="bg-white rounded-xl border border-surface-200 p-5 sm:p-6">
        <h2 className="font-semibold text-surface-900 mb-4">Interview Readiness</h2>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex flex-col items-center">
            <div className={clsx('text-5xl font-extrabold', readinessColor)}>{stats.readinessScore}%</div>
            <div className="text-sm font-semibold text-surface-700 mt-1">{stats.readinessLabel}</div>
          </div>
          <div className="flex-1 w-full">
            <ProgressBar value={stats.readinessScore} showValue={false} size="lg" />
            <p className="text-sm text-surface-500 mt-3">
              Your recent practice performance shows that you are making consistent progress.
              Keep practising daily to continue improving.
            </p>
            <p className="text-xs text-surface-400 mt-2 italic">
              Readiness score is based on your practice session results and does not predict actual hiring outcomes.
            </p>
          </div>
        </div>
      </div>

      {/* Overall Score Chart */}
      <div className="bg-white rounded-xl border border-surface-200 p-5 sm:p-6">
        <h2 className="font-semibold text-surface-900 mb-4">Overall Score Over Time</h2>
        <div className="h-56 sm:h-64" role="img" aria-label="Line chart showing overall scores over time">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="interview" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(v) => [`${v}/100`]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
              />
              <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2.5} dot={{ fill: '#2563eb', r: 4 }} activeDot={{ r: 6 }} name="Overall" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Metrics Chart */}
      <div className="bg-white rounded-xl border border-surface-200 p-5 sm:p-6">
        <h2 className="font-semibold text-surface-900 mb-4">Metrics Over Time</h2>
        <div className="h-64 sm:h-72" role="img" aria-label="Line chart showing detailed metrics over time">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="interview" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }} formatter={(v) => [`${v}%`]} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="answerQuality" stroke="#2563eb" strokeWidth={2} dot={false} name="Answer Quality" />
              <Line type="monotone" dataKey="communication" stroke="#10b981" strokeWidth={2} dot={false} name="Communication" />
              <Line type="monotone" dataKey="performance" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Performance" />
              <Line type="monotone" dataKey="roleKnowledge" stroke="#f59e0b" strokeWidth={2} dot={false} name="Role Knowledge" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Score comparison */}
      <div className="bg-white rounded-xl border border-surface-200 p-5 sm:p-6">
        <h2 className="font-semibold text-surface-900 mb-5">Latest vs Previous Session</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { label: 'Answer Quality', current: 88, previous: 82 },
            { label: 'Communication', current: 82, previous: 78 },
            { label: 'Performance', current: 85, previous: 80 },
            { label: 'Role Knowledge', current: 90, previous: 84 },
          ].map(({ label, current, previous }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-surface-700">{label}</span>
                <span className={clsx('text-xs font-medium', current >= previous ? 'text-emerald-600' : 'text-red-600')}>
                  {current >= previous ? '+' : ''}{current - previous}%
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-surface-400 w-14">Current</span>
                  <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${current}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-surface-700 w-8 text-right">{current}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-surface-400 w-14">Previous</span>
                  <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div className="h-full bg-surface-300 rounded-full" style={{ width: `${previous}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-surface-400 w-8 text-right">{previous}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
