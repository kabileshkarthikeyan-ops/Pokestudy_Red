import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PokemonSpriteProps {
  pokemonId: number;
  name: string;
  className?: string;
  isLocked?: boolean;
  animate?: boolean;
}

export const PokemonSprite = ({ 
  pokemonId, 
  name, 
  className, 
  isLocked = false,
  animate = false 
}: PokemonSpriteProps) => {
  const [hasError, setHasError] = useState(false);
  
  // Format ID with leading zeros (001, 002, etc.)
  const formattedId = pokemonId.toString().padStart(3, '0');
  
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
        className
      )}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};
