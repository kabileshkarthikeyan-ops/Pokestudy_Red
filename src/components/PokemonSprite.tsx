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

const SIZE_CLASSES = {
  small: 'scale-75',
  medium: 'scale-100',
  large: 'scale-125',
  xlarge: 'scale-150',
};

// Local sprites first, then PokeAPI CDN fallback for browser preview
const getLocalUrl = (id: number) => `/sprites/${id}.png`;
const getCdnUrl = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

export const PokemonSprite = ({
  pokemonId,
  name,
  className,
  isLocked = false,
  isSilhouette = false,
  animate = false,
  sizeOverride,
}: PokemonSpriteProps) => {
  const { state } = useGameState();
  const [src, setSrc] = useState(getLocalUrl(pokemonId));
  const [triedCdn, setTriedCdn] = useState(false);

  const spriteSize = sizeOverride || state.settings.spriteSize || 'medium';
  const sizeClass = SIZE_CLASSES[spriteSize];

  const handleError = () => {
    if (!triedCdn) {
      setTriedCdn(true);
      setSrc(getCdnUrl(pokemonId));
    }
  };

  if (isLocked) {
    return (
      <img
        src={src}
        alt="Unknown Pokemon"
        className={cn(
          'object-contain brightness-0 opacity-50 transition-transform',
          sizeClass,
          className
        )}
        style={{ imageRendering: 'pixelated' }}
        loading="lazy"
        onError={handleError}
      />
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={cn(
        'object-contain transition-transform',
        animate && 'pokemon-bounce',
        isSilhouette && 'brightness-0 opacity-70',
        sizeClass,
        className
      )}
      style={{ imageRendering: 'pixelated' }}
      loading="lazy"
      onError={handleError}
    />
  );
};
