import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { Award, TrendingUp, MessageSquare, CheckCircle, AlertCircle, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { interviewService } from '../../services/interviewService';
import { mockResult } from '../../data/mockResults';
import type { InterviewResult } from '../../types';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingState from '../../components/common/LoadingState';
import Button from '../../components/common/Button';
import { clsx } from 'clsx';

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string; 'aria-hidden'?: 'true' }>, title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-primary-600" aria-hidden="true" />
      <h2 className="font-bold text-surface-900 text-lg">{title}</h2>
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 sm:px-6 py-4 text-left hover:bg-surface-50 transition-colors"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="font-semibold text-surface-900">{title}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-surface-400" aria-hidden="true" />
          : <ChevronDown className="w-4 h-4 text-surface-400" aria-hidden="true" />
        }
      </button>
      {open && (
        <div className="px-5 sm:px-6 pb-5">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ResultPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewService.getResult('latest').then(r => {
      setResult(r);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState message="Loading your results..." fullPage />;
  if (!result) return null;

  const { scoreBreakdown, communicationAnalysis, performanceAnalysis } = result;

  const radarData = [
    { subject: 'Answer Quality', value: scoreBreakdown.answerQuality },
    { subject: 'Communication', value: scoreBreakdown.communication },
    { subject: 'Performance', value: scoreBreakdown.performance },
    { subject: 'Role Knowledge', value: scoreBreakdown.roleKnowledge },
  ];

  const commData = [
    { name: 'Clarity', value: communicationAnalysis.clarity },
    { name: 'Fluency', value: communicationAnalysis.fluency },
    { name: 'Grammar', value: communicationAnalysis.grammar },
    { name: 'Vocabulary', value: communicationAnalysis.vocabulary },
    { name: 'Speaking Pace', value: communicationAnalysis.speakingPace },
    { name: 'Filler Words', value: communicationAnalysis.fillerWords },
  ];

  const classColor = interviewService.getClassificationColor(result.classification);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* ── Hero Score ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 sm:p-8 text-center">
        <p className="text-sm text-surface-500 mb-3">Interview Complete — Here's Your Result</p>
        <div className="inline-flex flex-col items-center">
          <div className="text-7xl sm:text-8xl font-extrabold text-primary-600">{result.totalScore}</div>
          <div className="text-surface-400 text-base font-medium">/ 100</div>
          <div className={clsx(
            'mt-3 px-5 py-2 rounded-full border-2 text-base font-extrabold tracking-wide',
            classColor
          )}>
            {result.classification}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-sm text-surface-500">Interview Readiness:</span>
            <span className={clsx(
              'px-3 py-1 rounded-lg text-sm font-bold',
              result.readinessPrediction === 'High' ? 'bg-emerald-100 text-emerald-700' :
              result.readinessPrediction === 'Medium' ? 'bg-blue-100 text-blue-700' :
              'bg-amber-100 text-amber-700'
            )}>
              {result.readinessPrediction}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Answer Quality', value: scoreBreakdown.answerQuality },
            { label: 'Communication', value: scoreBreakdown.communication },
            { label: 'Performance', value: scoreBreakdown.performance },
            { label: 'Role Knowledge', value: scoreBreakdown.roleKnowledge },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-50 rounded-xl p-3">
              <div className={clsx('text-2xl font-bold', interviewService.getScoreColor(value))}>{value}%</div>
              <div className="text-xs text-surface-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <p className="text-xs text-surface-400 mt-4 italic">
          *Results are AI-generated practice feedback for preparation purposes only.
        </p>
      </div>

      {/* ── Radar Chart ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-surface-200 p-5 sm:p-6">
        <SectionHeader icon={Award} title="Score Overview" />
        <div className="h-56 sm:h-64" role="img" aria-label="Radar chart showing score breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Score Breakdown bars ────────────────────────────────────────────────── */}
      <CollapsibleSection title="Score Breakdown">
        <div className="space-y-4">
          {[
            { label: 'Answer Quality', value: scoreBreakdown.answerQuality },
            { label: 'Communication', value: scoreBreakdown.communication },
            { label: 'Performance', value: scoreBreakdown.performance },
            { label: 'Role Knowledge', value: scoreBreakdown.roleKnowledge },
          ].map(({ label, value }) => (
            <ProgressBar key={label} label={label} value={value} size="md" />
          ))}
        </div>
      </CollapsibleSection>

      {/* ── What You Did Well / What Could Be Better ───────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-500" aria-hidden="true" />
            <h2 className="font-semibold text-surface-900">What You Did Well</h2>
          </div>
          <ul className="space-y-2.5">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-surface-700">
                <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500" aria-hidden="true" />
            <h2 className="font-semibold text-surface-900">What Could Be Better</h2>
          </div>
          <ul className="space-y-2.5">
            {result.improvements.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-surface-700">
                <span className="text-amber-400 mt-0.5 shrink-0">→</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Communication Analysis ─────────────────────────────────────────────── */}
      <CollapsibleSection title="Communication Analysis">
        <div className="h-48 mb-4" role="img" aria-label="Bar chart showing communication scores">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={commData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(v) => [`${v}%`, '']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
              />
              <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {commData.map(({ name, value }) => (
            <div key={name} className="bg-surface-50 rounded-lg p-3">
              <div className={clsx('text-xl font-bold', interviewService.getScoreColor(value))}>{value}%</div>
              <div className="text-xs text-surface-500">{name}</div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* ── Performance Analysis ───────────────────────────────────────────────── */}
      <CollapsibleSection title="Performance Analysis">
        <div className="space-y-4">
          {[
            { label: 'Professionalism', value: performanceAnalysis.professionalism },
            { label: 'Answer Structure', value: performanceAnalysis.answerStructure },
            { label: 'Relevance', value: performanceAnalysis.relevance },
            { label: 'Engagement', value: performanceAnalysis.engagement },
            { label: 'Confidence Indicators', value: performanceAnalysis.confidence },
          ].map(({ label, value }) => (
            <ProgressBar key={label} label={label} value={value} size="md" />
          ))}
        </div>
        <p className="text-xs text-surface-400 mt-4 italic">
          Confidence indicators are based on answer delivery patterns only and do not represent psychological assessment.
        </p>
      </CollapsibleSection>

      {/* ── Improvement Areas ──────────────────────────────────────────────────── */}
      <CollapsibleSection title="Areas You Should Improve">
        <div className="space-y-4">
          {result.improvementAreas.map(area => (
            <div key={area.topic} className="border border-surface-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
                <h3 className="font-semibold text-surface-900 text-sm">{area.topic}</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-red-50 rounded p-2.5">
                  <p className="font-semibold text-red-700 mb-1">Problem</p>
                  <p className="text-red-600">{area.problem}</p>
                </div>
                <div className="bg-amber-50 rounded p-2.5">
                  <p className="font-semibold text-amber-700 mb-1">Why it matters</p>
                  <p className="text-amber-600">{area.whyItMatters}</p>
                </div>
                <div className="bg-emerald-50 rounded p-2.5">
                  <p className="font-semibold text-emerald-700 mb-1">How to improve</p>
                  <p className="text-emerald-600">{area.howToImprove}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* ── Key Points ─────────────────────────────────────────────────────────── */}
      <CollapsibleSection title="Key Points to Improve">
        <ol className="space-y-2.5" role="list">
          {result.keyPoints.map((point, i) => (
            <li key={i} className="flex gap-3 text-sm text-surface-700">
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              {point}
            </li>
          ))}
        </ol>
      </CollapsibleSection>

      {/* ── Practice Plan ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-surface-200 p-5 sm:p-6">
        <SectionHeader icon={Calendar} title="Your Practice Plan" />
        <div className="space-y-3">
          {result.practicePlan.map(day => (
            <div key={day.day} className="flex gap-4 p-4 bg-surface-50 rounded-lg">
              <div className="w-12 h-12 rounded-xl bg-primary-600 text-white flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-medium">Day</span>
                <span className="text-lg font-bold leading-none">{day.day}</span>
              </div>
              <div>
                <h3 className="font-semibold text-surface-900 text-sm mb-1">{day.title}</h3>
                <ul className="space-y-1">
                  {day.tasks.map((task, i) => (
                    <li key={i} className="text-xs text-surface-600 flex gap-1.5">
                      <span className="text-primary-400 mt-0.5" aria-hidden="true">·</span>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Actions ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 pb-4">
        <Button variant="secondary" onClick={() => navigate('/interview/history')} className="flex-1">
          View History
        </Button>
        <Button variant="secondary" onClick={() => navigate('/progress')} className="flex-1">
          <TrendingUp className="w-4 h-4" aria-hidden="true" /> View Progress
        </Button>
        <Button onClick={() => navigate('/interview/setup')} className="flex-1">
          <MessageSquare className="w-4 h-4" aria-hidden="true" /> Practice Again
        </Button>
      </div>

      {mockResult && (
        <p className="text-center text-xs text-surface-400 pb-4 italic">
          Interview results are AI-generated practice feedback for preparation purposes only. They do not represent professional evaluation or hiring decisions.
        </p>
      )}
    </div>
  );
}
