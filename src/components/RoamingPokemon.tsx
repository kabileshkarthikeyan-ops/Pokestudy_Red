import { useState, useEffect, useCallback } from 'react';
import { PokemonSprite } from './PokemonSprite';
import { cn } from '@/lib/utils';

interface RoamingPokemonProps {
  pokemonId: number;
  name: string;
  containerRef: React.RefObject<HTMLDivElement>;
}

type Behavior = 'walking' | 'idle' | 'sleeping' | 'jumping' | 'curious';

const BEHAVIORS: Behavior[] = ['walking', 'idle', 'sleeping', 'jumping', 'curious'];
const BEHAVIOR_DURATIONS: Record<Behavior, number> = {
  walking: 3000,
  idle: 2000,
  sleeping: 4000,
  jumping: 1500,
  curious: 2500,
};

export const RoamingPokemon = ({ pokemonId, name, containerRef }: RoamingPokemonProps) => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [behavior, setBehavior] = useState<Behavior>('idle');
  const [showEmote, setShowEmote] = useState<string | null>(null);

  const pickNewBehavior = useCallback(() => {
    const newBehavior = BEHAVIORS[Math.floor(Math.random() * BEHAVIORS.length)];
    setBehavior(newBehavior);

    // Show emotes for certain behaviors
    if (newBehavior === 'sleeping') {
      setShowEmote('💤');
    } else if (newBehavior === 'curious') {
      setShowEmote('❓');
    } else if (newBehavior === 'jumping') {
      setShowEmote('✨');
    } else {
      setShowEmote(null);
    }

    // Schedule next behavior
    const duration = BEHAVIOR_DURATIONS[newBehavior];
    setTimeout(pickNewBehavior, duration);
  }, []);

  useEffect(() => {
    const timer = setTimeout(pickNewBehavior, 1000);
    return () => clearTimeout(timer);
  }, [pickNewBehavior]);

  useEffect(() => {
    if (behavior !== 'walking') return;

    const moveInterval = setInterval(() => {
      setPosition((prev) => {
        const speed = 2;
        let newX = prev.x + (direction === 'right' ? speed : -speed);
        let newDirection = direction;

        // Bounce off edges
        if (newX > 85) {
          newX = 85;
          newDirection = 'left';
          setDirection('left');
        } else if (newX < 5) {
          newX = 5;
          newDirection = 'right';
          setDirection('right');
        }

        // Random direction change
        if (Math.random() < 0.02) {
          newDirection = direction === 'left' ? 'right' : 'left';
          setDirection(newDirection);
        }

        return { ...prev, x: newX };
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [behavior, direction]);

  const getBehaviorClass = () => {
    switch (behavior) {
      case 'walking':
        return 'animate-roaming-walk';
      case 'jumping':
        return 'animate-roaming-jump';
      case 'sleeping':
        return 'animate-roaming-sleep opacity-80';
      case 'curious':
        return 'animate-roaming-curious';
      default:
        return 'animate-roaming-idle';
    }
  };

  return (
    <div
      className="absolute transition-all duration-300 ease-linear"
      style={{
        left: `${position.x}%`,
        bottom: '10%',
        transform: `translateX(-50%) scaleX(${direction === 'left' ? -1 : 1})`,
      }}
    >
      {/* Emote bubble */}
      {showEmote && (
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl animate-float"
          style={{ transform: `translateX(-50%) scaleX(${direction === 'left' ? -1 : 1})` }}
        >
          {showEmote}
        </div>
      )}

      {/* Pokemon sprite */}
      <div className={cn('transition-transform', getBehaviorClass())}>
        <PokemonSprite
          pokemonId={pokemonId}
          name={name}
          className="w-16 h-16 drop-shadow-lg"
        />
      </div>

      {/* Shadow */}
      <div
        className={cn(
          'absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/20 rounded-full blur-sm',
          behavior === 'jumping' && 'scale-75'
        )}
      />
    </div>
  );
};
