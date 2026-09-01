import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Filter, Trash2, Eye, AlertCircle, CheckCircle, X } from 'lucide-react';
import { interviewService } from '../../services/interviewService';
import { mockInterviewHistory } from '../../data/mockInterviews';
import type { InterviewHistoryItem } from '../../types';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { clsx } from 'clsx';

// ── Confirmation Dialog ────────────────────────────────────────────────────────

interface ConfirmDeleteDialogProps {
  item: InterviewHistoryItem;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDeleteDialog({ item, isDeleting, onConfirm, onCancel }: ConfirmDeleteDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus the cancel button when dialog opens for keyboard accessibility
  useEffect(() => { cancelRef.current?.focus(); }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isDeleting) onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isDeleting, onCancel]);

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-description"
      onClick={e => { if (e.target === e.currentTarget && !isDeleting) onCancel(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 id="confirm-delete-title" className="font-bold text-surface-900 text-lg">
              Delete Interview History?
            </h2>
            <p id="confirm-delete-description" className="text-sm text-surface-500 mt-1">
              This will permanently delete the following interview and all its associated data.
              This action cannot be undone.
            </p>
          </div>
          {!isDeleting && (
            <button
              onClick={onCancel}
              className="p-1 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors shrink-0"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Interview summary */}
        <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 mb-6 space-y-1">
          <p className="font-semibold text-surface-900 text-sm">{item.role}</p>
          <p className="text-xs text-surface-500">
            {new Date(item.date).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
            })}
            {' · '}
            {interviewService.formatInterviewType(item.interviewType)}
            {' · '}
            {interviewService.formatDifficulty(item.difficulty)}
          </p>
          <p className="text-xs text-surface-600 font-medium">Score: {item.score}/100</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 text-surface-700 font-medium text-sm hover:bg-surface-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label="Confirm delete interview"
          >
            {isDeleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toast notification ─────────────────────────────────────────────────────────

interface ToastProps { message: string; type: 'success' | 'error'; onClose: () => void; }

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={clsx(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3',
        'px-5 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm w-full mx-4',
        type === 'success'
          ? 'bg-emerald-600 text-white'
          : 'bg-red-600 text-white',
      )}
    >
      {type === 'success'
        ? <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
        : <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-80 hover:opacity-100" aria-label="Dismiss">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── History Card ───────────────────────────────────────────────────────────────

interface HistoryCardProps {
  item: InterviewHistoryItem;
  deletingId: string | null;
  onViewResult: (id: string) => void;
  onDeleteClick: (item: InterviewHistoryItem) => void;
}

function HistoryCard({ item, deletingId, onViewResult, onDeleteClick }: HistoryCardProps) {
  const isThisDeleting = deletingId === item.id;

  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-surface-200 p-4 sm:p-5 transition-all duration-200',
        'hover:shadow-sm hover:border-surface-300',
        isThisDeleting && 'opacity-50 pointer-events-none',
      )}
      aria-label={`${item.role} interview on ${new Date(item.date).toLocaleDateString()}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Left: metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-surface-900 text-base">{item.role}</h3>
            <Badge variant={item.experienceLevel === 'fresher' ? 'primary' : 'info'}>
              {interviewService.formatExperienceLevel(item.experienceLevel)}
            </Badge>
          </div>

          <p className="text-xs text-surface-500 mb-3">
            {new Date(item.date).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
            })}
            {' · '}
            {new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            {' · '}
            {interviewService.formatInterviewType(item.interviewType)}
            {' · '}
            <span className="capitalize">{item.difficulty}</span>
            {item.duration > 0 && ` · ${item.duration} min`}
          </p>

          {/* Score chips */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 bg-surface-50 border border-surface-200 rounded-lg px-2.5 py-1">
              <span className="text-xs text-surface-500">Overall</span>
              <span className={clsx('text-sm font-bold', interviewService.getScoreColor(item.score))}>
                {item.score}/100
              </span>
            </div>
            <span className={clsx('badge border text-xs', interviewService.getClassificationColor(item.classification))}>
              {item.classification}
            </span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex sm:flex-col gap-2 shrink-0">
          <button
            onClick={() => onViewResult(item.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold transition-colors flex-1 sm:flex-none justify-center"
            aria-label={`View result for ${item.role} interview`}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            View Result
          </button>
          <button
            onClick={() => onDeleteClick(item)}
            disabled={isThisDeleting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold transition-colors flex-1 sm:flex-none justify-center disabled:opacity-50"
            aria-label={`Delete ${item.role} interview history`}
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            {isThisDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const navigate   = useNavigate();
  const [history,    setHistory]    = useState<InterviewHistoryItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState<'all' | 'fresher' | 'experienced'>('all');
  const [confirmItem, setConfirmItem] = useState<InterviewHistoryItem | null>(null);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  // ── Load history ──────────────────────────────────────────────────────────
  useEffect(() => {
    interviewService.getHistory().then(h => {
      // Merge with mock data for demo: backend items first, then mock items not already present
      const backendIds = new Set(h.map(i => i.id));
      const mockItems  = mockInterviewHistory.filter(m => !backendIds.has(m.id));
      setHistory([...h, ...mockItems]);
      setLoading(false);
    }).catch(() => {
      setHistory(mockInterviewHistory);
      setLoading(false);
    });
  }, []);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = filter === 'all'
    ? history
    : history.filter(h => h.experienceLevel === filter);

  // Newest first
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleViewResult = useCallback((id: string) => {
    navigate(`/interview/history/${id}`);
  }, [navigate]);

  const handleDeleteClick = useCallback((item: InterviewHistoryItem) => {
    setConfirmItem(item);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setConfirmItem(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmItem) return;
    const id = confirmItem.id;
    setDeletingId(id);

    try {
      await interviewService.deleteInterview(id);

      // Optimistic update: remove from local state immediately
      setHistory(prev => prev.filter(h => h.id !== id));
      setConfirmItem(null);
      setDeletingId(null);
      setToast({ message: 'Interview history deleted successfully.', type: 'success' });
    } catch (err: any) {
      setDeletingId(null);
      setConfirmItem(null);

      const status = err?.response?.status;
      let message = 'Unable to delete this interview. Please try again.';
      if (status === 401) message = 'You must be logged in to delete interviews.';
      else if (status === 403) message = 'You do not have permission to delete this interview.';
      else if (status === 404) message = 'Interview not found — it may have already been deleted.';
      else if (status >= 500) message = 'Server error. Please try again in a moment.';

      setToast({ message, type: 'error' });
    }
  }, [confirmItem]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <LoadingState message="Loading history…" />;

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Interview History</h1>
            <p className="text-surface-500 text-sm mt-1">
              {history.length} session{history.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-surface-400" aria-hidden="true" />
            <select
              className="text-sm border border-surface-200 rounded-lg px-3 py-1.5 bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filter}
              onChange={e => setFilter(e.target.value as typeof filter)}
              aria-label="Filter by experience level"
            >
              <option value="all">All</option>
              <option value="fresher">Fresher</option>
              <option value="experienced">Experienced</option>
            </select>
          </div>
        </div>

        {/* Empty state */}
        {sorted.length === 0 ? (
          <EmptyState
            icon={<Clock className="w-8 h-8" />}
            title="No interview history yet"
            description={
              filter !== 'all'
                ? `No ${filter} interviews found. Try changing the filter.`
                : 'Complete your first mock interview to see your results here.'
            }
            action={
              filter === 'all'
                ? { label: 'Start Interview', onClick: () => navigate('/interview/setup') }
                : { label: 'Show All', onClick: () => setFilter('all') }
            }
          />
        ) : (
          <div className="space-y-3" role="list" aria-label="Interview history">
            {sorted.map(item => (
              <div key={item.id} role="listitem">
                <HistoryCard
                  item={item}
                  deletingId={deletingId}
                  onViewResult={handleViewResult}
                  onDeleteClick={handleDeleteClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation dialog */}
      {confirmItem && (
        <ConfirmDeleteDialog
          item={confirmItem}
          isDeleting={deletingId === confirmItem.id}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={dismissToast}
        />
      )}
    </>
  );
}
