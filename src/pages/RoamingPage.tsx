import { useState, useRef } from 'react';
import { Palette, Coins, Check, Lock } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useGameState } from '@/hooks/useGameState';
import { getPokemonById } from '@/data/pokemonDatabase';
import { RoamingPokemon } from '@/components/RoamingPokemon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Background {
  id: string;
  name: string;
  image: string;
  price: number;
}

const BACKGROUNDS: Background[] = [
  { id: 'default', name: 'Grassland', image: '/backgrounds/meadow.jpg', price: 0 },
  { id: 'savanna', name: 'Savanna', image: '/backgrounds/savanna.jpg', price: 5 },
  { id: 'mountain', name: 'Mountain Lake', image: '/backgrounds/mountain.jpg', price: 5 },
];

const RoamingPage = () => {
  const { state, spendCoins, updateSettings } = useGameState();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBackground, setSelectedBackground] = useState(
    state.settings.roamingBackground || 'default'
  );

  const purchasedBackgrounds = state.settings.purchasedBackgrounds || ['default'];
  const activeBackground = BACKGROUNDS.find(bg => bg.id === selectedBackground) || BACKGROUNDS[0];

  // Get first 3 owned Pokemon for roaming
  const roamingPokemon = state.ownedPokemon.slice(0, 3).map(p => ({
    ...p,
    species: getPokemonById(p.speciesId),
  })).filter(p => p.species);

  const handlePurchaseBackground = (bg: Background) => {
    if (purchasedBackgrounds.includes(bg.id)) {
      // Already owned, just select it
      setSelectedBackground(bg.id);
      updateSettings({ roamingBackground: bg.id });
      return;
    }

    if (state.coins < bg.price) {
      toast({
        title: 'Not enough coins!',
        description: `You need ${bg.price} coins to unlock this background.`,
        variant: 'destructive',
      });
      return;
    }

    if (spendCoins(bg.price)) {
      updateSettings({
        purchasedBackgrounds: [...purchasedBackgrounds, bg.id],
        roamingBackground: bg.id,
      });
      setSelectedBackground(bg.id);
      toast({
        title: 'Background Unlocked!',
        description: `You can now use the ${bg.name} background.`,
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Roaming</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Palette className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Choose Background</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 py-4">
                {BACKGROUNDS.map((bg) => {
                  const isOwned = purchasedBackgrounds.includes(bg.id);
                  const isSelected = selectedBackground === bg.id;

                  return (
                    <button
                      key={bg.id}
                      onClick={() => handlePurchaseBackground(bg)}
                      className={cn(
                        'relative rounded-lg overflow-hidden border-2 transition-all',
                        isSelected ? 'border-primary ring-2 ring-primary/50' : 'border-border',
                        !isOwned && 'opacity-80'
                      )}
                    >
                      <img
                        src={bg.image}
                        alt={bg.name}
                        className="w-full h-24 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-sm font-medium">{bg.name}</p>
                        {!isOwned && (
                          <div className="flex items-center gap-1 text-yellow-400 text-xs">
                            <Coins className="w-3 h-3" />
                            {bg.price}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                      {!isOwned && (
                        <div className="absolute top-2 left-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                          <Lock className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Roaming Area */}
        <Card className="overflow-hidden">
          <div
            ref={containerRef}
            className="relative h-80 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${activeBackground.image})` }}
          >
            {/* Overlay for better visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            {/* Roaming Pokemon */}
            {roamingPokemon.length > 0 ? (
              roamingPokemon.map((pokemon, index) => (
                <RoamingPokemon
                  key={pokemon.uniqueId}
                  pokemonId={pokemon.speciesId}
                  name={pokemon.species!.name}
                  containerRef={containerRef}
                />
              ))
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-center bg-black/50 px-4 py-2 rounded-lg">
                  Catch some Pokémon to see them roam!
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Info Card */}
        <Card>
          <CardContent className="py-4">
            <h3 className="font-semibold mb-2">Roaming Pokémon</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Watch your first 3 Pokémon explore and play with quirky behaviors!
            </p>
            <div className="flex flex-wrap gap-2">
              {roamingPokemon.map((pokemon) => (
                <div
                  key={pokemon.uniqueId}
                  className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm"
                >
                  <span>#{pokemon.speciesId}</span>
                  <span className="font-medium">{pokemon.species?.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Behaviors Legend */}
        <Card>
          <CardContent className="py-4">
            <h3 className="font-semibold mb-2">Behaviors</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span>🚶</span>
                <span className="text-muted-foreground">Walking</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💤</span>
                <span className="text-muted-foreground">Sleeping</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✨</span>
                <span className="text-muted-foreground">Jumping</span>
              </div>
              <div className="flex items-center gap-2">
                <span>❓</span>
                <span className="text-muted-foreground">Curious</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RoamingPage;
