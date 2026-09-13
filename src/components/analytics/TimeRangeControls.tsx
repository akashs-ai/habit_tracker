import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { AnalyticsTimeRange } from '../../types';

interface TimeRangeControlsProps {
  timeRange: AnalyticsTimeRange;
  setTimeRange: (range: AnalyticsTimeRange) => void;
  dateRangeText?: string;
  onDateRangeClick?: () => void;
}

export const TimeRangeControls: React.FC<TimeRangeControlsProps> = ({
  timeRange,
  setTimeRange,
  dateRangeText = 'Sep 5, 2025 – Sep 11, 2025',
  onDateRangeClick,
}) => {
  const ranges: { id: AnalyticsTimeRange; labelFull: string; labelShort: string }[] = [
    { id: '7d', labelFull: '7 Days', labelShort: '7D' },
    { id: '30d', labelFull: '30 Days', labelShort: '30D' },
    { id: '3m', labelFull: '3 Months', labelShort: '3M' },
    { id: '1y', labelFull: '1 Year', labelShort: '1Y' },
    { id: 'all', labelFull: 'All Time', labelShort: 'All' },
  ];

  return (
    <div 
      id="analytics-time-range-controls" 
      className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1"
    >
      {/* Time Range Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none bg-slate-100 dark:bg-[#0F1723]/90 p-1 rounded-xl border border-slate-200 dark:border-white/6 w-fit">
        {ranges.map((r) => {
          const isActive = timeRange === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setTimeRange(r.id)}
              className={`h-8 sm:h-9 px-3 sm:px-4 rounded-[9px] text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-[#6366F1] text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/4'
              }`}
            >
              <span className="hidden sm:inline">{r.labelFull}</span>
              <span className="inline sm:hidden">{r.labelShort}</span>
            </button>
          );
        })}
      </div>

      {/* Date Range Selector Pill */}
      <button
        onClick={onDateRangeClick}
        className="h-9 px-3.5 rounded-xl bg-white dark:bg-[#0F1723] hover:bg-slate-50 dark:hover:bg-[#141C2B] border border-slate-200 dark:border-white/6 text-xs text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white flex items-center justify-between sm:justify-start gap-2 transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
        title="Change custom date range"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-[#818CF8]" />
          <span className="font-medium text-slate-800 dark:text-white/90">{dateRangeText}</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#64748B]" />
      </button>
    </div>
  );
};
