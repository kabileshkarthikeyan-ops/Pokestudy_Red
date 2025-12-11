import { useState, useEffect } from 'react';
import { Sparkles, Coins, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useGameState } from '@/hooks/useGameState';
import { getPokemonById } from '@/data/pokemonDatabase';
import { PokemonCard } from '@/components/PokemonCard';
import { PokemonSprite } from '@/components/PokemonSprite';
import { TypeBadge } from '@/components/TypeBadge';
import { EvolutionAnimation } from '@/components/EvolutionAnimation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { OwnedPokemon } from '@/types/pokemon';
import { cn } from '@/lib/utils';

type EvolutionStage = 'idle' | 'glowing' | 'transforming' | 'complete';

const EvolvePage = () => {
  const { state, evolvePokemon } = useGameState();
  const { toast } = useToast();
  const [selectedPokemon, setSelectedPokemon] = useState<OwnedPokemon | null>(null);
  const [evolutionStage, setEvolutionStage] = useState<EvolutionStage>('idle');
  const [showBranchDialog, setShowBranchDialog] = useState(false);
  const [evolvedPokemon, setEvolvedPokemon] = useState<OwnedPokemon | null>(null);
  const [targetEvolutionId, setTargetEvolutionId] = useState<number | null>(null);

  // Get pokemon that can evolve
  const evolvablePokemon = state.ownedPokemon.filter(p => {
    const species = getPokemonById(p.speciesId);
    return species?.evolvesTo && species.evolvesTo.length > 0;
  });

  const selectedSpecies = selectedPokemon ? getPokemonById(selectedPokemon.speciesId) : null;
  const evolvedSpecies = evolvedPokemon ? getPokemonById(evolvedPokemon.speciesId) : null;

  const handleEvolve = async (targetId?: number) => {
    if (!selectedPokemon || state.coins < 2) return;

    const evolutionTarget = targetId || targetEvolutionId || selectedSpecies?.evolvesTo?.[0];
    if (!evolutionTarget) return;

    setShowBranchDialog(false);
    setTargetEvolutionId(evolutionTarget);

    // Phase 1: Glowing (1.5s)
    setEvolutionStage('glowing');
    await new Promise(r => setTimeout(r, 1500));

    // Phase 2: Transforming (1.5s)
    setEvolutionStage('transforming');
    await new Promise(r => setTimeout(r, 1500));

    // Actually evolve
    const result = evolvePokemon(selectedPokemon.uniqueId, evolutionTarget);
    
    if (result) {
      setEvolvedPokemon(result);
      setEvolutionStage('complete');
      
      const newSpecies = getPokemonById(result.speciesId);
      toast({
        title: `Evolved into ${newSpecies?.name}!`,
        description: 'Congratulations on the evolution!',
      });
    } else {
      setEvolutionStage('idle');
      toast({
        title: 'Evolution failed',
        description: 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  const handleSelectPokemon = (pokemon: OwnedPokemon) => {
    setSelectedPokemon(pokemon);
    setEvolvedPokemon(null);
    setEvolutionStage('idle');
    setTargetEvolutionId(null);
  };

  const handleEvolveClick = () => {
    if (!selectedSpecies) return;

    if (selectedSpecies.evolutionBranch && selectedSpecies.evolvesTo && selectedSpecies.evolvesTo.length > 1) {
      setShowBranchDialog(true);
    } else {
      handleEvolve(selectedSpecies.evolvesTo?.[0]);
    }
  };

  const resetSelection = () => {
    setSelectedPokemon(null);
    setEvolvedPokemon(null);
    setEvolutionStage('idle');
    setTargetEvolutionId(null);
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

        {/* Evolution Animation Area */}
        {selectedPokemon && selectedSpecies && evolutionStage !== 'idle' && (
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-400/10 to-purple-500/10" />
            <CardContent className="relative py-8 flex justify-center">
              <EvolutionAnimation
                fromPokemonId={selectedSpecies.id}
                toPokemonId={targetEvolutionId || selectedSpecies.evolvesTo?.[0] || 0}
                fromName={selectedSpecies.name}
                toName={getPokemonById(targetEvolutionId || selectedSpecies.evolvesTo?.[0] || 0)?.name || ''}
                stage={evolutionStage}
              />
            </CardContent>
          </Card>
        )}

        {/* Evolution Preview (before animation) */}
        {selectedPokemon && selectedSpecies && evolutionStage === 'idle' && (
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pokemon-psychic/10 to-pokemon-fairy/10" />
            <CardContent className="relative py-6">
              <div className="flex items-center justify-center gap-4">
                {/* Current Pokemon */}
                <div className="text-center">
                  <PokemonSprite
                    pokemonId={selectedSpecies.id}
                    name={selectedSpecies.name}
                    className="w-24 h-24 mx-auto"
                  />
                  <p className="font-semibold mt-2">{selectedSpecies.name}</p>
                </div>

                {/* Arrow */}
                <div className="p-2 rounded-full bg-primary/20">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>

                {/* Evolution target */}
                {selectedSpecies.evolutionBranch ? (
                  <div className="w-24 h-24 mx-auto flex items-center justify-center bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground text-center">Choose evolution</span>
                  </div>
                ) : selectedSpecies.evolvesTo && selectedSpecies.evolvesTo[0] ? (
                  <div className="text-center">
                    <PokemonSprite
                      pokemonId={selectedSpecies.evolvesTo[0]}
                      name={getPokemonById(selectedSpecies.evolvesTo[0])?.name || ''}
                      className="w-24 h-24 mx-auto opacity-50"
                    />
                    <p className="font-semibold mt-2 opacity-50">
                      {getPokemonById(selectedSpecies.evolvesTo[0])?.name}
                    </p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success State */}
        {evolutionStage === 'complete' && evolvedSpecies && (
          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <CardContent className="py-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                <span className="text-xl font-bold">Evolution Complete!</span>
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="flex justify-center gap-2 mb-2">
                {evolvedSpecies.types.map(type => (
                  <TypeBadge key={type} type={type} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {selectedPokemon && evolutionStage === 'idle' && (
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
              disabled={state.coins < 2}
              className="flex-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Evolve (2 <Coins className="w-4 h-4 mx-1" />)
            </Button>
          </div>
        )}

        {evolutionStage === 'complete' && (
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
