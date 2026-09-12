import React, { useState } from 'react';
import { TimeDistributionItem } from '../../types';

interface TimeDistributionCardProps {
  habitItems: TimeDistributionItem[];
  taskItems: TimeDistributionItem[];
}

export const TimeDistributionCard: React.FC<TimeDistributionCardProps> = ({
  habitItems,
  taskItems,
}) => {
  const [activeTab, setActiveTab] = useState<'habits' | 'tasks'>('habits');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const currentItems = activeTab === 'habits' ? habitItems : taskItems;
  const totalHours = currentItems.reduce((sum, item) => sum + item.hours, 0);

  // SVG Donut Math
  const size = 116;
  const center = size / 2;
  const radius = 40;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div 
      id="analytics-time-distribution-card"
      className="p-4 sm:p-5 rounded-xl bg-[#0F1723] border border-white/7 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Time Distribution
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Where your time goes.
          </p>
        </div>

        {/* Habits vs Tasks Tabs */}
        <div className="flex items-center gap-1 bg-white/4 p-0.5 rounded-lg border border-white/6">
          <button
            onClick={() => setActiveTab('habits')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              activeTab === 'habits'
                ? 'bg-[#6366F1] text-white shadow-xs'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Habits
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              activeTab === 'tasks'
                ? 'bg-[#6366F1] text-white shadow-xs'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Tasks
          </button>
        </div>
      </div>

      {/* Donut and Legend */}
      <div className="flex items-center justify-between sm:justify-around gap-3 pt-3">
        {/* Donut Chart */}
        <div className="relative w-[116px] h-[116px] shrink-0 flex items-center justify-center select-none">
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              className="stroke-white/6 fill-none"
              strokeWidth={strokeWidth}
            />
            {currentItems.map((item) => {
              const itemPercent = (item.hours / totalHours) * 100;
              const strokeDasharray = `${(itemPercent / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((cumulativePercent / 100) * circumference);
              cumulativePercent += itemPercent;
              const isHovered = hoveredCategory === item.category;

              return (
                <circle
                  key={item.category}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredCategory(item.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-lg font-bold text-white tracking-tight leading-none tabular-nums">
              {hoveredCategory
                ? `${currentItems.find(i => i.category === hoveredCategory)?.hours}h`
                : `${totalHours.toFixed(1)}h`}
            </span>
            <span className="text-[10px] text-[#94A3B8] font-medium mt-0.5 leading-none">
              {hoveredCategory || 'Total time'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-1.5 flex-1 max-w-[140px]">
          {currentItems.map((item) => {
            const isHovered = hoveredCategory === item.category;
            return (
              <div
                key={item.category}
                onMouseEnter={() => setHoveredCategory(item.category)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`flex items-center justify-between gap-2 text-xs py-0.5 px-1.5 rounded transition-all cursor-pointer ${
                  isHovered ? 'bg-white/6 text-white' : 'text-[#94A3B8]'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`truncate text-[11px] ${isHovered ? 'text-white font-medium' : 'text-[#CBD5E1]'}`}>
                    {item.category}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-white/90 tabular-nums">
                  {item.hours}h
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
