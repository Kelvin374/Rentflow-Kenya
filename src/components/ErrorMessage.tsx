'use client';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 ${className}`}>
      <div className="w-14 h-14 bg-error/10 rounded-2xl flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-error text-2xl">cloud_off</span>
      </div>
      <p className="text-sm font-medium text-on-surface mb-1">Failed to load data</p>
      <p className="text-sm text-on-surface-variant text-center max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Try Again
        </button>
      )}
    </div>
  );
}
