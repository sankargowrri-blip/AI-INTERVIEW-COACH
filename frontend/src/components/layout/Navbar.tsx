import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Bot, ChevronDown, User, LogOut, BarChart2, Clock, BookOpen, FileText, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import Button from '../common/Button';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/practice', label: 'Practice', icon: BookOpen },
  { to: '/interview/history', label: 'History', icon: Clock },
  { to: '/progress', label: 'Progress', icon: BarChart2 },
  { to: '/resume', label: 'Resume', icon: FileText },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
    setProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-surface-900 text-sm sm:text-base tracking-tight">
              AI Interview Coach
            </span>
          </Link>

          {/* Desktop Nav — authenticated */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => clsx(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                  )}
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* Desktop Nav — public */}
          {!isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1" aria-label="Public navigation">
              {['Home', 'Features', 'How It Works', 'Interview Types', 'About'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-colors duration-150"
                >
                  {item}
                </a>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  size="sm"
                  onClick={() => navigate('/interview/setup')}
                  className="hidden sm:inline-flex"
                >
                  Start Interview
                </Button>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    aria-expanded={profileOpen}
                    aria-haspopup="menu"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-700 font-semibold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-surface-700 max-w-[120px] truncate">
                      {user?.name || 'User'}
                    </span>
                    <ChevronDown className={clsx('w-4 h-4 text-surface-400 transition-transform hidden sm:block', profileOpen && 'rotate-180')} aria-hidden="true" />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} aria-hidden="true" />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-surface-200 shadow-card-lg z-20 py-1" role="menu">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                          onClick={() => setProfileOpen(false)}
                          role="menuitem"
                        >
                          <User className="w-4 h-4" aria-hidden="true" /> Profile
                        </Link>
                        <div className="border-t border-surface-100 my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          role="menuitem"
                        >
                          <LogOut className="w-4 h-4" aria-hidden="true" /> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile hamburger */}
                <button
                  className="lg:hidden p-2 rounded-lg hover:bg-surface-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-expanded={menuOpen}
                  aria-label="Toggle navigation menu"
                >
                  {menuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-flex btn-secondary text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">
                  Create Account
                </Link>
                <button
                  className="sm:hidden p-2 rounded-lg hover:bg-surface-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-expanded={menuOpen}
                  aria-label="Toggle navigation menu"
                >
                  {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-surface-200 bg-white" role="navigation" aria-label="Mobile navigation">
          <div className="px-4 py-3 space-y-1">
            {isAuthenticated ? (
              <>
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) => clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-surface-700 hover:bg-surface-100'
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" /> {label}
                  </NavLink>
                ))}
                <div className="pt-2 border-t border-surface-100 mt-2">
                  <Button
                    className="w-full"
                    onClick={() => { navigate('/interview/setup'); setMenuOpen(false); }}
                  >
                    Start Interview
                  </Button>
                </div>
              </>
            ) : (
              <>
                {['Home', 'Features', 'How It Works', 'Interview Types', 'About'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <div className="flex gap-3 pt-3 border-t border-surface-100 mt-2">
                  <Link to="/login" className="flex-1 btn-secondary text-center" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="flex-1 btn-primary text-center" onClick={() => setMenuOpen(false)}>Create Account</Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
