import React from 'react';

interface CoachRobotAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CoachRobotAvatar: React.FC<CoachRobotAvatarProps> = ({
  size = 'md',
  className = '',
}) => {
  const dimensions = {
    sm: { width: 36, height: 36, eyeW: 2.5, eyeH: 7, eyeGap: 6 },
    md: { width: 64, height: 64, eyeW: 4, eyeH: 14, eyeGap: 10 },
    lg: { width: 110, height: 110, eyeW: 7, eyeH: 22, eyeGap: 16 },
  }[size];

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      {/* Outer Cyan / Blue Soft Ambient Glow */}
      <div 
        className="absolute inset-0 rounded-full blur-lg opacity-40 bg-gradient-to-tr from-[#38BDF8] via-[#818CF8] to-[#6366F1]"
        style={{ transform: 'scale(1.15)' }}
      />

      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
      >
        <defs>
          {/* Sphere Body Gradient (Dark Metallic / Deep Slate Navy) */}
          <radialGradient id="sphereGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#2A3756" />
            <stop offset="35%" stopColor="#172033" />
            <stop offset="85%" stopColor="#0B101D" />
            <stop offset="100%" stopColor="#050811" />
          </radialGradient>

          {/* Cyan/Blue Rim Light */}
          <radialGradient id="rimLight" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="transparent" />
            <stop offset="96%" stopColor="#60A5FA" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.9" />
          </radialGradient>

          {/* Eye Glow Gradient */}
          <linearGradient id="eyeGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>

          {/* Top highlight specular reflection */}
          <linearGradient id="specular" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer sphere body */}
        <circle cx="50" cy="50" r="46" fill="url(#sphereGrad)" />

        {/* Cyan rim glow ring */}
        <circle cx="50" cy="50" r="46" fill="url(#rimLight)" />

        {/* Specular curved reflection on top */}
        <ellipse cx="50" cy="22" rx="26" ry="12" fill="url(#specular)" />

        {/* Visor Area */}
        <ellipse cx="50" cy="52" rx="34" ry="24" fill="#090E18" opacity="0.9" />

        {/* Left Eye Capsule */}
        <rect
          x="39"
          y="42"
          width="7"
          height="20"
          rx="3.5"
          fill="url(#eyeGlow)"
          className="drop-shadow-[0_0_6px_rgba(96,165,250,0.8)]"
        />

        {/* Right Eye Capsule */}
        <rect
          x="54"
          y="42"
          width="7"
          height="20"
          rx="3.5"
          fill="url(#eyeGlow)"
          className="drop-shadow-[0_0_6px_rgba(96,165,250,0.8)]"
        />
      </svg>
    </div>
  );
};
