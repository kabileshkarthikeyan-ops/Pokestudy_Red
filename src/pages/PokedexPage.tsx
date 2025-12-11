import { useState, useMemo } from 'react';
import { BookOpen, Search, Check } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useGameState } from '@/hooks/useGameState';
import { POKEMON_DATABASE, getPokemonById, getEvolutionChain } from '@/data/pokemonDatabase';
import { PokemonSprite } from '@/components/PokemonSprite';
import { TypeBadge } from '@/components/TypeBadge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { PokemonSpecies, PokemonType } from '@/types/pokemon';
import { cn } from '@/lib/utils';

const typeFilters: PokemonType[] = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

const PokedexPage = () => {
  const { state } = useGameState();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<PokemonType | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonSpecies | null>(null);

  const filteredPokemon = useMemo(() => {
    let result = POKEMON_DATABASE;

    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toString().includes(searchQuery)
      );
    }

    if (typeFilter) {
      result = result.filter(p => p.types.includes(typeFilter));
    }

    return result;
  }, [searchQuery, typeFilter]);

  const progress = (state.pokedexCaught.length / POKEMON_DATABASE.length) * 100;

  const isCaught = (id: number) => state.pokedexCaught.includes(id);
  const isSeen = (id: number) => state.pokedexSeen.includes(id);

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Pokédex
          </h1>
          <span className="text-muted-foreground text-sm">
            {state.pokedexCaught.length}/{POKEMON_DATABASE.length}
          </span>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="py-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Completion</span>
              <span className="font-bold">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setTypeFilter(null)}
            className={cn(
              'px-2 py-1 rounded-full text-xs font-medium transition-colors',
              !typeFilter 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            All
          </button>
          {typeFilters.map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? null : type)}
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium capitalize transition-colors',
                typeFilter === type 
                  ? 'ring-2 ring-ring' 
                  : ''
              )}
            >
              <TypeBadge type={type} size="sm" />
            </button>
          ))}
        </div>

        {/* Pokemon Grid */}
        <div className="grid grid-cols-4 gap-2">
          {filteredPokemon.map(pokemon => {
            const caught = isCaught(pokemon.id);
            const seen = isSeen(pokemon.id);
            
            return (
              <button
                key={pokemon.id}
                onClick={() => setSelectedPokemon(pokemon)}
                className={cn(
                  'relative p-2 rounded-lg border transition-all',
                  caught 
                    ? 'bg-card border-primary/30 hover:border-primary' 
                    : 'bg-muted/30 border-border hover:bg-muted/50'
                )}
              >
                {caught && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <PokemonSprite
                  pokemonId={pokemon.id}
                  name={pokemon.name}
                  className="w-12 h-12 mx-auto"
                  isLocked={!seen}
                  isSilhouette={seen && !caught}
                />
                <p className="text-[10px] text-center mt-1 truncate">
                  {seen ? pokemon.name : '???'}
                </p>
                <p className="text-[9px] text-center text-muted-foreground">
                  #{pokemon.id.toString().padStart(3, '0')}
                </p>
              </button>
            );
          })}
        </div>

        {/* Pokemon Detail Dialog */}
        <Dialog open={!!selectedPokemon} onOpenChange={() => setSelectedPokemon(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center">
                #{selectedPokemon?.id.toString().padStart(3, '0')} {selectedPokemon?.name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedPokemon && (
              <div className="space-y-4">
                <div className="text-center">
                  <PokemonSprite
                    pokemonId={selectedPokemon.id}
                    name={selectedPokemon.name}
                    className="w-32 h-32 mx-auto"
                    isLocked={!isSeen(selectedPokemon.id)}
                  />
                </div>

                {isSeen(selectedPokemon.id) ? (
                  <>
                    <div className="flex justify-center gap-2">
                      {selectedPokemon.types.map(type => (
                        <TypeBadge key={type} type={type} />
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Rarity</p>
                        <p className="font-semibold capitalize">{selectedPokemon.rarity}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className={cn(
                          'font-semibold',
                          isCaught(selectedPokemon.id) ? 'text-success' : 'text-muted-foreground'
                        )}>
                          {isCaught(selectedPokemon.id) ? 'Caught' : 'Not caught'}
                        </p>
                      </div>
                    </div>

                    {/* Evolution Chain */}
                    {(selectedPokemon.evolvesFrom || selectedPokemon.evolvesTo) && (
                      <div>
                        <p className="text-sm font-medium mb-2">Evolution Chain</p>
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {getEvolutionChain(selectedPokemon.id).map((evoId, index, arr) => {
                            const evoPokemon = getPokemonById(evoId);
                            if (!evoPokemon) return null;
                            return (
                              <div key={evoId} className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedPokemon(evoPokemon)}
                                  className={cn(
                                    'p-2 rounded-lg border transition-colors',
                                    evoId === selectedPokemon.id 
                                      ? 'border-primary bg-primary/10' 
                                      : 'border-border hover:border-primary/50'
                                  )}
                                >
                                  <PokemonSprite
                                    pokemonId={evoPokemon.id}
                                    name={evoPokemon.name}
                                    className="w-12 h-12"
                                    isLocked={!isSeen(evoPokemon.id)}
                                  />
                                  <p className="text-[10px] text-center truncate w-14">
                                    {isSeen(evoPokemon.id) ? evoPokemon.name : '???'}
                                  </p>
                                </button>
                                {index < arr.length - 1 && (
                                  <span className="text-muted-foreground">→</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-muted-foreground">
                    This Pokémon hasn't been discovered yet.
                    <br />
                    Keep catching to find it!
                  </p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default PokedexPage;
