import React from 'react';
import { clsx } from 'clsx';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 text-center px-4', className)}>
      {icon && (
        <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center mb-4 text-surface-400">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-surface-800 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-surface-500 max-w-sm">{description}</p>
      )}
      {action && (
        <Button className="mt-5" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
