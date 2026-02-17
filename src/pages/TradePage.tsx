import { useState } from 'react';
import { ArrowLeftRight, Coins, Clock } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useGameState } from '@/hooks/useGameState';
import { getPokemonById } from '@/data/pokemonDatabase';
import { PokemonCard } from '@/components/PokemonCard';
import { PokemonSprite } from '@/components/PokemonSprite';
import { TypeBadge } from '@/components/TypeBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { OwnedPokemon } from '@/types/pokemon';
import { cn } from '@/lib/utils';

const TradePage = () => {
  const { state, tradePokemon, canTrade } = useGameState();
  const { toast } = useToast();
  const [selectedPokemon, setSelectedPokemon] = useState<OwnedPokemon | null>(null);
  const [isTrading, setIsTrading] = useState(false);
  const [tradedPokemon, setTradedPokemon] = useState<OwnedPokemon | null>(null);

  const tradeAvailable = canTrade();
  const now = new Date();
  const isBefore12 = now.getHours() < 12;

  const handleTrade = async () => {
    if (!selectedPokemon || state.coins < 1 || !tradeAvailable) return;

    setIsTrading(true);

    // Dramatic trade animation - swirl out (2s)
    await new Promise(r => setTimeout(r, 2000));

    // Flash transition
    await new Promise(r => setTimeout(r, 500));

    const result = tradePokemon(selectedPokemon.uniqueId);
    
    if (result) {
      setTradedPokemon(result);
      const newSpecies = getPokemonById(result.speciesId);
      const oldSpecies = getPokemonById(selectedPokemon.speciesId);

      // Reveal delay
      await new Promise(r => setTimeout(r, 800));

      toast({
        title: 'Trade Complete!',
        description: `${oldSpecies?.name} traded for ${newSpecies?.name}!`,
      });
    }

    setIsTrading(false);
  };

  const resetTrade = () => {
    setSelectedPokemon(null);
    setTradedPokemon(null);
  };

  const selectedSpecies = selectedPokemon ? getPokemonById(selectedPokemon.speciesId) : null;
  const tradedSpecies = tradedPokemon ? getPokemonById(tradedPokemon.speciesId) : null;

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Trade Pokémon</h1>
          <p className="text-muted-foreground">
            Trade a Pokémon for a random new one (1 coin)
          </p>
        </div>

        {/* Trade Window Status */}
        <Card className={cn(
          'border-2',
          tradeAvailable ? 'border-success' : 'border-destructive'
        )}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className={cn(
                  'w-6 h-6',
                  tradeAvailable ? 'text-success' : 'text-destructive'
                )} />
                <div>
                  <p className="font-semibold">
                    {isBefore12 ? 'Morning' : 'Afternoon'} Trade Window
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isBefore12 ? 'Before 12:00 PM' : 'After 12:00 PM'}
                  </p>
                </div>
              </div>
              <span className={cn(
                'px-3 py-1 rounded-full text-sm font-medium',
                tradeAvailable 
                  ? 'bg-success/20 text-success' 
                  : 'bg-destructive/20 text-destructive'
              )}>
                {tradeAvailable ? 'Available' : 'Used'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Trade Preview */}
        {selectedPokemon && selectedSpecies && (
          <Card className="relative overflow-hidden">
            <div className={cn(
              'absolute inset-0 transition-all duration-700',
              isTrading ? 'bg-gradient-to-br from-pokemon-water/30 via-pokemon-psychic/20 to-pokemon-fire/30' : 'bg-gradient-to-br from-pokemon-water/10 to-pokemon-fire/10'
            )} />

            {/* Trade energy particles */}
            {isTrading && (
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-primary animate-evolution-particle"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      animationDelay: `${Math.random() * 1.5}s`,
                      animationDuration: '1.5s',
                    }}
                  />
                ))}
              </div>
            )}

            <CardContent className="relative py-8">
              <div className="flex items-center justify-center gap-6">
                {/* Trading Away */}
                <div className={cn(
                  'text-center transition-all duration-700',
                  isTrading && 'animate-trade-swirl'
                )}>
                  <PokemonSprite
                    pokemonId={selectedSpecies.id}
                    name={selectedSpecies.name}
                    className="w-28 h-28 mx-auto"
                  />
                  <p className="font-semibold mt-2">{selectedSpecies.name}</p>
                  <p className="text-xs text-muted-foreground">Trading Away</p>
                </div>

                {/* Trade Arrow with energy effect */}
                <div className={cn(
                  'p-3 rounded-full transition-all duration-500',
                  isTrading
                    ? 'bg-primary/30 shadow-[0_0_30px_hsl(45,93%,58%/0.5)] animate-spin'
                    : 'bg-pokemon-water/20'
                )}>
                  <ArrowLeftRight className={cn(
                    'w-7 h-7 transition-colors',
                    isTrading ? 'text-primary' : 'text-pokemon-water'
                  )} />
                </div>

                {/* Receiving */}
                {tradedPokemon && tradedSpecies ? (
                  <div className="text-center animate-trade-sparkle">
                    <div className="relative">
                      <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping" />
                      <PokemonSprite
                        pokemonId={tradedSpecies.id}
                        name={tradedSpecies.name}
                        className="w-28 h-28 mx-auto relative z-10"
                        animate
                      />
                    </div>
                    <p className="font-semibold mt-2">{tradedSpecies.name}</p>
                    <div className="flex justify-center gap-1 mt-1">
                      {tradedSpecies.types.map(type => (
                        <TypeBadge key={type} type={type} size="sm" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={cn(
                    'w-28 h-28 flex items-center justify-center rounded-lg transition-all duration-500',
                    isTrading
                      ? 'bg-primary/10 border-2 border-primary/30 animate-pulse'
                      : 'bg-muted/50'
                  )}>
                    <span className="text-4xl">{isTrading ? '✨' : '?'}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {selectedPokemon && !tradedPokemon && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={resetTrade}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTrade}
              disabled={state.coins < 1 || !tradeAvailable || isTrading}
              className="flex-1"
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Trade (1 <Coins className="w-4 h-4 mx-1" />)
            </Button>
          </div>
        )}

        {tradedPokemon && (
          <Button onClick={resetTrade} className="w-full">
            Done
          </Button>
        )}

        {/* Pokemon Selection */}
        {!selectedPokemon && (
          <>
            {!tradeAvailable ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    You've already used your {isBefore12 ? 'morning' : 'afternoon'} trade.
                    <br />
                    Come back {isBefore12 ? 'after 12:00 PM' : 'tomorrow morning'}!
                  </p>
                </CardContent>
              </Card>
            ) : state.ownedPokemon.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <ArrowLeftRight className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    You don't have any Pokémon to trade.
                    <br />
                    Catch some first!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <h2 className="font-semibold">Select a Pokémon to trade:</h2>
                <div className="grid grid-cols-3 gap-3">
                  {state.ownedPokemon.map(pokemon => (
                    <PokemonCard
                      key={pokemon.uniqueId}
                      pokemon={pokemon}
                      onClick={() => setSelectedPokemon(pokemon)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default TradePage;
