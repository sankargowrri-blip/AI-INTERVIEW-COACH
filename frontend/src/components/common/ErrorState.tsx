import { AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import Button from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export default function ErrorState({
  title = 'Something went wrong',
  message,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div role="alert" className={clsx(
      'flex flex-col items-center justify-center py-12 text-center px-4',
      className
    )}>
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-red-500" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-surface-800 mb-1">{title}</h3>
      <p className="text-sm text-surface-500 max-w-sm">{message}</p>
      {action && (
        <Button className="mt-5" variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
