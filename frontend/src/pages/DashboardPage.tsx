import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Play, TrendingUp, Award, BarChart2, Clock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockProgressData, mockProgressStats, mockStrongAreas, mockWeakAreas } from '../data/mockProgress';
import { mockInterviewHistory } from '../data/mockInterviews';
import { interviewService } from '../services/interviewService';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub?: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-surface-200 p-4 sm:p-5">
      <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="text-2xl font-bold text-surface-900">{value}</div>
      <div className="text-sm text-surface-600 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-surface-400 mt-0.5">{sub}</div>}
    </div>
  );
}

const difficultyBadge = (d: string) => {
  if (d === 'easy') return 'success';
  if (d === 'medium') return 'warning';
  return 'danger';
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const recent = mockInterviewHistory.slice(-3).reverse();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-surface-500 mt-1">Ready for your next interview?</p>
        </div>
        <Button
          onClick={() => navigate('/interview/setup')}
          size="lg"
          leftIcon={<Play className="w-4 h-4" />}
        >
          Start New Interview
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" role="region" aria-label="Your statistics">
        <StatCard
          label="Latest Score"
          value={`${mockProgressStats.currentScore}/100`}
          icon={BarChart2}
          color="bg-primary-50 text-primary-600"
        />
        <StatCard
          label="Best Score"
          value={`${mockProgressStats.bestScore}/100`}
          icon={Award}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Average Score"
          value={`${mockProgressStats.averageScore}/100`}
          icon={TrendingUp}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Interviews"
          value={String(mockProgressStats.totalInterviews)}
          sub={`+${mockProgressStats.improvementPercentage}% improvement`}
          icon={Clock}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-surface-200 p-5 sm:p-6">
          <h2 className="font-semibold text-surface-900 mb-5">Performance Over Time</h2>
          <div className="h-56" role="img" aria-label="Line chart showing interview scores over time">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockProgressData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="interview"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[50, 100]}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  formatter={(v) => [`${v}/100`, 'Score']}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ fill: '#2563eb', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Areas */}
        <div className="space-y-4">
          {/* Strong */}
          <div className="bg-white rounded-xl border border-surface-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" />
              <h2 className="font-semibold text-surface-900 text-sm">Strong Areas</h2>
            </div>
            <ul className="space-y-2.5" aria-label="Strong areas">
              {mockStrongAreas.map(({ label, score }) => (
                <li key={label} className="flex items-center justify-between">
                  <span className="text-sm text-surface-700">{label}</span>
                  <span className="text-sm font-semibold text-emerald-600">{score}%</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weak */}
          <div className="bg-white rounded-xl border border-surface-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-amber-500" aria-hidden="true" />
              <h2 className="font-semibold text-surface-900 text-sm">Areas to Improve</h2>
            </div>
            <ul className="space-y-2.5" aria-label="Areas to improve">
              {mockWeakAreas.map(({ label, score }) => (
                <li key={label} className="flex items-center justify-between">
                  <span className="text-sm text-surface-700">{label}</span>
                  <span className="text-sm font-semibold text-amber-600">{score}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="mt-6 bg-white rounded-xl border border-surface-200 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-surface-900">Recent Interviews</h2>
          <button
            onClick={() => navigate('/interview/history')}
            className="text-sm text-primary-600 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-8 text-surface-400 text-sm">
            No interviews yet. Start your first mock interview to track progress.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm min-w-[540px]" role="table">
              <thead>
                <tr className="border-b border-surface-100">
                  {['Role', 'Experience', 'Difficulty', 'Date', 'Score', 'Result'].map(h => (
                    <th key={h} className="text-left pb-2 pr-4 font-medium text-surface-500 text-xs" scope="col">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map(item => (
                  <tr
                    key={item.id}
                    className="border-b border-surface-50 hover:bg-surface-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/interview/history/${item.id}`)}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && navigate(`/interview/history/${item.id}`)}
                    role="row"
                    aria-label={`${item.role} interview, score ${item.score}`}
                  >
                    <td className="py-3 pr-4 font-medium text-surface-900">{item.role}</td>
                    <td className="py-3 pr-4 text-surface-600 capitalize">{item.experienceLevel}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={difficultyBadge(item.difficulty)}>
                        {interviewService.formatDifficulty(item.difficulty)}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-surface-500">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-surface-900">{item.score}/100</td>
                    <td className="py-3">
                      <span className={`badge border ${interviewService.getClassificationColor(item.classification)}`}>
                        {item.classification}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
