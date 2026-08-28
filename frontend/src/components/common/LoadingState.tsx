import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  className?: string;
}

export default function LoadingState({
  message = 'Loading...',
  size = 'md',
  fullPage = false,
  className,
}: LoadingStateProps) {
  const iconSize = size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12';
  const textSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={clsx(
        'flex flex-col items-center justify-center gap-3',
        fullPage ? 'min-h-screen' : 'py-16',
        className
      )}
    >
      <Loader2 className={clsx(iconSize, 'text-primary-500 animate-spin')} aria-hidden="true" />
      {message && (
        <p className={clsx(textSize, 'text-surface-500 font-medium')}>{message}</p>
      )}
    </div>
  );
}
