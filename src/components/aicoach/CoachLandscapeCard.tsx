import React from 'react';

interface CoachLandscapeCardProps {
  quote?: string;
  author?: string;
}

export const CoachLandscapeCard: React.FC<CoachLandscapeCardProps> = ({
  quote = "You're not alone in this. Keep going.",
  author = "— LifeRPG",
}) => {
  return (
    <div
      id="ai-coach-motivational-landscape"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#182035] via-[#141B2D] to-[#0D1322] border border-white/8 p-5 flex flex-col justify-between h-48 sm:h-52 shadow-md select-none group"
    >
      {/* Top Quote Content */}
      <div className="relative z-10">
        <p className="text-sm font-semibold text-white tracking-tight leading-snug">
          {quote}
        </p>
        <span className="text-[10px] text-[#94A3B8] font-medium tracking-wide uppercase mt-1 block">
          {author}
        </span>
      </div>

      {/* Vector Twilight Mountain Sunset Illustration */}
      <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none overflow-hidden">
        {/* Glowing Sun */}
        <div className="absolute bottom-12 right-12 w-10 h-10 rounded-full bg-gradient-to-t from-[#F97316] to-[#FDE047] opacity-90 blur-[1px] shadow-[0_0_24px_rgba(249,115,22,0.8)]" />

        {/* Ambient Sky Horizon Glow */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#E11D48]/20 via-[#F97316]/15 to-transparent" />

        {/* Distant Mountain Peak */}
        <svg
          className="absolute bottom-0 w-full h-24"
          viewBox="0 0 300 100"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0 100 L60 45 L120 70 L190 25 L250 65 L300 35 L300 100 Z"
            fill="#3B4874"
            opacity="0.7"
          />
          <path
            d="M20 100 L90 55 L160 80 L230 40 L300 75 L300 100 Z"
            fill="#232C4B"
            opacity="0.9"
          />
          <path
            d="M-10 100 L40 70 L110 90 L180 60 L260 85 L310 100 Z"
            fill="#141B2D"
          />
        </svg>

        {/* Foreground Pine Tree Silhouettes */}
        <svg className="absolute bottom-0 left-4 w-16 h-10" viewBox="0 0 60 40" fill="#0A0F1D">
          <polygon points="15,5 8,30 22,30" />
          <polygon points="28,3 19,35 37,35" />
          <polygon points="42,8 35,32 49,32" />
        </svg>
      </div>
    </div>
  );
};
