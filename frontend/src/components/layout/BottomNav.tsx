import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Play, Clock, BarChart2, User } from 'lucide-react';
import { clsx } from 'clsx';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/interview/history', label: 'History', icon: Clock },
  { to: '/interview/setup', label: 'Start', icon: Play, primary: true },
  { to: '/progress', label: 'Progress', icon: BarChart2 },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white border-t border-surface-200"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-center">
        {items.map(({ to, label, icon: Icon, primary }) => (
          primary ? (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
              aria-label={label}
            >
              <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center shadow-md -mt-4">
                <Icon className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-[10px] font-medium text-primary-600 mt-0.5">{label}</span>
            </button>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => clsx(
                'flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors',
                isActive ? 'text-primary-600' : 'text-surface-400'
              )}
              aria-current={undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon className={clsx('w-5 h-5', isActive ? 'text-primary-600' : 'text-surface-400')} aria-hidden="true" />
                  <span className={clsx('text-[10px] font-medium', isActive ? 'text-primary-600' : 'text-surface-400')}>{label}</span>
                </>
              )}
            </NavLink>
          )
        ))}
      </div>
    </nav>
  );
}
