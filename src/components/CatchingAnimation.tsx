import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CatchingAnimationProps {
  stage: 'throwing' | 'shaking' | 'caught' | 'idle';
  onComplete?: () => void;
}

export const CatchingAnimation = ({ stage, onComplete }: CatchingAnimationProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [stars, setStars] = useState<Array<{ id: number; angle: number; delay: number }>>([]);

  useEffect(() => {
    if (stage === 'caught') {
      // Create explosion particles
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        delay: Math.random() * 0.3,
      }));
      setParticles(newParticles);

      // Create stars
      const newStars = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        angle: (i * 45) + Math.random() * 20,
        delay: Math.random() * 0.2,
      }));
      setStars(newStars);

      const timer = setTimeout(() => {
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      {/* Pokeball */}
      <div
        className={cn(
          'relative w-24 h-24 transition-all duration-500',
          stage === 'throwing' && 'animate-pokeball-throw',
          stage === 'shaking' && 'animate-pokeball-shake',
          stage === 'caught' && 'animate-pokeball-success'
        )}
      >
        {/* Top half (red) */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-red-500 to-red-600 rounded-t-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent" />
        </div>
        
        {/* Bottom half (white) */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-b from-gray-100 to-white rounded-b-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent" />
        </div>
        
        {/* Center line */}
        <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-800 -translate-y-1/2" />
        
        {/* Center button */}
        <div className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-4 border-gray-800 transition-all',
          stage === 'caught' && 'animate-pulse bg-yellow-300'
        )}>
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white to-gray-200" />
        </div>

        {/* Glow effect when caught */}
        {stage === 'caught' && (
          <div className="absolute inset-0 rounded-full animate-ping bg-yellow-400/50" />
        )}
      </div>

      {/* Sparkle particles on catch */}
      {stage === 'caught' && particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full bg-yellow-400 animate-particle-explode"
          style={{
            '--tx': `${particle.x}px`,
            '--ty': `${particle.y}px`,
            animationDelay: `${particle.delay}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Stars radiating out */}
      {stage === 'caught' && stars.map((star) => (
        <div
          key={star.id}
          className="absolute text-2xl animate-star-burst"
          style={{
            '--angle': `${star.angle}deg`,
            animationDelay: `${star.delay}s`,
          } as React.CSSProperties}
        >
          ✨
        </div>
      ))}

      {/* Shake indicators */}
      {stage === 'shaking' && (
        <>
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-xl animate-shake-indicator">💫</div>
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-xl animate-shake-indicator" style={{ animationDelay: '0.2s' }}>💫</div>
        </>
      )}
    </div>
  );
};
