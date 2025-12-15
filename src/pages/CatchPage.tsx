import { useState, useCallback } from 'react';
import { Coins, Sparkles } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useGameState } from '@/hooks/useGameState';
import { getPokemonById } from '@/data/pokemonDatabase';
import { PokemonSprite } from '@/components/PokemonSprite';
import { TypeBadge } from '@/components/TypeBadge';
import { CatchingAnimation } from '@/components/CatchingAnimation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { OwnedPokemon } from '@/types/pokemon';

type CatchState = 'idle' | 'throwing' | 'shaking' | 'caught' | 'reveal';

const CatchPage = () => {
  const { state, catchPokemon } = useGameState();
  const { toast } = useToast();
  const [catchState, setCatchState] = useState<CatchState>('idle');
  const [caughtPokemon, setCaughtPokemon] = useState<OwnedPokemon | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  const handleCatch = async () => {
    if (state.coins < 3) {
      toast({
        title: 'Not enough coins!',
        description: 'You need 3 coins to catch a Pokémon.',
        variant: 'destructive',
      });
      return;
    }

    // Phase 1: Throwing (0.8s)
    setCatchState('throwing');
    await new Promise(r => setTimeout(r, 800));
    
    // Phase 2: Shaking (2s)
    setCatchState('shaking');
    await new Promise(r => setTimeout(r, 2000));
    
    // Phase 3: Caught animation
    const result = catchPokemon();
    
    if (result) {
      setCaughtPokemon(result.pokemon);
      setCatchState('caught');
      
      // Create celebration particles
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 300 - 150,
        y: Math.random() * 300 - 150,
        color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)],
      }));
      setParticles(newParticles);
      
      // Phase 4: Reveal (after 1.5s)
      await new Promise(r => setTimeout(r, 1500));
      setCatchState('reveal');
      
      const species = getPokemonById(result.pokemon.speciesId);
      const description = result.isDuplicate 
        ? `+${result.refundCoins} coin refund (duplicate!)` 
        : 'New Pokédex entry!';
      toast({
        title: `Caught ${species?.name}!`,
        description,
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

  const handleAnimationComplete = useCallback(() => {
    // Animation complete callback
  }, []);

  const resetCatch = () => {
    setCatchState('idle');
    setCaughtPokemon(null);
    setParticles([]);
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
        <Card className="relative overflow-hidden min-h-[350px]">
          <div className="absolute inset-0 bg-gradient-to-b from-pokemon-grass/10 via-transparent to-pokemon-water/10" />
          
          {/* Background sparkles */}
          <div className="absolute inset-0 overflow-hidden">
            {catchState !== 'idle' && Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: '2s',
                }}
              />
            ))}
          </div>

          <CardContent className="relative flex flex-col items-center justify-center min-h-[350px] py-8">
            {/* Idle state */}
            {catchState === 'idle' && (
              <div className="text-center space-y-6 animate-fade-in">
                <div className="relative">
                  <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-red-500 to-red-600 relative overflow-hidden shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-b from-gray-100 to-white" />
                    <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-800 -translate-y-1/2" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-4 border-gray-800 shadow-lg">
                      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white to-gray-200" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/20 rounded-full blur-sm" />
                </div>
                <p className="text-lg font-medium">Ready to catch!</p>
              </div>
            )}

            {/* Animation states */}
            {(catchState === 'throwing' || catchState === 'shaking' || catchState === 'caught') && (
              <div className="relative">
                <CatchingAnimation 
                  stage={catchState === 'throwing' ? 'throwing' : catchState === 'shaking' ? 'shaking' : 'caught'}
                  onComplete={handleAnimationComplete}
                />
                
                {/* Celebration particles */}
                {catchState === 'caught' && particles.map((particle) => (
                  <div
                    key={particle.id}
                    className="absolute w-3 h-3 rounded-full animate-particle-explode"
                    style={{
                      left: '50%',
                      top: '50%',
                      backgroundColor: particle.color,
                      '--tx': `${particle.x}px`,
                      '--ty': `${particle.y}px`,
                    } as React.CSSProperties}
                  />
                ))}
              </div>
            )}

            {/* Reveal state */}
            {catchState === 'reveal' && species && (
              <div className="text-center space-y-4 animate-scale-in">
                {/* Glow behind Pokemon */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-radial from-yellow-400/50 via-orange-300/30 to-transparent rounded-full blur-xl scale-150" />
                  <PokemonSprite
                    pokemonId={species.id}
                    name={species.name}
                    className="w-36 h-36 mx-auto relative z-10 drop-shadow-2xl"
                    animate
                  />
                </div>
                
                <div className="relative">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                    <span className="text-sm font-bold text-yellow-600">GOTCHA!</span>
                    <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                  </div>
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
