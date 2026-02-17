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
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; size: number; speed: number }>>([]);
  const [dnaStrands, setDnaStrands] = useState<Array<{ id: number; offset: number; delay: number }>>([]);

  useEffect(() => {
    if (stage === 'glowing' || stage === 'transforming') {
      const newParticles = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 120 - 60,
        delay: Math.random() * 2,
        size: Math.random() * 8 + 3,
        speed: 1.5 + Math.random() * 1.5,
      }));
      setParticles(newParticles);

      const newStrands = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        offset: (i / 8) * 360,
        delay: i * 0.15,
      }));
      setDnaStrands(newStrands);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'complete') {
      const timer = setTimeout(() => onComplete?.(), 500);
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  return (
    <div className="relative w-64 h-64 flex items-center justify-center overflow-hidden">
      {/* Background glow layers */}
      <div
        className={cn(
          'absolute inset-0 rounded-full transition-all duration-1000',
          stage === 'glowing' && 'bg-gradient-radial from-blue-400/40 via-cyan-300/20 to-transparent animate-pulse-slow',
          stage === 'transforming' && 'bg-gradient-radial from-white/90 via-blue-200/60 to-transparent animate-evolution-flash',
          stage === 'complete' && 'bg-gradient-radial from-primary/50 via-accent/30 to-transparent'
        )}
      />

      {/* Outer energy ring */}
      {stage === 'transforming' && (
        <div className="absolute inset-2 rounded-full border-4 border-blue-300/50 animate-evolution-ring" />
      )}

      {/* Rising energy particles */}
      {(stage === 'glowing' || stage === 'transforming') && particles.map((particle) => (
        <div
          key={particle.id}
          className={cn(
            'absolute bottom-0 rounded-full animate-evolution-particle',
            stage === 'glowing' ? 'bg-gradient-to-t from-blue-400 to-cyan-200' : 'bg-gradient-to-t from-white to-blue-100'
          )}
          style={{
            left: `calc(50% + ${particle.x}px)`,
            width: particle.size,
            height: particle.size,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.speed}s`,
          }}
        />
      ))}

      {/* DNA-like spiral strands during transform */}
      {stage === 'transforming' && dnaStrands.map((strand) => (
        <div
          key={strand.id}
          className="absolute w-2 h-2 rounded-full bg-cyan-300 animate-dna-orbit"
          style={{
            '--orbit-offset': `${strand.offset}deg`,
            animationDelay: `${strand.delay}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Original Pokemon */}
      <div
        className={cn(
          'absolute transition-all duration-1000',
          stage === 'idle' && 'opacity-100 scale-100',
          stage === 'glowing' && 'opacity-100 scale-110 animate-evolution-glow filter brightness-150',
          stage === 'transforming' && 'opacity-0 scale-50 filter brightness-200 blur-md',
          stage === 'complete' && 'opacity-0 scale-0'
        )}
      >
        <PokemonSprite pokemonId={fromPokemonId} name={fromName} className="w-32 h-32" />
      </div>

      {/* Evolved Pokemon */}
      <div
        className={cn(
          'absolute transition-all duration-1000',
          stage === 'idle' && 'opacity-0 scale-0',
          stage === 'glowing' && 'opacity-0 scale-50',
          stage === 'transforming' && 'opacity-40 scale-75 filter brightness-200 blur-sm',
          stage === 'complete' && 'opacity-100 scale-100 animate-evolution-reveal'
        )}
      >
        <PokemonSprite pokemonId={toPokemonId} name={toName} className="w-32 h-32" animate />
      </div>

      {/* Sparkle ring */}
      {stage === 'transforming' && (
        <div className="absolute inset-0 animate-spin-slow">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 22.5}deg) translateY(-${90 + (i % 2) * 15}px)`,
                opacity: 0.6 + (i % 3) * 0.15,
              }}
            />
          ))}
        </div>
      )}

      {/* Light beams during transformation */}
      {stage === 'transforming' && (
        <div className="absolute inset-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-1 h-40 origin-bottom bg-gradient-to-t from-white/60 to-transparent animate-light-beam"
              style={{
                transform: `rotate(${i * 60}deg) translateY(-50%)`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
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
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Congratulations!
          </span>
        </div>
      )}
    </div>
  );
};
