import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
  animated?: boolean;
}

const colorClasses = {
  primary: 'bg-primary-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

const heightClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3.5',
};

function getColor(value: number): 'success' | 'primary' | 'warning' | 'danger' {
  if (value >= 80) return 'success';
  if (value >= 60) return 'primary';
  if (value >= 40) return 'warning';
  return 'danger';
}

export default function ProgressBar({
  value,
  label,
  showValue = true,
  size = 'md',
  color,
  className,
  animated = false,
}: ProgressBarProps) {
  const barColor = color || getColor(value);
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={clsx('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm text-surface-700">{label}</span>}
          {showValue && <span className="text-sm font-semibold text-surface-800">{clamped}%</span>}
        </div>
      )}
      <div
        className={clsx('w-full bg-surface-100 rounded-full overflow-hidden', heightClasses[size])}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-700 ease-out',
            colorClasses[barColor],
            animated && 'animate-pulse-slow'
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
