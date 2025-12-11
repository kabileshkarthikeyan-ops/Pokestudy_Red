import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PokemonSpriteProps {
  pokemonId: number;
  name: string;
  className?: string;
  isLocked?: boolean;
  isSilhouette?: boolean;
  animate?: boolean;
}

export const PokemonSprite = ({ 
  pokemonId, 
  name, 
  className, 
  isLocked = false,
  isSilhouette = false,
  animate = false 
}: PokemonSpriteProps) => {
  const [hasError, setHasError] = useState(false);
  
  // Try official Pokemon sprite from PokeAPI
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
  const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

  if (isLocked) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-muted rounded-lg',
          className
        )}
      >
        <span className="text-6xl opacity-30">?</span>
      </div>
    );
  }

  return (
    <img
      src={hasError ? fallbackUrl : spriteUrl}
      alt={name}
      className={cn(
        'object-contain pixelated',
        animate && 'pokemon-bounce',
        isSilhouette && 'brightness-0 opacity-60',
        className
      )}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};
