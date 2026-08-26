import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = 'h-16 w-full',
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-slate-900/60 border border-slate-800/80 rounded-lg animate-pulse ${className}`}
        />
      ))}
    </div>
  );
};
