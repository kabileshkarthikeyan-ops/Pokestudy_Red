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
    // Show silhouette of actual sprite for unknown Pokemon
    return (
      <img
        src={spriteUrl}
        alt="Unknown Pokemon"
        className={cn(
          'object-contain brightness-0 opacity-50',
          className
        )}
        style={{ imageRendering: 'pixelated' }}
        onError={() => {}}
        loading="lazy"
      />
    );
  }

  return (
    <img
      src={hasError ? fallbackUrl : spriteUrl}
      alt={name}
      className={cn(
        'object-contain',
        animate && 'pokemon-bounce',
        isSilhouette && 'brightness-0 opacity-70',
        className
      )}
      style={{ imageRendering: 'pixelated' }}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};
