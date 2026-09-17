import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'row' | 'chart' | 'banner';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  count = 1,
  className = '',
}) => {
  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          {type === 'card' && (
            <div className="h-44 rounded-2xl bg-slate-200/70 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-slate-300/80 dark:bg-white/10 rounded-md" />
                <div className="h-4 w-8 bg-slate-300/80 dark:bg-white/10 rounded-md" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-3/4 bg-slate-300/80 dark:bg-white/10 rounded-md" />
                <div className="h-3 w-1/2 bg-slate-300/80 dark:bg-white/10 rounded-md" />
              </div>
              <div className="h-8 w-full bg-slate-300/80 dark:bg-white/10 rounded-xl" />
            </div>
          )}

          {type === 'row' && (
            <div className="h-14 rounded-xl bg-slate-200/70 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-5 h-5 rounded-full bg-slate-300/80 dark:bg-white/10" />
                <div className="h-4 w-1/3 bg-slate-300/80 dark:bg-white/10 rounded-md" />
              </div>
              <div className="h-4 w-16 bg-slate-300/80 dark:bg-white/10 rounded-md" />
            </div>
          )}

          {type === 'banner' && (
            <div className="h-32 rounded-3xl bg-slate-200/70 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-6 flex flex-col justify-between">
              <div className="h-6 w-48 bg-slate-300/80 dark:bg-white/10 rounded-md" />
              <div className="h-4 w-96 max-w-full bg-slate-300/80 dark:bg-white/10 rounded-md" />
            </div>
          )}

          {type === 'chart' && (
            <div className="h-52 rounded-2xl bg-slate-200/70 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 flex flex-col justify-end gap-2">
              <div className="flex items-end justify-between h-36 gap-2 pt-4">
                {Array.from({ length: 7 }).map((_, barIdx) => (
                  <div
                    key={barIdx}
                    className="flex-1 bg-slate-300/80 dark:bg-white/10 rounded-t-lg"
                    style={{ height: `${20 + (barIdx * 12) % 65}%` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
