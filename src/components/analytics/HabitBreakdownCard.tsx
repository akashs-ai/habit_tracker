import React, { useState } from 'react';
import { HabitBreakdownCategory } from '../../types';

interface HabitBreakdownCardProps {
  categories: HabitBreakdownCategory[];
}

export const HabitBreakdownCard: React.FC<HabitBreakdownCardProps> = ({ categories }) => {
  const [activeTab, setActiveTab] = useState<'type' | 'time' | 'completion'>('type');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const totalCount = categories.reduce((acc, curr) => acc + curr.count, 0);

  // SVG Donut Math
  // Outer radius 54, inner radius 36 (stroke width 18)
  const size = 130;
  const center = size / 2;
  const radius = 45;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div 
      id="analytics-habit-breakdown-card"
      className="p-4 sm:p-5 rounded-xl bg-[#0F1723] border border-white/7 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
          Habit Breakdown
        </h2>

        {/* Tab Pills */}
        <div className="flex items-center gap-1 bg-white/4 p-0.5 rounded-lg border border-white/6 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('type')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              activeTab === 'type'
                ? 'bg-[#6366F1] text-white shadow-xs'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Habit Type
          </button>
          <button
            onClick={() => setActiveTab('time')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              activeTab === 'time'
                ? 'bg-[#6366F1] text-white shadow-xs'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Time Spent
          </button>
          <button
            onClick={() => setActiveTab('completion')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              activeTab === 'completion'
                ? 'bg-[#6366F1] text-white shadow-xs'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Completion
          </button>
        </div>
      </div>

      {/* Main Content: Donut + Legend */}
      <div className="flex items-center justify-between sm:justify-around gap-3 pt-2">
        {/* Donut Chart */}
        <div className="relative w-[130px] h-[130px] shrink-0 flex items-center justify-center select-none">
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              className="stroke-white/6 fill-none"
              strokeWidth={strokeWidth}
            />
            {categories.map((cat) => {
              const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((cumulativePercent / 100) * circumference);
              cumulativePercent += cat.percentage;
              const isHovered = hoveredCategory === cat.name;

              return (
                <circle
                  key={cat.name}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={cat.color}
                  strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredCategory(cat.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              );
            })}
          </svg>

          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-xl font-extrabold text-white tracking-tight leading-none tabular-nums">
              {hoveredCategory
                ? categories.find(c => c.name === hoveredCategory)?.count || totalCount
                : totalCount}
            </span>
            <span className="text-[10px] text-[#94A3B8] font-medium mt-0.5 leading-none">
              {hoveredCategory || 'Total Habits'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-1.5 flex-1 max-w-[150px]">
          {categories.map((cat) => {
            const isHovered = hoveredCategory === cat.name;
            return (
              <div
                key={cat.name}
                onMouseEnter={() => setHoveredCategory(cat.name)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`flex items-center justify-between gap-2 text-xs py-0.5 px-1.5 rounded transition-all cursor-pointer ${
                  isHovered ? 'bg-white/6 text-white' : 'text-[#94A3B8]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className={`truncate ${isHovered ? 'text-white font-medium' : 'text-[#CBD5E1]'}`}>
                    {cat.name}
                  </span>
                </div>
                <span className="font-semibold text-white/90 tabular-nums">
                  {cat.percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
