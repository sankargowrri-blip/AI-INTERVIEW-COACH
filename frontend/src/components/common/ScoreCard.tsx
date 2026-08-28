import { clsx } from 'clsx';

interface ScoreCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'teal';
  className?: string;
}

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', value: 'text-blue-700', border: 'border-blue-100' },
  green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', value: 'text-emerald-700', border: 'border-emerald-100' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', value: 'text-amber-700', border: 'border-amber-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', value: 'text-purple-700', border: 'border-purple-100' },
  teal: { bg: 'bg-teal-50', icon: 'text-teal-600', value: 'text-teal-700', border: 'border-teal-100' },
};

export default function ScoreCard({ label, value, sub, icon, color = 'blue', className }: ScoreCardProps) {
  const c = colorMap[color];
  return (
    <div className={clsx(
      'bg-white rounded-xl border p-4 sm:p-5',
      c.border,
      className
    )}>
      {icon && (
        <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center mb-3', c.bg, c.icon)}>
          {icon}
        </div>
      )}
      <div className={clsx('text-2xl font-bold', c.value)}>{value}</div>
      <div className="text-sm font-medium text-surface-700 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-surface-500 mt-0.5">{sub}</div>}
    </div>
  );
}
