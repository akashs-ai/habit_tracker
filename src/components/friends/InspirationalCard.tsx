import React from 'react';

export const InspirationalCard: React.FC = () => {
  return (
    <div 
      id="friends-inspirational-card"
      className="relative rounded-2xl overflow-hidden border border-white/8 min-h-[140px] flex items-center justify-center p-6 shadow-lg group"
      style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
      }}
    >
      {/* Mountain Landscape Silhouette Background SVG */}
      <div className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-50 transition-opacity">
        <svg 
          className="w-full h-full object-cover" 
          viewBox="0 0 400 160" 
          preserveAspectRatio="none"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle starry / dusk sky glow */}
          <circle cx="200" cy="40" r="80" fill="#6366F1" fillOpacity="0.15" />
          
          {/* Distant mountains */}
          <path 
            d="M0 160 L60 90 L140 135 L220 70 L310 125 L400 65 L400 160 Z" 
            fill="#1E293B" 
            fillOpacity="0.7" 
          />
          
          {/* Foreground mountain ridge */}
          <path 
            d="M0 160 L90 105 L180 145 L270 95 L360 140 L400 120 L400 160 Z" 
            fill="#0F172A" 
            fillOpacity="0.9" 
          />
        </svg>
      </div>

      {/* Quote text overlay */}
      <div className="relative z-10 text-center max-w-xs sm:max-w-sm px-4">
        <p className="text-sm sm:text-base font-medium italic text-white/90 leading-relaxed tracking-wide font-serif">
          &ldquo;Good friends keep you accountable, not comfortable.&rdquo;
        </p>
      </div>
    </div>
  );
};
