import React, { useState } from 'react';
import { xpComparisonData } from '../../data/friendsMockData';

export const XPComparisonCard: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxXP = 5000;
  const chartHeightPx = 130;

  return (
    <div 
      id="friends-xp-comparison-card"
      className="bg-[#11161D] border border-white/6 rounded-2xl p-4 lg:p-5 flex flex-col justify-between"
    >
      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">XP Comparison</h3>
        
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[#9AA3B5]">
          {xpComparisonData.map((item) => (
            <div key={item.name} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className={item.name === 'You' ? 'text-white font-semibold' : ''}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="mt-5 pt-3 pb-1">
        <div className="flex items-end justify-between gap-2 sm:gap-4 h-[140px] px-2">
          {xpComparisonData.map((item, idx) => {
            const heightPercent = Math.min((item.xp / maxXP) * 100, 100);
            const isHovered = hoveredIndex === idx;

            return (
              <div 
                key={item.name}
                className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute -top-7 z-10 px-2 py-1 rounded-md bg-[#1E2430] border border-white/10 text-[10px] font-bold text-white whitespace-nowrap shadow-lg">
                    {item.xp.toLocaleString()} XP
                  </div>
                )}

                {/* Top value label */}
                <span className="text-[11px] font-bold text-[#CBD5E1] mb-1.5 tabular-nums">
                  {item.display}
                </span>

                {/* The Bar */}
                <div className="w-full max-w-[34px] bg-white/5 rounded-t-lg overflow-hidden flex items-end justify-center h-full">
                  <div 
                    className="w-full rounded-t-lg transition-all duration-500 ease-out group-hover:brightness-110"
                    style={{ 
                      height: `${heightPercent}%`,
                      backgroundColor: item.color 
                    }}
                  />
                </div>

                {/* Bottom label */}
                <span className={`text-[11px] mt-2 font-medium truncate max-w-[48px] text-center ${
                  item.name === 'You' ? 'text-white font-bold' : 'text-[#687185]'
                }`}>
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Health/Accountability Note */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#9AA3B5]">
        <p className="flex items-center gap-1.5">
          <span>You're 1.1k XP behind Rohan. Keep going!</span>
          <span>💪</span>
        </p>
      </div>
    </div>
  );
};
