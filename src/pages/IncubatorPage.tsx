import { useState } from 'react';
import { Egg as EggIcon, Flame, Clock, Sparkles, Pause, Play } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useGameState } from '@/hooks/useGameState';
import { getPokemonById } from '@/data/pokemonDatabase';
import { PokemonSprite } from '@/components/PokemonSprite';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Egg, OwnedPokemon } from '@/types/pokemon';

const IncubatorPage = () => {
  const { state, hatchEgg, toggleEggPause, getBurnoutMultiplier } = useGameState();
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

  const handleTogglePause = (eggId: string, isPaused: boolean) => {
    toggleEggPause(eggId);
    toast({ 
      title: isPaused ? 'Incubation resumed!' : 'Incubation paused',
      description: isPaused ? 'Progress will continue during study.' : 'Progress is paused until resumed.'
    });
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

  const burnoutBonus = getBurnoutMultiplier();
  const questBonus = state.questStreak > 0 ? Math.min(state.questStreak * 0.1, 0.5) : 0;
  const totalBonus = burnoutBonus + questBonus;

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
            {state.eggs.length} / 3 slots
          </Badge>
        </div>

        {/* Incubation Bonus Info */}
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-medium">Incubation Speed</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">
                  {totalBonus.toFixed(1)}x multiplier
                </p>
                <p className="text-xs text-muted-foreground">
                  {state.questStreak > 0 ? `+${(questBonus * 100).toFixed(0)}% from quest streak` : 'Complete quests for bonus!'}
                </p>
              </div>
            </div>
            {totalStudyToday >= 60 && (
              <div className="mt-2 px-2 py-1 bg-orange-500/20 rounded text-xs text-center">
                🔥 Heat Bonus Active! (60+ min session)
              </div>
            )}
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
                    isReady && 'ring-2 ring-primary animate-pulse',
                    egg.isPaused && 'opacity-70'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className={cn(
                          'w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br relative',
                          getRarityColor(egg.rarity)
                        )}
                      >
                        {isReady ? (
                          <Sparkles className="w-8 h-8 text-white animate-spin" />
                        ) : (
                          <EggIcon className="w-8 h-8 text-white" />
                        )}
                        {egg.isPaused && (
                          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                            <Pause className="w-6 h-6 text-white" />
                          </div>
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
                          {egg.isPaused && (
                            <Badge variant="outline" className="text-xs">Paused</Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{isReady ? 'Ready to hatch!' : egg.isPaused ? 'Paused' : 'Incubating...'}</span>
                            <span>{Math.min(100, Math.round(egg.incubationProgress))}%</span>
                          </div>
                          <Progress value={Math.min(100, egg.incubationProgress)} className="h-2" />
                          {!isReady && !egg.isPaused && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              ~{Math.ceil((100 - egg.incubationProgress) / 100 * egg.requiredMinutes)} min of study remaining
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {isReady ? (
                          <Button onClick={() => handleHatch(egg)} size="sm">
                            Hatch!
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleTogglePause(egg.id, !!egg.isPaused)}
                          >
                            {egg.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
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
                  <p className="text-[10px] text-muted-foreground mt-1">Empty</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card>
          <CardContent className="py-4">
            <h3 className="font-semibold mb-2">Hatched Pokémon Benefits</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Start with higher friendship (100 vs 70)</li>
              <li>• Better suited for battles</li>
              <li>• Incubation speeds up with quest streaks</li>
              <li>• Pause/resume anytime without losing progress</li>
            </ul>
          </CardContent>
        </Card>

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
                <div className="flex justify-center gap-2 mt-2">
                  <Badge variant="secondary">Friendship: 100</Badge>
                  <Badge variant="secondary">Hatched ✨</Badge>
                </div>
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
