import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ConsistencyTrendPoint } from '../../types';

interface ConsistencyTrendCardProps {
  data: ConsistencyTrendPoint[];
}

export const ConsistencyTrendCard: React.FC<ConsistencyTrendCardProps> = ({ data }) => {
  const [metricOption, setMetricOption] = useState<'completion' | 'weekly'>('completion');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(4); // Default to Sep 9 per mockup

  // Chart dimensions & coordinate math
  const svgWidth = 640;
  const svgHeight = 175;
  const paddingLeft = 46;
  const paddingRight = 24;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const yTicks = [100, 75, 50, 25, 0];

  // Calculate points
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + (1 - d.completionRate / 100) * chartHeight;
    return { ...d, x, y };
  });

  // Calculate smooth SVG curve path using Catmull-Rom or Cubic Beziers
  const generateCurvedPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const current = pts[i];
      const next = pts[i + 1];
      const controlPointX = (current.x + next.x) / 2;
      path += ` C ${controlPointX} ${current.y}, ${controlPointX} ${next.y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const trendLinePath = generateCurvedPath(points);

  const activePoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

  return (
    <div 
      id="analytics-consistency-trend-card"
      className="p-4 sm:p-5 rounded-xl bg-[#0F1723] border border-white/7 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Consistency Trend
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Your daily completion rate over time.
          </p>
        </div>

        {/* Dropdown filters */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button 
            className="h-7 sm:h-8 px-2.5 rounded-lg bg-white/5 hover:bg-white/8 border border-white/6 text-xs text-[#94A3B8] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            onClick={() => setMetricOption(m => m === 'completion' ? 'weekly' : 'completion')}
          >
            <span>{metricOption === 'completion' ? 'Completion Rate' : 'Weekly Average'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
          </button>
        </div>
      </div>

      {/* Responsive Chart Container */}
      <div className="relative w-full h-[180px] sm:h-[195px] select-none mt-2">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Bar gradient: Cyan to Indigo */}
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#6366F1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4338CA" stopOpacity="0.6" />
            </linearGradient>

            {/* Active hover bar gradient */}
            <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#67E8F9" stopOpacity="1" />
              <stop offset="40%" stopColor="#818CF8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.8" />
            </linearGradient>

            {/* Area under curve gradient */}
            <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-Axis labels */}
          {yTicks.map((val) => {
            const y = paddingTop + (1 - val / 100) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] fill-[#64748B] font-medium"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Vertical Bars */}
          {points.map((pt, i) => {
            const barWidth = 26;
            const barX = pt.x - barWidth / 2;
            const barHeight = (pt.completionRate / 100) * chartHeight;
            const barY = paddingTop + chartHeight - barHeight;
            const isHovered = hoveredIndex === i;

            return (
              <g 
                key={pt.date}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredIndex(i)}
                onClick={() => setHoveredIndex(i)}
              >
                {/* Invisible hover capture hit-box */}
                <rect
                  x={barX - 10}
                  y={paddingTop}
                  width={barWidth + 20}
                  height={chartHeight}
                  fill="transparent"
                />

                {/* Vertical Bar */}
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  rx="5"
                  ry="5"
                  fill={isHovered ? 'url(#barGradientHover)' : 'url(#barGradient)'}
                  className="transition-all duration-200"
                />

                {/* X-axis Day Label */}
                <text
                  x={pt.x}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  className={`text-[11px] font-medium transition-colors ${
                    isHovered ? 'fill-white font-semibold' : 'fill-[#64748B]'
                  }`}
                >
                  {pt.dayLabel}
                </text>
              </g>
            );
          })}

          {/* Trend Curved Line */}
          <path
            d={trendLinePath}
            fill="none"
            stroke="#818CF8"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Dots on the line points */}
          {points.map((pt, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <circle
                key={`dot-${pt.date}`}
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 4.5 : 2.5}
                className={`transition-all duration-150 ${
                  isHovered ? 'fill-white stroke-[#818CF8] stroke-[2.5]' : 'fill-[#C084FC]'
                }`}
              />
            );
          })}
        </svg>

        {/* Floating Tooltip matching mockup */}
        {activePoint && (
          <div
            className="absolute -top-3.5 transform -translate-x-1/2 pointer-events-none transition-all duration-150 z-20"
            style={{
              left: `${(activePoint.x / svgWidth) * 100}%`,
            }}
          >
            <div className="bg-[#162033] border border-white/12 shadow-xl shadow-black/60 rounded-lg px-2.5 py-1.5 text-center min-w-[96px] backdrop-blur-md">
              <p className="text-[10px] text-[#94A3B8] font-medium leading-none">
                {activePoint.dayLabel}
              </p>
              <p className="text-xs font-bold text-white mt-1 leading-none tabular-nums">
                {activePoint.completionRate}% completed
              </p>
              {/* Arrow pointer */}
              <div className="w-2 h-2 bg-[#162033] border-r border-b border-white/12 rotate-45 mx-auto -mb-2 mt-1" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
