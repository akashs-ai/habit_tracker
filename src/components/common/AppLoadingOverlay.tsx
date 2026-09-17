import React from 'react';
import { LoadingSkeleton } from './LoadingSkeleton';
import { Sparkles } from 'lucide-react';

interface AppLoadingOverlayProps {
  message?: string;
}

export const AppLoadingOverlay: React.FC<AppLoadingOverlayProps> = ({
  message = 'Synchronizing character progress & daily quests...',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="min-h-screen w-full flex flex-col bg-[#F8FAFC] text-slate-900 dark:bg-[#08090B] dark:text-[#F5F7FF] font-sans antialiased overflow-hidden select-none"
    >
      {/* Skeleton Header Bar */}
      <header className="h-16 w-full border-b border-slate-200 dark:border-white/5 bg-white/70 dark:bg-[#08090B]/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {/* Logo placeholder */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C6CFF]/30 to-[#9B8CFF]/20 animate-pulse flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#7C6CFF] opacity-70 animate-spin" />
          </div>
          <div className="space-y-1.5 hidden sm:block">
            <div className="h-4 w-28 bg-slate-300/80 dark:bg-white/10 rounded-md animate-pulse" />
            <div className="h-2.5 w-16 bg-slate-200/80 dark:bg-white/5 rounded-md animate-pulse" />
          </div>
        </div>

        {/* Global Search skeleton */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="h-9 w-full bg-slate-200/70 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 animate-pulse" />
        </div>

        {/* User stats & actions skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-24 bg-slate-200/70 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5 animate-pulse hidden sm:block" />
          <div className="h-9 w-9 rounded-xl bg-slate-200/70 dark:bg-white/5 border border-slate-200 dark:border-white/5 animate-pulse" />
          <div className="w-9 h-9 rounded-full bg-slate-300/80 dark:bg-white/10 border border-slate-200 dark:border-white/5 animate-pulse" />
        </div>
      </header>

      {/* Body Area with Sidebar + Content */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Desktop Sidebar Skeleton */}
        <aside className="w-64 border-r border-slate-200 dark:border-white/5 p-5 hidden lg:flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <div className="h-20 rounded-2xl bg-slate-200/70 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-slate-300/80 dark:bg-white/10" />
              <div className="space-y-2 flex-1">
                <div className="h-3.5 w-20 bg-slate-300/80 dark:bg-white/10 rounded" />
                <div className="h-2.5 w-28 bg-slate-200/80 dark:bg-white/5 rounded" />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 rounded-xl bg-slate-200/60 dark:bg-white/5 px-3 flex items-center gap-3 animate-pulse"
                >
                  <div className="w-4 h-4 rounded bg-slate-300/70 dark:bg-white/10" />
                  <div
                    className="h-3 bg-slate-300/70 dark:bg-white/10 rounded"
                    style={{ width: `${60 + (i * 15) % 40}%` }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-white/5 space-y-2">
            <div className="h-10 rounded-xl bg-slate-200/60 dark:bg-white/5 animate-pulse" />
          </div>
        </aside>

        {/* Main Dashboard Canvas Skeleton */}
        <main className="flex-1 p-4 sm:px-6 lg:px-8 py-6 space-y-6 min-w-0 overflow-y-auto">
          {/* Top Hero Banner Skeleton */}
          <LoadingSkeleton type="banner" count={1} />

          {/* 3-Column Top Bento Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LoadingSkeleton type="card" count={3} />
          </div>

          {/* Split Content: Quests/Tasks and Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-4">
              <div className="h-6 w-36 bg-slate-300/80 dark:bg-white/10 rounded-md animate-pulse mb-2" />
              <LoadingSkeleton type="row" count={4} />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="h-6 w-44 bg-slate-300/80 dark:bg-white/10 rounded-md animate-pulse mb-2" />
              <LoadingSkeleton type="chart" count={1} />
            </div>
          </div>
        </main>
      </div>

      {/* Floating Status Indicator Pill */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 rounded-full bg-white/95 dark:bg-[#14151B]/95 border border-slate-200/80 dark:border-white/10 shadow-xl shadow-[#7C6CFF]/10 backdrop-blur-md flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#7C6CFF] animate-ping opacity-75" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#7C6CFF] absolute" />
        </div>
        <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 tracking-wide">
          {message}
        </span>
      </div>
    </div>
  );
};
