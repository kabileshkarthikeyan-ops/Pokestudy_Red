import { PokemonType } from '@/types/pokemon';
import { cn } from '@/lib/utils';

interface TypeBadgeProps {
  type: PokemonType;
  size?: 'sm' | 'md';
}

const typeStyles: Record<PokemonType, string> = {
  normal: 'bg-pokemon-normal',
  fire: 'bg-pokemon-fire',
  water: 'bg-pokemon-water',
  electric: 'bg-pokemon-electric text-foreground',
  grass: 'bg-pokemon-grass',
  ice: 'bg-pokemon-ice text-foreground',
  fighting: 'bg-pokemon-fighting',
  poison: 'bg-pokemon-poison',
  ground: 'bg-pokemon-ground',
  flying: 'bg-pokemon-flying',
  psychic: 'bg-pokemon-psychic',
  bug: 'bg-pokemon-bug',
  rock: 'bg-pokemon-rock',
  ghost: 'bg-pokemon-ghost',
  dragon: 'bg-pokemon-dragon',
  dark: 'bg-pokemon-dark',
  steel: 'bg-pokemon-steel',
  fairy: 'bg-pokemon-fairy',
};

export const TypeBadge = ({ type, size = 'md' }: TypeBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold capitalize text-white',
        typeStyles[type],
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      {type}
    </span>
  );
};
