import React, { useState } from 'react';
import { X, ChevronDown, TrendingUp, Info } from 'lucide-react';
import { compareProgressPoints } from '../../data/friendsMockData';

interface CompareFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompareFriendsModal: React.FC<CompareFriendsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [metric, setMetric] = useState<'XP' | 'Consistency' | 'Completion'>('XP');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isOpen) return null;

  // Chart coordinates mapping
  // X: 5 points: Jan 1 (50), Jan 8 (135), Jan 15 (220), Jan 22 (305), Jan 31 (390) - width 440
  // Y: 0k (200), 2k (146), 4k (93), 6k (40) - height 240
  const getY = (val: number) => {
    const max = 6000;
    const chartHeight = 160;
    const topPadding = 30;
    const ratio = Math.min(val / max, 1);
    return topPadding + chartHeight * (1 - ratio);
  };

  const xCoords = [55, 140, 225, 310, 395];

  const getPointsString = (key: 'you' | 'rohan' | 'sneha' | 'kabir') => {
    return compareProgressPoints
      .map((pt, idx) => `${xCoords[idx]},${getY(pt[key])}`)
      .join(' ');
  };

  return (
    <div 
      id="compare-friends-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="compare-friends-modal-card"
        className="w-full max-w-[580px] bg-[#0E1217] border border-white/10 rounded-2xl p-6 shadow-2xl relative text-[#F7F8FC] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#9AA3B5]">Compare Friends (Modal)</span>
          </div>
          <button 
            id="close-compare-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#687185] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title & Dropdown */}
        <div className="pt-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[#6366F1] flex items-center justify-center shrink-0 mt-0.5">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Compare Progress</h3>
              <p className="text-xs text-[#9AA3B5] mt-0.5">See how you and your friends are doing.</p>
            </div>
          </div>

          {/* Metric Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white flex items-center gap-2 hover:bg-white/10 transition-colors"
            >
              <span>{metric}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#9AA3B5]" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-[#151A22] border border-white/10 rounded-xl py-1 shadow-xl z-20 text-xs">
                {(['XP', 'Consistency', 'Completion'] as const).map((m) => (
                  <button 
                    key={m}
                    onClick={() => {
                      setMetric(m);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 ${
                      metric === m ? 'text-[#6366F1] font-semibold bg-white/5' : 'text-[#9AA3B5] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-5 text-xs text-[#9AA3B5]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
            <span className="text-white font-medium">You</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
            <span>Rohan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]" />
            <span>Sneha</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FB923C]" />
            <span>Kabir</span>
          </div>
        </div>

        {/* SVG Multi-Line Chart */}
        <div className="mt-4 bg-[#12161E] border border-white/5 rounded-xl p-4 relative overflow-hidden">
          <svg className="w-full h-48 overflow-visible" viewBox="0 0 440 210">
            {/* Horizontal Grid lines */}
            <line x1="40" y1="30" x2="420" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <text x="15" y="34" fill="#687185" fontSize="10" fontFamily="sans-serif">6k</text>

            <line x1="40" y1="83" x2="420" y2="83" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <text x="15" y="87" fill="#687185" fontSize="10" fontFamily="sans-serif">4k</text>

            <line x1="40" y1="136" x2="420" y2="136" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <text x="15" y="140" fill="#687185" fontSize="10" fontFamily="sans-serif">2k</text>

            <line x1="40" y1="190" x2="420" y2="190" stroke="rgba(255,255,255,0.12)" />
            <text x="18" y="193" fill="#687185" fontSize="10" fontFamily="sans-serif">0</text>

            {/* Lines for each friend */}
            {/* Rohan (cyan) */}
            <polyline
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={getPointsString('rohan')}
            />

            {/* Sneha (emerald) */}
            <polyline
              fill="none"
              stroke="#34D399"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={getPointsString('sneha')}
            />

            {/* Kabir (orange) */}
            <polyline
              fill="none"
              stroke="#FB923C"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={getPointsString('kabir')}
            />

            {/* You (purple / high-contrast bold) */}
            <polyline
              fill="none"
              stroke="#6366F1"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={getPointsString('you')}
            />

            {/* Dots for You */}
            {compareProgressPoints.map((pt, idx) => (
              <circle
                key={`dot-you-${idx}`}
                cx={xCoords[idx]}
                cy={getY(pt.you)}
                r="4"
                fill="#6366F1"
                stroke="#0E1217"
                strokeWidth="2"
              />
            ))}

            {/* X-axis labels */}
            {compareProgressPoints.map((pt, idx) => (
              <text
                key={pt.date}
                x={xCoords[idx]}
                y="206"
                textAnchor="middle"
                fill="#687185"
                fontSize="10"
                fontFamily="sans-serif"
              >
                {pt.date}
              </text>
            ))}
          </svg>
        </div>

        {/* Growth Insight */}
        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5 text-xs text-[#9AA3B5]">
          <Info className="w-4 h-4 text-[#6366F1] shrink-0" />
          <span>Your consistency is improving steadily. You are closing the gap with Sneha and Rohan by 14% this month!</span>
        </div>
      </div>
    </div>
  );
};
