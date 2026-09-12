import React from 'react';

export const ChatGPTLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`${className} rounded-xl bg-black border border-white/10 flex items-center justify-center p-2 shrink-0 shadow-sm`}>
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a9.96 9.96 0 0 0-6.86 2.76A10.02 10.02 0 0 0 2 12c0 2.22.73 4.28 1.95 5.95l-.95 3.5 3.63-.95A9.97 9.97 0 0 0 12 22a10 10 0 0 0 10-10A10 10 0 0 0 12 2Z" />
      <path d="M8.5 8.5a3 3 0 0 1 4.24 0L15 10.76" />
      <path d="M15.5 15.5a3 3 0 0 1-4.24 0L9 13.24" />
      <path d="M9.5 9.5 7.24 11a3 3 0 0 0 0 4.24L9.5 17.5" />
      <path d="M14.5 6.5 16.76 8a3 3 0 0 1 0 4.24L14.5 14.5" />
    </svg>
  </div>
);

export const ClaudeLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`${className} rounded-xl bg-[#2D1812] border border-[#D97706]/30 flex items-center justify-center p-1.5 shrink-0 shadow-sm`}>
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[#E0684B]">
      {/* Anthropic Claude Sunburst Star Icon */}
      <circle cx="12" cy="12" r="3" fill="#E0684B" />
      <line x1="12" y1="2" x2="12" y2="6" stroke="#E0684B" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="18" x2="12" y2="22" stroke="#E0684B" strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="12" x2="6" y2="12" stroke="#E0684B" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="12" x2="22" y2="12" stroke="#E0684B" strokeWidth="2" strokeLinecap="round" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" stroke="#E0684B" strokeWidth="2" strokeLinecap="round" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" stroke="#E0684B" strokeWidth="2" strokeLinecap="round" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" stroke="#E0684B" strokeWidth="2" strokeLinecap="round" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" stroke="#E0684B" strokeWidth="2" strokeLinecap="round" />
      <line x1="8.5" y1="3.5" x2="10" y2="6.5" stroke="#E0684B" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="14" y1="17.5" x2="15.5" y2="20.5" stroke="#E0684B" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="3.5" y1="15.5" x2="6.5" y2="14" stroke="#E0684B" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="17.5" y1="10" x2="20.5" y2="8.5" stroke="#E0684B" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  </div>
);

export const GeminiLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`${className} rounded-xl bg-[#0F1C34] border border-[#38BDF8]/30 flex items-center justify-center p-2 shrink-0 shadow-sm relative overflow-hidden`}>
    <div className="absolute inset-0 bg-gradient-to-tr from-[#1E40AF]/40 via-[#3B82F6]/30 to-[#818CF8]/40" />
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full relative z-10">
      <path
        d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
        fill="url(#geminiGradient)"
      />
      <defs>
        <linearGradient id="geminiGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="0.5" stopColor="#60A5FA" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

export const GoogleCalendarTile: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`${className} rounded-xl bg-[#131E31] border border-white/10 flex items-center justify-center p-1.5 shrink-0 shadow-sm`}>
    <svg viewBox="0 0 48 48" className="w-full h-full">
      {/* Calendar back frame */}
      <rect x="6" y="8" width="36" height="34" rx="6" fill="#FFFFFF" />
      {/* Calendar top bar */}
      <path d="M6 14C6 10.6863 8.68629 8 12 8H36C39.3137 8 42 10.6863 42 14V17H6V14Z" fill="#EA4335" />
      {/* Side blue & yellow stripes */}
      <path d="M6 17H12V42H10C7.79086 42 6 40.2091 6 38V17Z" fill="#4285F4" />
      <path d="M36 17H42V38C42 40.2091 40.2091 42 38 42H36V17Z" fill="#FBBC04" />
      <path d="M12 36H36V42H12V36Z" fill="#34A853" />
      {/* Number 31 text */}
      <text x="24" y="32" textAnchor="middle" fill="#1F2937" fontSize="14" fontWeight="bold" fontFamily="sans-serif">
        31
      </text>
    </svg>
  </div>
);
