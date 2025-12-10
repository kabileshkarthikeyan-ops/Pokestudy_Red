import { useState } from 'react';
import { Sparkles, Coins, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useGameState } from '@/hooks/useGameState';
import { getPokemonById } from '@/data/pokemonDatabase';
import { PokemonCard } from '@/components/PokemonCard';
import { PokemonSprite } from '@/components/PokemonSprite';
import { TypeBadge } from '@/components/TypeBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { OwnedPokemon } from '@/types/pokemon';
import { cn } from '@/lib/utils';

const EvolvePage = () => {
  const { state, evolvePokemon } = useGameState();
  const { toast } = useToast();
  const [selectedPokemon, setSelectedPokemon] = useState<OwnedPokemon | null>(null);
  const [isEvolving, setIsEvolving] = useState(false);
  const [showBranchDialog, setShowBranchDialog] = useState(false);
  const [evolvedPokemon, setEvolvedPokemon] = useState<OwnedPokemon | null>(null);

  // Get pokemon that can evolve
  const evolvablePokemon = state.ownedPokemon.filter(p => {
    const species = getPokemonById(p.speciesId);
    return species?.evolvesTo && species.evolvesTo.length > 0;
  });

  const selectedSpecies = selectedPokemon ? getPokemonById(selectedPokemon.speciesId) : null;

  const handleEvolve = async (targetId?: number) => {
    if (!selectedPokemon || state.coins < 2) return;

    setShowBranchDialog(false);
    setIsEvolving(true);

    await new Promise(r => setTimeout(r, 1500));

    const result = evolvePokemon(selectedPokemon.uniqueId, targetId);
    
    if (result) {
      setEvolvedPokemon(result);
      const newSpecies = getPokemonById(result.speciesId);
      toast({
        title: `Evolved into ${newSpecies?.name}!`,
        description: 'Congratulations on the evolution!',
      });
    }

    setIsEvolving(false);
  };

  const handleSelectPokemon = (pokemon: OwnedPokemon) => {
    setSelectedPokemon(pokemon);
    setEvolvedPokemon(null);
  };

  const handleEvolveClick = () => {
    if (!selectedSpecies) return;

    if (selectedSpecies.evolutionBranch && selectedSpecies.evolvesTo && selectedSpecies.evolvesTo.length > 1) {
      setShowBranchDialog(true);
    } else {
      handleEvolve();
    }
  };

  const resetSelection = () => {
    setSelectedPokemon(null);
    setEvolvedPokemon(null);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Evolve Pokémon</h1>
          <p className="text-muted-foreground">
            Select a Pokémon to evolve for 2 coins
          </p>
        </div>

        {/* Evolution Preview */}
        {selectedPokemon && selectedSpecies && (
          <Card className="relative overflow-hidden">
            <div className={cn(
              'absolute inset-0 transition-all duration-1000',
              isEvolving ? 'bg-white/80' : 'bg-gradient-to-br from-pokemon-psychic/10 to-pokemon-fairy/10'
            )} />
            <CardContent className="relative py-6">
              <div className="flex items-center justify-center gap-4">
                {/* Current Pokemon */}
                <div className={cn(
                  'text-center transition-all duration-500',
                  isEvolving && 'evolution-glow'
                )}>
                  <PokemonSprite
                    pokemonId={selectedSpecies.id}
                    name={selectedSpecies.name}
                    className={cn(
                      'w-24 h-24 mx-auto transition-opacity duration-500',
                      evolvedPokemon && 'opacity-30'
                    )}
                  />
                  <p className="font-semibold mt-2">{selectedSpecies.name}</p>
                </div>

                {/* Arrow */}
                <div className={cn(
                  'p-2 rounded-full bg-primary/20',
                  isEvolving && 'animate-pulse'
                )}>
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>

                {/* Evolution */}
                {evolvedPokemon ? (
                  <div className="text-center animate-scale-in">
                    <PokemonSprite
                      pokemonId={evolvedPokemon.speciesId}
                      name={getPokemonById(evolvedPokemon.speciesId)?.name || ''}
                      className="w-24 h-24 mx-auto"
                      animate
                    />
                    <p className="font-semibold mt-2">
                      {getPokemonById(evolvedPokemon.speciesId)?.name}
                    </p>
                  </div>
                ) : selectedSpecies.evolvesTo && selectedSpecies.evolvesTo.length > 0 ? (
                  <div className="text-center">
                    {selectedSpecies.evolutionBranch ? (
                      <div className="w-24 h-24 mx-auto flex items-center justify-center bg-muted/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">Multiple options</span>
                      </div>
                    ) : (
                      <>
                        <PokemonSprite
                          pokemonId={selectedSpecies.evolvesTo[0]}
                          name={getPokemonById(selectedSpecies.evolvesTo[0])?.name || ''}
                          className="w-24 h-24 mx-auto opacity-50"
                        />
                        <p className="font-semibold mt-2 opacity-50">
                          {getPokemonById(selectedSpecies.evolvesTo[0])?.name}
                        </p>
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {selectedPokemon && !evolvedPokemon && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={resetSelection}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEvolveClick}
              disabled={state.coins < 2 || isEvolving}
              className="flex-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Evolve (2 <Coins className="w-4 h-4 mx-1" />)
            </Button>
          </div>
        )}

        {evolvedPokemon && (
          <Button onClick={resetSelection} className="w-full">
            Evolve Another
          </Button>
        )}

        {/* Pokemon Grid */}
        {!selectedPokemon && (
          <>
            {evolvablePokemon.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No Pokémon can evolve yet.
                    <br />
                    Catch more Pokémon to find ones that can evolve!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {evolvablePokemon.map(pokemon => (
                  <PokemonCard
                    key={pokemon.uniqueId}
                    pokemon={pokemon}
                    onClick={() => handleSelectPokemon(pokemon)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Branch Evolution Dialog */}
        <Dialog open={showBranchDialog} onOpenChange={setShowBranchDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose Evolution</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              {selectedSpecies?.evolvesTo?.map(evoId => {
                const evoSpecies = getPokemonById(evoId);
                if (!evoSpecies) return null;
                return (
                  <button
                    key={evoId}
                    onClick={() => handleEvolve(evoId)}
                    className="p-4 rounded-lg border-2 border-border hover:border-primary transition-colors text-center"
                  >
                    <PokemonSprite
                      pokemonId={evoSpecies.id}
                      name={evoSpecies.name}
                      className="w-20 h-20 mx-auto"
                    />
                    <p className="font-semibold mt-2">{evoSpecies.name}</p>
                    <div className="flex justify-center gap-1 mt-1">
                      {evoSpecies.types.map(type => (
                        <TypeBadge key={type} type={type} size="sm" />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default EvolvePage;
