import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  Award, TrendingUp, MessageSquare, CheckCircle, AlertCircle,
  Calendar, ChevronDown, ChevronUp, RefreshCw, LayoutDashboard,
} from 'lucide-react';
import { useInterview } from '../../context/InterviewContext';
import { interviewService } from '../../services/interviewService';
import { buildResultFromSession } from '../../utils/buildResult';
import type { InterviewResult } from '../../types';
import ProgressBar from '../../components/common/ProgressBar';
import Button from '../../components/common/Button';
import { clsx } from 'clsx';

// ── constants ─────────────────────────────────────────────────────────────────
const RESULT_TIMEOUT_MS = 60_000;
const STORAGE_KEY       = 'aic_last_result';

// ── helpers ───────────────────────────────────────────────────────────────────

/** Safely get a number — never crashes on undefined / null / NaN */
function safeNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

/** Safely get an array — never crashes */
function safeArr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function classifyScore(score: number): string {
  if (score >= 90) return 'EXCELLENT';
  if (score >= 80) return 'MARVELOUS';
  if (score >= 70) return 'GOOD';
  if (score >= 60) return 'NOT BAD';
  if (score >= 40) return 'BAD';
  return 'WORST';
}

function classificationColor(c: string): string {
  switch (c) {
    case 'EXCELLENT': return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    case 'MARVELOUS': return 'text-blue-700 bg-blue-50 border-blue-300';
    case 'GOOD':      return 'text-teal-700 bg-teal-50 border-teal-300';
    case 'NOT BAD':   return 'text-amber-700 bg-amber-50 border-amber-300';
    case 'BAD':       return 'text-orange-700 bg-orange-50 border-orange-300';
    default:          return 'text-red-700 bg-red-50 border-red-300';
  }
}

function scoreColor(v: number): string {
  if (v >= 85) return 'text-emerald-600';
  if (v >= 70) return 'text-blue-600';
  if (v >= 55) return 'text-amber-600';
  return 'text-red-600';
}

// ── small UI pieces ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string; 'aria-hidden'?: 'true' }>; title: string }) {
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
          ? <ChevronUp  className="w-4 h-4 text-surface-400" aria-hidden="true" />
          : <ChevronDown className="w-4 h-4 text-surface-400" aria-hidden="true" />}
      </button>
      {open && <div className="px-5 sm:px-6 pb-5">{children}</div>}
    </div>
  );
}

// ── page states ───────────────────────────────────────────────────────────────
type PageState = 'loading' | 'success' | 'error' | 'no-result' | 'timeout';

// ── main component ────────────────────────────────────────────────────────────
export default function ResultPage() {
  const navigate  = useNavigate();
  const { session, result: ctxResult } = useInterview();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [result,    setResult]    = useState<InterviewResult | null>(null);
  const [errorMsg,  setErrorMsg]  = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── persist result to localStorage so page-refresh still works ──────────────
  const persistResult = useCallback((r: InterviewResult) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
    } catch { /* storage full or private mode */ }
  }, []);

  const loadPersistedResult = useCallback((): InterviewResult | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as InterviewResult;
    } catch { return null; }
  }, []);

  // ── primary load logic ────────────────────────────────────────────────────
  const loadResult = useCallback(async () => {
    console.log('[Interview Result] Loading result…');
    setPageState('loading');
    setErrorMsg('');

    // Clear any previous timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Safety timeout — never spin forever
    timeoutRef.current = setTimeout(() => {
      setPageState('timeout');
      setErrorMsg('Result generation is taking longer than expected.');
      console.warn('[Interview Result] Timed out after 60s');
    }, RESULT_TIMEOUT_MS);

    const done = (r: InterviewResult | null, state: PageState, msg = '') => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (r) {
        persistResult(r);
        setResult(r);
      }
      setErrorMsg(msg);
      setPageState(state);
      console.log(`[Interview Result] State → ${state}`, r ? `score=${r.totalScore}` : '');
    };

    // ── Priority 1: result already built in context (normal flow) ────────────
    if (ctxResult) {
      console.log('[Interview Result] Using context result');
      done(ctxResult, 'success');
      return;
    }

    // ── Priority 2: build from session answers (context has session) ─────────
    if (session && (session.answers?.length ?? 0) > 0) {
      console.log('[Interview Result] Building result from session answers');
      try {
        const built = buildResultFromSession(session, session.id ?? 'session');
        done(built, 'success');
        return;
      } catch (e) {
        console.error('[Interview Result] Build error:', e);
      }
    }

    // ── Priority 3: try backend (interviewId stored on session) ──────────────
    const interviewId = session?.id;
    if (interviewId && !interviewId.startsWith('mock-')) {
      console.log('[Interview Result] Fetching from backend, id:', interviewId);
      try {
        const r = await interviewService.getResult(interviewId);
        if (r && r.totalScore !== undefined) {
          done(r, 'success');
          return;
        }
      } catch (e: any) {
        console.warn('[Interview Result] Backend fetch failed:', e?.message);
      }
    }

    // ── Priority 4: fall back to last persisted result ────────────────────────
    const persisted = loadPersistedResult();
    if (persisted) {
      console.log('[Interview Result] Using persisted result from localStorage');
      done(persisted, 'success');
      return;
    }

    // ── Nothing available ─────────────────────────────────────────────────────
    console.log('[Interview Result] No result available');
    done(null, 'no-result');
  }, [ctxResult, session, persistResult, loadPersistedResult]);

  useEffect(() => {
    loadResult();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full border-4 border-primary-600 border-t-transparent animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold text-surface-900 mb-2">Analysing your interview performance…</h2>
          <p className="text-surface-500 text-sm">This usually takes just a few seconds.</p>
        </div>
      </div>
    );
  }

  // ── TIMEOUT ───────────────────────────────────────────────────────────────
  if (pageState === 'timeout') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-14 h-14 text-amber-400 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-bold text-surface-900 mb-2">Result taking too long</h2>
          <p className="text-surface-500 text-sm mb-6">Result generation is taking longer than expected. Please try again.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={loadResult} leftIcon={<RefreshCw className="w-4 h-4" />}>Try Again</Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard')} leftIcon={<LayoutDashboard className="w-4 h-4" />}>Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (pageState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-bold text-surface-900 mb-2">Unable to load your interview results</h2>
          <p className="text-surface-500 text-sm mb-6">{errorMsg || 'An unexpected error occurred. Please try again.'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={loadResult} leftIcon={<RefreshCw className="w-4 h-4" />}>Try Again</Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard')} leftIcon={<LayoutDashboard className="w-4 h-4" />}>Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── NO RESULT ─────────────────────────────────────────────────────────────
  if (pageState === 'no-result' || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
        <div className="text-center max-w-md">
          <Award className="w-14 h-14 text-surface-300 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-bold text-surface-900 mb-2">No interview result was found</h2>
          <p className="text-surface-500 text-sm mb-6">
            It looks like no completed interview is available. Please start a new interview.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/interview/setup')} leftIcon={<MessageSquare className="w-4 h-4" />}>
              Start New Interview
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard')} leftIcon={<LayoutDashboard className="w-4 h-4" />}>
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── SUCCESS — safe destructuring with fallbacks ────────────────────────────
  const totalScore     = safeNum(result.totalScore, 0);
  const classification = result.classification || classifyScore(totalScore);
  const readiness      = result.readinessPrediction || 'Needs Improvement';
  // @ts-ignore — extended fields
  const interviewStatus      = (result as any).interviewStatus ?? 'COMPLETED';
  // @ts-ignore
  const answeredQuestions    = safeNum((result as any).answeredQuestions,   undefined);
  // @ts-ignore
  const unansweredQuestions  = safeNum((result as any).unansweredQuestions, undefined);
  const isNotAttempted       = interviewStatus === 'NOT_ATTEMPTED';

  const sb = (result.scoreBreakdown       ?? {}) as Partial<typeof result.scoreBreakdown>;
  const answerQuality  = safeNum(sb?.answerQuality,  totalScore);
  const communication  = safeNum(sb?.communication,  totalScore);
  const performance    = safeNum(sb?.performance,    totalScore);
  const roleKnowledge  = safeNum(sb?.roleKnowledge,  totalScore);

  const ca = (result.communicationAnalysis ?? {}) as Partial<typeof result.communicationAnalysis>;
  const clarity      = safeNum(ca?.clarity,      totalScore);
  const fluency      = safeNum(ca?.fluency,      totalScore);
  const grammar      = safeNum(ca?.grammar,      totalScore);
  const vocabulary   = safeNum(ca?.vocabulary,   totalScore);
  const speakingPace = safeNum(ca?.speakingPace, totalScore);
  const fillerWords  = safeNum(ca?.fillerWords,  totalScore);

  const pa = (result.performanceAnalysis   ?? {}) as Partial<typeof result.performanceAnalysis>;
  const professionalism = safeNum(pa?.professionalism, totalScore);
  const answerStructure = safeNum(pa?.answerStructure, totalScore);
  const relevance       = safeNum(pa?.relevance,       totalScore);
  const engagement      = safeNum(pa?.engagement,      totalScore);
  const confidence      = safeNum(pa?.confidence,      totalScore);

  const strengths        = safeArr<string>(result.strengths);
  const improvements     = safeArr<string>(result.improvements);
  const improvementAreas = safeArr(result.improvementAreas);
  const keyPoints        = safeArr<string>(result.keyPoints);
  const practicePlan     = safeArr(result.practicePlan);
  // @ts-ignore — extended field added by buildResult
  const questionAnalysis = safeArr((result as any).questionAnalysis);

  const radarData = [
    { subject: 'Answer Quality', value: answerQuality },
    { subject: 'Communication',  value: communication },
    { subject: 'Performance',    value: performance   },
    { subject: 'Role Knowledge', value: roleKnowledge },
  ];

  const commData = [
    { name: 'Clarity',       value: clarity      },
    { name: 'Fluency',       value: fluency       },
    { name: 'Grammar',       value: grammar       },
    { name: 'Vocabulary',    value: vocabulary    },
    { name: 'Speaking Pace', value: speakingPace  },
    { name: 'Filler Words',  value: fillerWords   },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ── Hero Score ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 sm:p-8 text-center">
        <p className="text-sm text-surface-500 mb-3">Interview Complete — Here's Your Result</p>

        {/* NOT ATTEMPTED banner */}
        {isNotAttempted && (
          <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-left">
            <p className="text-sm font-semibold text-amber-800 mb-1">⚠ Interview Not Attempted</p>
            <p className="text-xs text-amber-700">
              No meaningful answers were provided during this interview. The score of 0/100 reflects that
              the interview was not attempted — not the candidate's actual ability.
            </p>
          </div>
        )}

        <div className="inline-flex flex-col items-center">
          <div className={clsx('text-7xl sm:text-8xl font-extrabold', scoreColor(totalScore))}>
            {totalScore}
          </div>
          <div className="text-surface-400 text-base font-medium">/ 100</div>
          <div className={clsx('mt-3 px-5 py-2 rounded-full border-2 text-base font-extrabold tracking-wide', classificationColor(classification))}>
            {classification}
          </div>

          {/* Interview status badge */}
          <div className="mt-3">
            <span className={clsx('px-3 py-1 rounded-lg text-sm font-bold',
              isNotAttempted
                ? 'bg-amber-100 text-amber-700'
                : 'bg-surface-100 text-surface-600'
            )}>
              {isNotAttempted ? 'Not Attempted' : 'Completed'}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-surface-500">Interview Readiness:</span>
            <span className={clsx('px-3 py-1 rounded-lg text-sm font-bold',
              readiness === 'High'   ? 'bg-emerald-100 text-emerald-700' :
              readiness === 'Medium' ? 'bg-blue-100 text-blue-700' :
              'bg-amber-100 text-amber-700'
            )}>
              {readiness}
            </span>
          </div>

          {/* Answered / unanswered counts */}
          {answeredQuestions !== undefined && unansweredQuestions !== undefined && (
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="text-emerald-600 font-medium">
                ✓ Answered: {answeredQuestions}
              </span>
              <span className="text-red-500 font-medium">
                ✗ Unanswered: {unansweredQuestions}
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Answer Quality', value: answerQuality },
            { label: 'Communication',  value: communication },
            { label: 'Performance',    value: performance   },
            { label: 'Role Knowledge', value: roleKnowledge },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-50 rounded-xl p-3">
              <div className={clsx('text-2xl font-bold', scoreColor(value))}>{value}%</div>
              <div className="text-xs text-surface-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <p className="text-xs text-surface-400 mt-4 italic">
          * Results are AI-generated practice feedback for preparation purposes only and do not represent a professional hiring assessment.
        </p>
      </div>

      {/* ── Radar Chart ─────────────────────────────────────────────────────── */}
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

      {/* ── Score Breakdown ──────────────────────────────────────────────────── */}
      <CollapsibleSection title="Score Breakdown">
        <div className="space-y-4">
          {[
            { label: 'Answer Quality', value: answerQuality },
            { label: 'Communication',  value: communication },
            { label: 'Performance',    value: performance   },
            { label: 'Role Knowledge', value: roleKnowledge },
          ].map(({ label, value }) => (
            <ProgressBar key={label} label={label} value={value} size="md" />
          ))}
        </div>
      </CollapsibleSection>

      {/* ── Strengths / Improvements ─────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-500" aria-hidden="true" />
            <h2 className="font-semibold text-surface-900">What You Did Well</h2>
          </div>
          {strengths.length > 0 ? (
            <ul className="space-y-2.5">
              {strengths.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-surface-700">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  {String(s)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-surface-400 italic">No specific strengths recorded.</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500" aria-hidden="true" />
            <h2 className="font-semibold text-surface-900">What Could Be Better</h2>
          </div>
          {improvements.length > 0 ? (
            <ul className="space-y-2.5">
              {improvements.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-surface-700">
                  <span className="text-amber-400 mt-0.5 shrink-0">→</span>
                  {String(s)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-surface-400 italic">No specific improvements recorded.</p>
          )}
        </div>
      </div>

      {/* ── Communication Analysis ───────────────────────────────────────────── */}
      <CollapsibleSection title="Communication Analysis">
        <div className="h-48 mb-4" role="img" aria-label="Communication scores bar chart">
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
              <div className={clsx('text-xl font-bold', scoreColor(value))}>{value}%</div>
              <div className="text-xs text-surface-500">{name}</div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* ── Performance Analysis ─────────────────────────────────────────────── */}
      <CollapsibleSection title="Performance Analysis">
        <div className="space-y-4">
          {[
            { label: 'Professionalism',    value: professionalism },
            { label: 'Answer Structure',   value: answerStructure },
            { label: 'Relevance',          value: relevance       },
            { label: 'Engagement',         value: engagement      },
            { label: 'Confidence',         value: confidence      },
          ].map(({ label, value }) => (
            <ProgressBar key={label} label={label} value={value} size="md" />
          ))}
        </div>
        <p className="text-xs text-surface-400 mt-4 italic">
          Confidence indicators are based on answer patterns only and do not represent psychological assessment.
        </p>
      </CollapsibleSection>

      {/* ── Improvement Areas ────────────────────────────────────────────────── */}
      {improvementAreas.length > 0 && (
        <CollapsibleSection title="Areas You Should Improve">
          <div className="space-y-4">
            {improvementAreas.map((area: any, idx: number) => (
              <div key={area?.topic ?? idx} className="border border-surface-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
                  <h3 className="font-semibold text-surface-900 text-sm">{area?.topic ?? `Area ${idx + 1}`}</h3>
                </div>
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-red-50 rounded p-2.5">
                    <p className="font-semibold text-red-700 mb-1">Problem</p>
                    <p className="text-red-600">{area?.problem ?? '—'}</p>
                  </div>
                  <div className="bg-amber-50 rounded p-2.5">
                    <p className="font-semibold text-amber-700 mb-1">Why it matters</p>
                    <p className="text-amber-600">{area?.whyItMatters ?? '—'}</p>
                  </div>
                  <div className="bg-emerald-50 rounded p-2.5">
                    <p className="font-semibold text-emerald-700 mb-1">How to improve</p>
                    <p className="text-emerald-600">{area?.howToImprove ?? '—'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* ── Key Points ───────────────────────────────────────────────────────── */}
      {keyPoints.length > 0 && (
        <CollapsibleSection title="Key Points to Improve">
          <ol className="space-y-2.5" role="list">
            {keyPoints.map((point, i) => (
              <li key={i} className="flex gap-3 text-sm text-surface-700">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {String(point)}
              </li>
            ))}
          </ol>
        </CollapsibleSection>
      )}

      {/* ── Question-by-question analysis ────────────────────────────────────── */}
      {questionAnalysis.length > 0 && (
        <CollapsibleSection title="Question-by-Question Analysis" defaultOpen={false}>
          <div className="space-y-4">
            {questionAnalysis.map((qa: any, i: number) => {
              const isAnswered = qa?.status !== 'not_answered' && qa?.answer !== 'No answer provided.';
              const qScore = safeNum(qa?.score, 0);
              return (
                <div key={i} className="border border-surface-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-surface-900">
                      Q{i + 1}: {String(qa?.question ?? '—')}
                    </p>
                    <span className={clsx('shrink-0 text-sm font-bold px-2 py-0.5 rounded-lg',
                      isAnswered ? scoreColor(qScore) : 'text-red-500 bg-red-50'
                    )}>
                      {isAnswered ? `${qScore}/100` : 'Not Answered'}
                    </span>
                  </div>
                  <div className={clsx('rounded-lg p-3', isAnswered ? 'bg-surface-50' : 'bg-red-50')}>
                    <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wide mb-1">
                      {isAnswered ? 'Your Answer' : 'Status'}
                    </p>
                    <p className={clsx('text-xs leading-relaxed', isAnswered ? 'text-surface-600' : 'text-red-600 italic')}>
                      {isAnswered ? String(qa.answer) : 'No answer provided for this question.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-full capitalize">
                      {String(qa?.category ?? 'general').replace('-', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* ── Practice Plan ────────────────────────────────────────────────────── */}
      {practicePlan.length > 0 && (
        <div className="bg-white rounded-xl border border-surface-200 p-5 sm:p-6">
          <SectionHeader icon={Calendar} title="Your Practice Plan" />
          <div className="space-y-3">
            {practicePlan.map((day: any, i: number) => (
              <div key={day?.day ?? i} className="flex gap-4 p-4 bg-surface-50 rounded-lg">
                <div className="w-12 h-12 rounded-xl bg-primary-600 text-white flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-medium">Day</span>
                  <span className="text-lg font-bold leading-none">{day?.day ?? i + 1}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900 text-sm mb-1">{day?.title ?? `Day ${i + 1}`}</h3>
                  <ul className="space-y-1">
                    {safeArr<string>(day?.tasks).map((task, j) => (
                      <li key={j} className="text-xs text-surface-600 flex gap-1.5">
                        <span className="text-primary-400 mt-0.5" aria-hidden="true">·</span>
                        {String(task)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────────────────────────── */}
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

      <p className="text-center text-xs text-surface-400 pb-4 italic">
        Interview results are AI-generated practice feedback for preparation purposes only.
        They do not represent professional evaluation or hiring decisions.
      </p>
    </div>
  );
}
