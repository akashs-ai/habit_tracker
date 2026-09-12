import React from 'react';
import { BarChart3 } from 'lucide-react';

export const AnalyticsHeader: React.FC = () => {
  return (
    <div id="analytics-hero-section" className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pt-1">
      <div className="max-w-2xl">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/5 border border-white/8 text-[10px] font-bold tracking-widest text-[#818CF8] uppercase mb-2 select-none">
          <BarChart3 className="w-3 h-3 text-[#818CF8]" />
          <span>ANALYTICS</span>
        </div>

        {/* Desktop title: "Your Progress, In Perspective." */}
        {/* Mobile/Tablet title: "Analytics" */}
        <h1 className="hidden sm:block text-2xl md:text-3xl lg:text-[32px] font-bold text-white tracking-tight leading-[1.18]">
          Your Progress, In{' '}
          <span className="bg-gradient-to-r from-[#A855F7] via-[#818CF8] to-[#C084FC] bg-clip-text text-transparent">
            Perspective.
          </span>
        </h1>
        <h1 className="block sm:hidden text-2xl font-bold text-white tracking-tight leading-tight">
          Analytics
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-1.5 max-w-xl leading-relaxed">
          Understand your habits, find patterns, and build a better you.
        </p>
      </div>

      {/* Right Quote on Desktop */}
      <div className="hidden lg:block text-right shrink-0 pt-2 select-none">
        <p className="text-[13px] italic font-serif text-[#8E95A5] leading-snug">
          &ldquo;What gets measured, <br /> gets better.&rdquo;
        </p>
      </div>
    </div>
  );
};
