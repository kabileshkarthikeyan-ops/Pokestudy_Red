import { useState, useEffect } from 'react';
import { PokemonSprite } from './PokemonSprite';
import { cn } from '@/lib/utils';

interface EvolutionAnimationProps {
  fromPokemonId: number;
  toPokemonId: number;
  fromName: string;
  toName: string;
  stage: 'idle' | 'glowing' | 'transforming' | 'complete';
  onComplete?: () => void;
}

export const EvolutionAnimation = ({
  fromPokemonId,
  toPokemonId,
  fromName,
  toName,
  stage,
  onComplete,
}: EvolutionAnimationProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; size: number }>>([]);

  useEffect(() => {
    if (stage === 'glowing' || stage === 'transforming') {
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        delay: Math.random() * 2,
        size: Math.random() * 8 + 4,
      }));
      setParticles(newParticles);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'complete') {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  return (
    <div className="relative w-64 h-64 flex items-center justify-center overflow-hidden">
      {/* Background glow */}
      <div
        className={cn(
          'absolute inset-0 rounded-full transition-all duration-1000',
          stage === 'glowing' && 'bg-gradient-radial from-blue-400/40 via-cyan-300/30 to-transparent animate-pulse-slow',
          stage === 'transforming' && 'bg-gradient-radial from-white/80 via-blue-200/60 to-transparent animate-evolution-flash',
          stage === 'complete' && 'bg-gradient-radial from-yellow-400/50 via-orange-300/30 to-transparent'
        )}
      />

      {/* Rising particles */}
      {(stage === 'glowing' || stage === 'transforming') && particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bottom-0 rounded-full bg-gradient-to-t from-blue-400 to-cyan-200 animate-evolution-particle"
          style={{
            left: `calc(50% + ${particle.x}px)`,
            width: particle.size,
            height: particle.size,
            animationDelay: `${particle.delay}s`,
            animationDuration: '2s',
          }}
        />
      ))}

      {/* Original Pokemon */}
      <div
        className={cn(
          'absolute transition-all duration-1000',
          stage === 'idle' && 'opacity-100 scale-100',
          stage === 'glowing' && 'opacity-100 scale-110 animate-evolution-glow filter brightness-150',
          stage === 'transforming' && 'opacity-0 scale-125 filter brightness-200 blur-sm',
          stage === 'complete' && 'opacity-0 scale-150'
        )}
      >
        <PokemonSprite
          pokemonId={fromPokemonId}
          name={fromName}
          className="w-32 h-32"
        />
      </div>

      {/* Evolved Pokemon */}
      <div
        className={cn(
          'absolute transition-all duration-1000',
          stage === 'idle' && 'opacity-0 scale-50',
          stage === 'glowing' && 'opacity-0 scale-75',
          stage === 'transforming' && 'opacity-50 scale-90 filter brightness-150',
          stage === 'complete' && 'opacity-100 scale-100 animate-evolution-reveal'
        )}
      >
        <PokemonSprite
          pokemonId={toPokemonId}
          name={toName}
          className="w-32 h-32"
          animate
        />
      </div>

      {/* Sparkle ring */}
      {stage === 'transforming' && (
        <div className="absolute inset-0 animate-spin-slow">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 text-yellow-300"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 30}deg) translateY(-100px)`,
              }}
            >
              ✦
            </div>
          ))}
        </div>
      )}

      {/* "What?" text effect */}
      {stage === 'glowing' && (
        <div className="absolute bottom-4 text-center animate-bounce">
          <span className="text-lg font-bold text-blue-600 drop-shadow-lg">What?</span>
        </div>
      )}

      {/* Congratulations burst */}
      {stage === 'complete' && (
        <div className="absolute -bottom-8 text-center animate-fade-in">
          <span className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
            Congratulations!
          </span>
        </div>
      )}
    </div>
  );
};
