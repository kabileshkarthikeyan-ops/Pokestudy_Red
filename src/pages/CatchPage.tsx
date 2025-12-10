import { useState } from 'react';
import { Coins, Sparkles } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useGameState } from '@/hooks/useGameState';
import { getPokemonById } from '@/data/pokemonDatabase';
import { PokemonSprite } from '@/components/PokemonSprite';
import { TypeBadge } from '@/components/TypeBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { OwnedPokemon } from '@/types/pokemon';

type CatchState = 'idle' | 'throwing' | 'shaking' | 'success' | 'reveal';

const CatchPage = () => {
  const { state, catchPokemon } = useGameState();
  const { toast } = useToast();
  const [catchState, setCatchState] = useState<CatchState>('idle');
  const [caughtPokemon, setCaughtPokemon] = useState<OwnedPokemon | null>(null);

  const handleCatch = async () => {
    if (state.coins < 3) {
      toast({
        title: 'Not enough coins!',
        description: 'You need 3 coins to catch a Pokémon.',
        variant: 'destructive',
      });
      return;
    }

    setCatchState('throwing');
    
    await new Promise(r => setTimeout(r, 500));
    setCatchState('shaking');
    
    await new Promise(r => setTimeout(r, 1500));
    
    const pokemon = catchPokemon();
    
    if (pokemon) {
      setCaughtPokemon(pokemon);
      setCatchState('success');
      
      await new Promise(r => setTimeout(r, 600));
      setCatchState('reveal');
      
      const species = getPokemonById(pokemon.speciesId);
      toast({
        title: `Caught ${species?.name}!`,
        description: pokemon.xp > 0 ? '+10 XP (duplicate)' : 'New Pokédex entry!',
      });
    } else {
      setCatchState('idle');
      toast({
        title: 'Something went wrong',
        description: 'Try again!',
        variant: 'destructive',
      });
    }
  };

  const resetCatch = () => {
    setCatchState('idle');
    setCaughtPokemon(null);
  };

  const species = caughtPokemon ? getPokemonById(caughtPokemon.speciesId) : null;

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Catch Pokémon</h1>
          <p className="text-muted-foreground">
            Spend 3 coins for a chance to catch a random Pokémon!
          </p>
        </div>

        {/* Catch Area */}
        <Card className="relative overflow-hidden min-h-[300px]">
          <div className="absolute inset-0 bg-gradient-to-b from-pokemon-grass/10 to-pokemon-water/10" />
          <CardContent className="relative flex flex-col items-center justify-center min-h-[300px] py-8">
            {catchState === 'idle' && (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-destructive to-card border-4 border-foreground relative">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-foreground -translate-y-1/2" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border-4 border-foreground" />
                </div>
                <p className="text-lg font-medium">Ready to catch!</p>
              </div>
            )}

            {catchState === 'throwing' && (
              <div className="animate-bounce">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-destructive to-card border-4 border-foreground relative">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-foreground -translate-y-1/2" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-card border-4 border-foreground" />
                </div>
              </div>
            )}

            {catchState === 'shaking' && (
              <div className="pokeball-shake">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-destructive to-card border-4 border-foreground relative">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-foreground -translate-y-1/2" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-card border-4 border-foreground" />
                </div>
              </div>
            )}

            {catchState === 'success' && (
              <div className="catch-success flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold">Gotcha!</span>
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            )}

            {catchState === 'reveal' && species && (
              <div className="text-center space-y-4 animate-scale-in">
                <PokemonSprite
                  pokemonId={species.id}
                  name={species.name}
                  className="w-32 h-32 mx-auto"
                  animate
                />
                <div>
                  <p className="text-xs text-muted-foreground">
                    #{species.id.toString().padStart(3, '0')}
                  </p>
                  <h2 className="text-2xl font-bold">{species.name}</h2>
                </div>
                <div className="flex justify-center gap-2">
                  {species.types.map(type => (
                    <TypeBadge key={type} type={type} />
                  ))}
                </div>
                <p className="text-sm capitalize text-muted-foreground">
                  Rarity: <span className={cn(
                    'font-semibold',
                    species.rarity === 'legendary' && 'text-pokemon-dragon',
                    species.rarity === 'mythical' && 'text-pokemon-psychic',
                    species.rarity === 'rare' && 'text-pokemon-electric',
                  )}>{species.rarity}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="space-y-3">
          {catchState === 'reveal' ? (
            <Button
              onClick={resetCatch}
              className="w-full h-14 text-lg font-bold"
            >
              Catch Another!
            </Button>
          ) : (
            <Button
              onClick={handleCatch}
              disabled={state.coins < 3 || catchState !== 'idle'}
              className="w-full h-14 text-lg font-bold relative overflow-hidden"
            >
              <span className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Throw Pokéball (3 coins)
              </span>
            </Button>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Your coins: <span className="font-bold text-primary">{state.coins}</span>
          </p>
        </div>

        {/* Rarity Info */}
        <Card>
          <CardContent className="py-4">
            <h3 className="font-semibold mb-2">Catch Rates</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Common</span>
              <span className="text-right">50%</span>
              <span className="text-muted-foreground">Uncommon</span>
              <span className="text-right">30%</span>
              <span className="text-muted-foreground">Rare</span>
              <span className="text-right text-pokemon-electric">15%</span>
              <span className="text-muted-foreground">Legendary</span>
              <span className="text-right text-pokemon-dragon">4%</span>
              <span className="text-muted-foreground">Mythical</span>
              <span className="text-right text-pokemon-psychic">1%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CatchPage;
