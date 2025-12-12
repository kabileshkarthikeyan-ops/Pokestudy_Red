import { Star } from 'lucide-react';
import { OwnedPokemon, PokemonSpecies } from '@/types/pokemon';
import { getPokemonById } from '@/data/pokemonDatabase';
import { PokemonSprite } from './PokemonSprite';
import { TypeBadge } from './TypeBadge';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface PokemonCardProps {
  pokemon: OwnedPokemon;
  onClick?: () => void;
  onFavorite?: () => void;
  selected?: boolean;
  showLevel?: boolean;
}

export const PokemonCard = ({ 
  pokemon, 
  onClick, 
  onFavorite,
  selected = false,
  showLevel = true 
}: PokemonCardProps) => {
  const species = getPokemonById(pokemon.speciesId);
  
  if (!species) return null;

  return (
    <Card
      className={cn(
        'relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden group',
        selected && 'ring-2 ring-primary shadow-lg'
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        {/* Favorite Star */}
        {onFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
            }}
            className="absolute top-2 right-2 z-10 p-1 rounded-full hover:bg-primary/10 transition-colors"
          >
            <Star
              className={cn(
                'w-5 h-5 transition-colors',
                pokemon.isFavorite 
                  ? 'fill-primary text-primary' 
                  : 'text-muted-foreground hover:text-primary'
              )}
            />
          </button>
        )}

        {/* Pokemon Number */}
        <span className="absolute top-2 left-2 text-xs font-mono text-muted-foreground">
          #{species.id.toString().padStart(3, '0')}
        </span>

        {/* Sprite */}
        <div className="flex justify-center py-2">
          <PokemonSprite
            pokemonId={species.id}
            name={species.name}
            className="w-20 h-20"
            animate={selected}
          />
        </div>

        {/* Name */}
        <h3 className="text-center font-bold text-sm truncate mb-1">
          {pokemon.nickname || species.name}
        </h3>
        {pokemon.nickname && (
          <p className="text-center text-[10px] text-muted-foreground truncate -mt-1 mb-1">
            ({species.name})
          </p>
        )}

        {/* Types */}
        <div className="flex justify-center gap-1 mb-2">
          {species.types.map(type => (
            <TypeBadge key={type} type={type} size="sm" />
          ))}
        </div>

        {/* Level */}
        {showLevel && (
          <div className="text-center text-xs text-muted-foreground">
            Lv. {pokemon.level}
          </div>
        )}

        {/* Evolution indicator */}
        {species.evolvesTo && species.evolvesTo.length > 0 && (
          <div className="absolute bottom-1 right-1">
            <span className="text-xs text-accent font-medium">⬆️</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
