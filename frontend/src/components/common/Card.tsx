import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export default function Card({ children, className, hoverable, padding = 'md', onClick }: CardProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      className={clsx(
        'bg-white rounded-xl border border-surface-200 shadow-card',
        hoverable && 'transition-all duration-200 hover:shadow-card-hover hover:border-surface-300',
        onClick && 'text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        paddingClasses[padding],
        className
      )}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}
