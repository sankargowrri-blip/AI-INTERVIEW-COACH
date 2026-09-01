import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Bot, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

/** After this many ms without a response, show the cold-start hint. */
const COLD_START_WARNING_MS = 4_000;

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const [form,         setForm]         = useState({ email: '', password: '' });
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const [serverError,  setServerError]  = useState('');
  const [isLoading,    setIsLoading]    = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showColdHint, setShowColdHint] = useState(false);

  const coldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear cold-start hint whenever we stop loading
  useEffect(() => {
    if (!isLoading) {
      if (coldTimerRef.current) clearTimeout(coldTimerRef.current);
      setShowColdHint(false);
    }
  }, [isLoading]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (coldTimerRef.current) clearTimeout(coldTimerRef.current);
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim())
      e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Please enter a valid email address.';
    if (!form.password)
      e.password = 'Password is required.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setShowColdHint(false);

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);

    // Show cold-start hint after COLD_START_WARNING_MS if still loading
    coldTimerRef.current = setTimeout(() => setShowColdHint(true), COLD_START_WARNING_MS);

    const result = await login({ email: form.email, password: form.password });

    setIsLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setServerError(result.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-surface-900 text-lg">AI Interview Coach</span>
          </Link>
          <h1 className="text-2xl font-bold text-surface-900 mt-6 mb-1">Welcome back</h1>
          <p className="text-surface-500 text-sm">Sign in to continue your practice.</p>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-card-md p-6 sm:p-8">

          {/* Cold-start hint — shown after 4 s of loading */}
          {showColdHint && (
            <div role="status" aria-live="polite" className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
              <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-amber-700 leading-relaxed">
                The server is starting up — this can take up to 60 seconds on the free hosting tier.
                Please keep this tab open.
              </p>
            </div>
          )}

          {/* Server error */}
          {serverError && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              error={errors.email}
              required
              autoComplete="email"
              disabled={isLoading}
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Your password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              error={errors.password}
              required
              autoComplete="current-password"
              disabled={isLoading}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="text-surface-400 hover:text-surface-600 transition-colors p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye      className="w-4 h-4" />}
                </button>
              }
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-surface-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
