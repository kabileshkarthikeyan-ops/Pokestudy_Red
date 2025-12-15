import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useGameState } from '@/hooks/useGameState';

interface PokemonSpriteProps {
  pokemonId: number;
  name: string;
  className?: string;
  isLocked?: boolean;
  isSilhouette?: boolean;
  animate?: boolean;
  sizeOverride?: 'small' | 'medium' | 'large' | 'xlarge';
}

// Size multipliers based on settings
const SIZE_CLASSES = {
  small: 'scale-75',
  medium: 'scale-100',
  large: 'scale-125',
  xlarge: 'scale-150',
};

export const PokemonSprite = ({ 
  pokemonId, 
  name, 
  className, 
  isLocked = false,
  isSilhouette = false,
  animate = false,
  sizeOverride 
}: PokemonSpriteProps) => {
  const [hasError, setHasError] = useState(false);
  const { state } = useGameState();
  
  // Use local sprites from public/sprites folder
  const localSpritePath = `/sprites/${pokemonId}.png`;
  // Fallback to online if local fails (for development/testing)
  const onlineSpritePath = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
  
  const spriteUrl = hasError ? onlineSpritePath : localSpritePath;
  
  const spriteSize = sizeOverride || state.settings.spriteSize || 'medium';
  const sizeClass = SIZE_CLASSES[spriteSize];

  if (isLocked) {
    return (
      <img
        src={spriteUrl}
        alt="Unknown Pokemon"
        className={cn(
          'object-contain brightness-0 opacity-50 transition-transform',
          sizeClass,
          className
        )}
        style={{ imageRendering: 'pixelated' }}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    );
  }

  return (
    <img
      src={spriteUrl}
      alt={name}
      className={cn(
        'object-contain transition-transform',
        animate && 'pokemon-bounce',
        isSilhouette && 'brightness-0 opacity-70',
        sizeClass,
        className
      )}
      style={{ imageRendering: 'pixelated' }}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};
