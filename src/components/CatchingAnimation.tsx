import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CatchingAnimationProps {
  stage: 'throwing' | 'shaking' | 'caught' | 'idle';
  onComplete?: () => void;
}

export const CatchingAnimation = ({ stage, onComplete }: CatchingAnimationProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number; color: string }>>([]);
  const [stars, setStars] = useState<Array<{ id: number; angle: number; delay: number; distance: number }>>([]);
  const [rings, setRings] = useState<Array<{ id: number; delay: number }>>([]);

  useEffect(() => {
    if (stage === 'caught') {
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 250,
        y: (Math.random() - 0.5) * 250,
        delay: Math.random() * 0.4,
        size: Math.random() * 6 + 2,
        color: ['hsl(45, 93%, 58%)', 'hsl(25, 85%, 55%)', 'hsl(340, 80%, 60%)', 'hsl(190, 80%, 50%)', 'hsl(0, 0%, 100%)'][Math.floor(Math.random() * 5)],
      }));
      setParticles(newParticles);

      const newStars = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        angle: i * 30 + Math.random() * 15,
        delay: Math.random() * 0.3,
        distance: 60 + Math.random() * 50,
      }));
      setStars(newStars);

      const newRings = Array.from({ length: 3 }, (_, i) => ({
        id: i,
        delay: i * 0.2,
      }));
      setRings(newRings);

      const timer = setTimeout(() => onComplete?.(), 1500);
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Shockwave rings on catch */}
      {stage === 'caught' && rings.map((ring) => (
        <div
          key={ring.id}
          className="absolute rounded-full border-2 border-primary/60 animate-catch-ring"
          style={{
            width: 40,
            height: 40,
            animationDelay: `${ring.delay}s`,
          }}
        />
      ))}

      {/* Pokeball */}
      <div
        className={cn(
          'relative w-28 h-28 transition-all duration-500',
          stage === 'throwing' && 'animate-pokeball-throw',
          stage === 'shaking' && 'animate-pokeball-shake',
          stage === 'caught' && 'animate-pokeball-success'
        )}
      >
        {/* Top half (red) */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-red-500 to-red-600 rounded-t-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent" />
          <div className="absolute top-1 left-2 w-6 h-3 bg-white/40 rounded-full blur-sm" />
        </div>

        {/* Bottom half (white) */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-b from-gray-100 to-white rounded-b-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent" />
        </div>

        {/* Center line */}
        <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-800 -translate-y-1/2" />

        {/* Center button */}
        <div className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border-4 border-gray-800 transition-all z-10',
          stage === 'caught' && 'animate-pulse bg-primary shadow-[0_0_20px_hsl(45,93%,58%)]',
          stage === 'shaking' && 'bg-red-200'
        )}>
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white to-gray-200" />
        </div>

        {/* Glow effect when caught */}
        {stage === 'caught' && (
          <>
            <div className="absolute inset-0 rounded-full animate-ping bg-primary/40" />
            <div className="absolute -inset-4 rounded-full bg-primary/20 animate-pulse" />
          </>
        )}
      </div>

      {/* Sparkle particles on catch */}
      {stage === 'caught' && particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-particle-explode"
          style={{
            '--tx': `${particle.x}px`,
            '--ty': `${particle.y}px`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Stars radiating out */}
      {stage === 'caught' && stars.map((star) => (
        <div
          key={star.id}
          className="absolute text-lg animate-star-burst"
          style={{
            '--angle': `${star.angle}deg`,
            '--distance': `${star.distance}px`,
            animationDelay: `${star.delay}s`,
          } as React.CSSProperties}
        >
          ✨
        </div>
      ))}

      {/* Shake indicators with wobble lines */}
      {stage === 'shaking' && (
        <>
          <div className="absolute -left-4 top-1/3 text-xl animate-shake-indicator">💫</div>
          <div className="absolute -right-4 top-1/2 text-xl animate-shake-indicator" style={{ animationDelay: '0.15s' }}>💫</div>
          <div className="absolute -left-3 top-2/3 text-lg animate-shake-indicator" style={{ animationDelay: '0.3s' }}>💫</div>
          {/* Wobble lines */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 bg-foreground/20 rounded-full animate-shake-line"
              style={{
                height: 8 + Math.random() * 12,
                left: `${20 + i * 12}%`,
                bottom: -8,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </>
      )}

      {/* Throw trail */}
      {stage === 'throwing' && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 opacity-60">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-foreground/30 mx-auto mb-1 animate-fade-trail"
              style={{
                animationDelay: `${i * 0.08}s`,
                transform: `scale(${1 - i * 0.15})`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
