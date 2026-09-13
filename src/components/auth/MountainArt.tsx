import React from 'react';

interface MountainArtProps {
  className?: string;
  variant?: 'split' | 'hero';
}

export const MountainArt: React.FC<MountainArtProps> = ({ className = '', variant = 'split' }) => {
  return (
    <div className={`relative overflow-hidden select-none pointer-events-none ${className}`}>
      {/* Twilight Sky Radial Gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#171338] via-[#1E174A] to-[#0D1024]"
      />

      {/* Atmospheric Star Dust */}
      <svg className="absolute inset-0 w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15%" cy="20%" r="1.2" fill="#E0E7FF" opacity="0.8" />
        <circle cx="32%" cy="14%" r="1" fill="#C7D2FE" opacity="0.7" />
        <circle cx="48%" cy="28%" r="1.5" fill="#FFFFFF" opacity="0.9" />
        <circle cx="65%" cy="12%" r="1.2" fill="#E0E7FF" opacity="0.85" />
        <circle cx="82%" cy="22%" r="1" fill="#C7D2FE" opacity="0.6" />
        <circle cx="24%" cy="42%" r="0.8" fill="#FFFFFF" opacity="0.5" />
        <circle cx="75%" cy="38%" r="1.4" fill="#E0E7FF" opacity="0.75" />
        <circle cx="90%" cy="16%" r="1.1" fill="#FFFFFF" opacity="0.8" />
      </svg>

      {/* Radiant Crescent Moon with Warm Glow */}
      <div className="absolute top-10 right-12 md:top-14 md:right-16">
        <div className="relative w-16 h-16 md:w-20 md:h-20">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#F5D061] to-[#E59837] blur-[18px] opacity-40" />
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(245,208,97,0.5)]">
            <defs>
              <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF2B2" />
                <stop offset="50%" stopColor="#FBD38D" />
                <stop offset="100%" stopColor="#ED8936" />
              </linearGradient>
            </defs>
            <path
              d="M 50 10 A 40 40 0 1 0 90 50 A 30 30 0 1 1 50 10 Z"
              fill="url(#moonGrad)"
            />
          </svg>
        </div>
      </div>

      {/* Layer 1: Distant Purple Mountain Ridge */}
      <svg
        className="absolute bottom-0 left-0 w-full h-3/5 text-[#2E205E] opacity-90"
        viewBox="0 0 800 400"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0 400 L0 250 L120 180 L230 240 L350 150 L470 230 L590 140 L720 220 L800 170 L800 400 Z" />
      </svg>

      {/* Layer 2: Midground Indigo Mountain Ridge */}
      <svg
        className="absolute bottom-0 left-0 w-full h-1/2 text-[#1C1642] opacity-95"
        viewBox="0 0 800 400"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0 400 L0 280 L90 220 L190 270 L300 200 L420 260 L540 190 L670 260 L800 210 L800 400 Z" />
      </svg>

      {/* Layer 3: Foreground Dark Midnight Mountain & Silhouette */}
      <svg
        className="absolute bottom-0 left-0 w-full h-2/5 text-[#0C0F22]"
        viewBox="0 0 800 400"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0 400 L0 320 L140 260 L280 330 L450 240 L600 320 L720 270 L800 300 L800 400 Z" />
      </svg>

      {/* Hiker with Trekking Pole on Peak */}
      <div className="absolute bottom-16 left-1/4 md:bottom-20 md:left-1/3 transform -translate-x-1/2">
        <svg className="w-8 h-8 md:w-10 md:h-10 text-[#090C1A]" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="4" r="2" />
          <path d="M15 8h-4l-2 5 2.5 1-1 6h2l1-4.5 2-2 1.5 6.5h2l-2-8-2-1.5z" />
          {/* Trekking pole */}
          <line x1="8" y1="9" x2="6.5" y2="21" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Subtle Mist/Haze at Base */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0C0F22] to-transparent opacity-80" />
    </div>
  );
};
