import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle } from 'lucide-react';

export default function CompletionPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/interview/result', { replace: true });
    }, 3500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-full bg-primary-600/20 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-primary-400" aria-hidden="true" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-primary-400 animate-spin" aria-hidden="true" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2" role="status" aria-live="polite">Interview Completed</h1>
        <p className="text-surface-400 text-sm mb-6">
          Your performance is being analysed. Please wait...
        </p>

        <div className="space-y-2 text-sm text-surface-500 max-w-xs mx-auto">
          <p>Evaluating your answers...</p>
          <p>Calculating communication score...</p>
          <p>Generating personalised feedback...</p>
        </div>
      </div>
    </div>
  );
}
