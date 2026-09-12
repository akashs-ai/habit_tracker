import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { HeatmapDay } from '../../types';

interface ActivityHeatmapCardProps {
  days: HeatmapDay[];
}

export const ActivityHeatmapCard: React.FC<ActivityHeatmapCardProps> = ({ days }) => {
  const [selectedMonth, setSelectedMonth] = useState('Sept 2025');
  const [hoveredCell, setHoveredCell] = useState<HeatmapDay | null>(null);

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getCellColor = (level: HeatmapDay['level']) => {
    switch (level) {
      case 0:
        return 'bg-[#151D2A] border border-white/5';
      case 1:
        return 'bg-[#1E293B] border border-white/7';
      case 2:
        return 'bg-[#3730A3] border border-indigo-400/20';
      case 3:
        return 'bg-[#6366F1] border border-indigo-400/40';
      case 4:
        return 'bg-[#818CF8] border border-indigo-300/60 shadow-[0_0_8px_rgba(129,140,248,0.3)]';
    }
  };

  // Group by day of week (7 rows)
  const rows: HeatmapDay[][] = [[], [], [], [], [], [], []];
  days.forEach((day) => {
    if (day.dayOfWeek >= 0 && day.dayOfWeek < 7) {
      rows[day.dayOfWeek].push(day);
    }
  });

  return (
    <div 
      id="analytics-activity-heatmap-card"
      className="p-4 sm:p-5 rounded-xl bg-[#0F1723] border border-white/7 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Activity Heatmap
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Your daily activity at a glance.
          </p>
        </div>

        {/* Month Selector */}
        <button
          onClick={() => setSelectedMonth(m => m === 'Sept 2025' ? 'Aug 2025' : 'Sept 2025')}
          className="h-7 px-2.5 rounded-lg bg-white/5 hover:bg-white/8 border border-white/6 text-xs text-[#94A3B8] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>{selectedMonth}</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
        </button>
      </div>

      {/* Grid Container */}
      <div className="relative pt-3 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex gap-2 min-w-fit items-center">
          {/* Day of week labels */}
          <div className="flex flex-col gap-1 text-[10px] text-[#64748B] font-medium pr-1 select-none">
            {dayLabels.map((lbl, idx) => (
              <span key={lbl} className="h-3 leading-3 flex items-center">
                {idx % 2 === 0 ? lbl : ''}
              </span>
            ))}
          </div>

          {/* Heatmap 7 rows */}
          <div className="flex flex-col gap-1">
            {rows.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-1 items-center">
                {row.map((cell, colIdx) => {
                  const isHovered = hoveredCell === cell;
                  return (
                    <div
                      key={`${rowIdx}-${colIdx}`}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      onClick={() => setHoveredCell(cell)}
                      className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-[3px] transition-all duration-150 cursor-pointer ${getCellColor(
                        cell.level
                      )} ${isHovered ? 'scale-125 z-10' : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoveredCell && (
          <div className="mt-2 text-xs bg-[#162033] border border-white/10 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-white shadow-lg animate-in fade-in duration-150">
            <span className="font-semibold text-white">{hoveredCell.date}</span>
            <span className="text-[#94A3B8]">
              {hoveredCell.count} completed activities • {hoveredCell.consistencyRate}% consistency
            </span>
          </div>
        )}
      </div>

      {/* Legend at bottom */}
      <div className="flex items-center justify-end gap-1.5 text-[10px] text-[#64748B] pt-2 select-none border-t border-white/5 mt-2">
        <span>Less</span>
        <span className="w-2.5 h-2.5 rounded-[2px] bg-[#151D2A] border border-white/5" />
        <span className="w-2.5 h-2.5 rounded-[2px] bg-[#1E293B]" />
        <span className="w-2.5 h-2.5 rounded-[2px] bg-[#3730A3]" />
        <span className="w-2.5 h-2.5 rounded-[2px] bg-[#6366F1]" />
        <span className="w-2.5 h-2.5 rounded-[2px] bg-[#818CF8]" />
        <span>More</span>
      </div>
    </div>
  );
};
