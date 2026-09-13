import React, { useEffect, useState } from 'react';

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  shape: 'star' | 'circle' | 'spark';
  opacity: number;
}

interface ParticleBurstProps {
  x: number;
  y: number;
  onComplete?: () => void;
  count?: number;
  colors?: string[];
}

export const ParticleBurst: React.FC<ParticleBurstProps> = ({
  x,
  y,
  onComplete,
  count = 24,
  colors = ['#F59E0B', '#FBBF24', '#6366F1', '#A855F7', '#EC4899', '#10B981'],
}) => {
  const [particles, setParticles] = useState<Particle[]>(() => {
    const arr: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 5 + 2.5;
      arr.push({
        id: i,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5, // Slight upward boost
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 15,
        shape: i % 3 === 0 ? 'star' : i % 3 === 1 ? 'spark' : 'circle',
        opacity: 1,
      });
    }
    return arr;
  });

  useEffect(() => {
    let frameId: number;
    let elapsed = 0;
    const duration = 45; // ~750ms at 60fps

    const loop = () => {
      elapsed++;
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy + 0.18, // Gravity
          vx: p.vx * 0.95, // Air resistance
          vy: p.vy * 0.95,
          rotation: p.rotation + p.vRot,
          opacity: Math.max(0, 1 - elapsed / duration),
        }))
      );

      if (elapsed < duration) {
        frameId = requestAnimationFrame(loop);
      } else {
        onComplete?.();
      }
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [onComplete]);

  return (
    <div
      className="pointer-events-none fixed z-50 overflow-visible"
      style={{ left: x, top: y }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`,
            opacity: p.opacity,
            width: p.size,
            height: p.size,
          }}
        >
          {p.shape === 'star' ? (
            <svg
              viewBox="0 0 24 24"
              width={p.size * 1.5}
              height={p.size * 1.5}
              fill={p.color}
              className="drop-shadow-xs"
            >
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
          ) : p.shape === 'spark' ? (
            <div
              style={{
                width: p.size * 1.2,
                height: p.size * 0.5,
                backgroundColor: p.color,
                borderRadius: '9999px',
                boxShadow: `0 0 6px ${p.color}`,
              }}
            />
          ) : (
            <div
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: '50%',
                boxShadow: `0 0 5px ${p.color}`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export interface FloatingTextProps {
  x: number;
  y: number;
  text: string;
  color?: string;
  onComplete?: () => void;
}

export const FloatingText: React.FC<FloatingTextProps> = ({
  x,
  y,
  text,
  color = '#F59E0B',
  onComplete,
}) => {
  useEffect(() => {
    const t = setTimeout(() => {
      onComplete?.();
    }, 1200);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div
      className="pointer-events-none fixed z-50 select-none animate-in fade-in zoom-in-75 duration-200"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -100%)',
        animation: 'floatingXpUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div
        className="px-2.5 py-1 rounded-full text-xs sm:text-sm font-black tracking-wide text-white shadow-lg border border-white/20 flex items-center gap-1 backdrop-blur-xs"
        style={{
          background: `linear-gradient(135deg, ${color}, #4F46E5)`,
          boxShadow: `0 8px 20px -4px ${color}80`,
        }}
      >
        <span>★</span>
        <span>{text}</span>
      </div>
      <style>{`
        @keyframes floatingXpUp {
          0% {
            transform: translate(-50%, 0) scale(0.7);
            opacity: 0;
          }
          15% {
            transform: translate(-50%, -16px) scale(1.15);
            opacity: 1;
          }
          30% {
            transform: translate(-50%, -24px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -64px) scale(0.9);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
