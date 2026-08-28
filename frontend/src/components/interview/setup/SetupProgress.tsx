import { clsx } from 'clsx';
import { Check } from 'lucide-react';

interface Step {
  key: string;
  label: string;
}

interface SetupProgressProps {
  steps: readonly Step[];
  currentIndex: number;
}

export default function SetupProgress({ steps, currentIndex }: SetupProgressProps) {
  return (
    <nav aria-label="Interview setup progress">
      {/* Desktop: horizontal stepper */}
      <div className="hidden sm:flex items-center" role="list">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center flex-1 last:flex-none" role="listitem">
            <div className="flex flex-col items-center">
              <div className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors',
                i < currentIndex
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : i === currentIndex
                  ? 'bg-white border-primary-600 text-primary-600'
                  : 'bg-white border-surface-200 text-surface-400'
              )}
                aria-current={i === currentIndex ? 'step' : undefined}
              >
                {i < currentIndex ? (
                  <Check className="w-4 h-4" aria-hidden="true" />
                ) : (
                  i + 1
                )}
              </div>
              <span className={clsx(
                'text-[10px] font-medium mt-1 whitespace-nowrap',
                i === currentIndex ? 'text-primary-600' : i < currentIndex ? 'text-surface-500' : 'text-surface-300'
              )}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={clsx(
                  'flex-1 h-0.5 mx-2 mb-4 rounded transition-colors',
                  i < currentIndex ? 'bg-primary-600' : 'bg-surface-200'
                )}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile: simple progress bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-xs text-surface-500 mb-2">
          <span>Step {currentIndex + 1} of {steps.length}</span>
          <span className="font-medium text-primary-600">{steps[currentIndex]?.label}</span>
        </div>
        <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={1}
            aria-valuemax={steps.length}
          />
        </div>
      </div>
    </nav>
  );
}
