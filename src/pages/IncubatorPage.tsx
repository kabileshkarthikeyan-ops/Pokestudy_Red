import { useState } from 'react';
import { Egg as EggIcon, Flame, Clock, Sparkles } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useGameState } from '@/hooks/useGameState';
import { getPokemonById } from '@/data/pokemonDatabase';
import { PokemonSprite } from '@/components/PokemonSprite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Egg, OwnedPokemon } from '@/types/pokemon';

const IncubatorPage = () => {
  const { state, hatchEgg } = useGameState();
  const { toast } = useToast();
  const [hatchingEgg, setHatchingEgg] = useState<Egg | null>(null);
  const [hatchedPokemon, setHatchedPokemon] = useState<OwnedPokemon | null>(null);

  const handleHatch = (egg: Egg) => {
    if (egg.incubationProgress < 100) return;

    setHatchingEgg(egg);
    setTimeout(() => {
      const pokemon = hatchEgg(egg.id);
      if (pokemon) {
        setHatchingEgg(null);
        setHatchedPokemon(pokemon);
        const species = getPokemonById(pokemon.speciesId);
        toast({ 
          title: egg.isShiny ? '✨ A SHINY hatched!' : 'Egg hatched!',
          description: `${species?.name} emerged from the egg!`
        });
      }
    }, 2000);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500';
      case 'uncommon': return 'from-green-400 to-green-500';
      case 'rare': return 'from-blue-400 to-blue-500';
      case 'legendary': return 'from-purple-400 to-yellow-500';
      case 'mythical': return 'from-pink-400 to-purple-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getBurnoutBonus = () => {
    switch (state.settings.burnoutMode) {
      case 'vacation': return 0.5;
      case 'standard': return 1;
      case 'exam': return 1.5;
    }
  };

  const totalStudyToday = state.studyHistory
    .filter(e => new Date(e.date).toDateString() === new Date().toDateString())
    .reduce((sum, e) => sum + e.minutes, 0);

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <EggIcon className="w-6 h-6" />
            Incubator
          </h1>
          <Badge variant="outline">
            {state.eggs.length} / 3 eggs
          </Badge>
        </div>

        {/* Heat Bonus Info */}
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-medium">Heat Bonus</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">
                  {getBurnoutBonus()}x multiplier
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalStudyToday >= 60 ? '60+ min session = 2x!' : `${60 - totalStudyToday} min to 2x`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Egg Slots */}
        {state.eggs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <EggIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No eggs in incubator</p>
              <p className="text-sm text-muted-foreground">
                Purchase eggs from the Daily Shop!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {state.eggs.map((egg) => {
              const isReady = egg.incubationProgress >= 100;
              const species = getPokemonById(egg.speciesId);

              return (
                <Card 
                  key={egg.id}
                  className={cn(
                    'transition-all',
                    isReady && 'ring-2 ring-primary animate-pulse'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className={cn(
                          'w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br',
                          getRarityColor(egg.rarity)
                        )}
                      >
                        {isReady ? (
                          <Sparkles className="w-8 h-8 text-white animate-spin" />
                        ) : (
                          <EggIcon className="w-8 h-8 text-white" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="capitalize">
                            {egg.rarity}
                          </Badge>
                          {egg.isShiny && (
                            <Badge className="bg-yellow-500/20 text-yellow-600">
                              <Sparkles className="w-3 h-3" />
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{isReady ? 'Ready to hatch!' : 'Incubating...'}</span>
                            <span>{Math.min(100, Math.round(egg.incubationProgress))}%</span>
                          </div>
                          <Progress value={Math.min(100, egg.incubationProgress)} className="h-2" />
                          {!isReady && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {Math.ceil((100 - egg.incubationProgress) / 100 * egg.requiredMinutes)} min remaining
                            </p>
                          )}
                        </div>
                      </div>

                      {isReady && (
                        <Button onClick={() => handleHatch(egg)}>
                          Hatch!
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty Slots */}
        {state.eggs.length < 3 && (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 - state.eggs.length }).map((_, i) => (
              <Card key={i} className="border-dashed">
                <CardContent className="py-8 text-center">
                  <EggIcon className="w-8 h-8 mx-auto text-muted-foreground/30" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Hatching Animation Dialog */}
        <Dialog open={!!hatchingEgg} onOpenChange={() => {}}>
          <DialogContent className="text-center">
            <div className="py-8">
              <div className="w-24 h-24 mx-auto mb-4 animate-bounce">
                <div className={cn(
                  'w-full h-full rounded-full bg-gradient-to-br flex items-center justify-center',
                  hatchingEgg && getRarityColor(hatchingEgg.rarity)
                )}>
                  <EggIcon className="w-12 h-12 text-white animate-pulse" />
                </div>
              </div>
              <p className="text-xl font-bold">Hatching...</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Hatched Pokemon Dialog */}
        <Dialog open={!!hatchedPokemon} onOpenChange={() => setHatchedPokemon(null)}>
          <DialogContent className="text-center">
            {hatchedPokemon && (
              <div className="py-4">
                <PokemonSprite
                  pokemonId={hatchedPokemon.speciesId}
                  name={getPokemonById(hatchedPokemon.speciesId)?.name || ''}
                  className="w-32 h-32 mx-auto animate-bounce"
                />
                <h2 className="text-2xl font-bold mt-4">
                  {getPokemonById(hatchedPokemon.speciesId)?.name}
                </h2>
                <p className="text-muted-foreground">has hatched from the egg!</p>
                <Button className="mt-4" onClick={() => setHatchedPokemon(null)}>
                  Wonderful!
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default IncubatorPage;
