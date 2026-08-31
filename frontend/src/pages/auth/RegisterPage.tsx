import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Bot } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);
    const result = await register(form);
    setIsLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setServerError(result.error || 'Registration failed. Please try again.');
    }
  };

  const update = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
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
          <h1 className="text-2xl font-bold text-surface-900 mt-6 mb-1">Create your account</h1>
          <p className="text-surface-500 text-sm">Start practicing interviews for free.</p>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-card-md p-6 sm:p-8">
          {serverError && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Johnson"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              error={errors.name}
              required
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              error={errors.email}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
              value={form.password}
              onChange={e => update('password', e.target.value)}
              error={errors.password}
              required
              autoComplete="new-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="text-surface-400 hover:text-surface-600 transition-colors p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <Input
              label="Confirm Password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={e => update('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirm(s => !s)}
                  className="text-surface-400 hover:text-surface-600 transition-colors p-0.5"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-surface-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
