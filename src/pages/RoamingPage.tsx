import { useState, useRef } from 'react';
import { Palette, Coins, Check, Lock, Maximize2, Minimize2 } from 'lucide-react';
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
  { id: 'pixel-meadow', name: 'Pixel Meadow', image: '/backgrounds/pixel-meadow.png', price: 3 },
  { id: 'pixel-aurora', name: 'Aurora Night', image: '/backgrounds/pixel-aurora.png', price: 8 },
  { id: 'pixel-ruins', name: 'Ancient Ruins', image: '/backgrounds/pixel-ruins.png', price: 5 },
  { id: 'pixel-coast', name: 'Coastal View', image: '/backgrounds/pixel-coast.png', price: 5 },
  { id: 'pixel-forest', name: 'Forest Grove', image: '/backgrounds/pixel-forest.png', price: 4 },
  { id: 'pixel-plains', name: 'Open Plains', image: '/backgrounds/pixel-plains.png', price: 2 },
  { id: 'pixel-mountain', name: 'Mountain Peak', image: '/backgrounds/pixel-mountain.png', price: 6 },
  { id: 'pixel-pines', name: 'Pine Woods', image: '/backgrounds/pixel-pines.png', price: 4 },
];

const RoamingPage = () => {
  const { state, spendCoins, updateSettings } = useGameState();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBackground, setSelectedBackground] = useState(
    state.settings.roamingBackground || 'default'
  );

  const [isFullscreen, setIsFullscreen] = useState(false);

  const purchasedBackgrounds = state.settings.purchasedBackgrounds || ['default'];
  const activeBackground = BACKGROUNDS.find(bg => bg.id === selectedBackground) || BACKGROUNDS[0];

  // Get roaming Pokemon from settings or first 3
  const roamingIds = state.settings.roamingPokemon || [];
  const roamingPokemon = (roamingIds.length > 0 
    ? state.ownedPokemon.filter(p => roamingIds.includes(p.uniqueId))
    : state.ownedPokemon.slice(0, 3)
  ).map(p => ({
    ...p,
    species: getPokemonById(p.speciesId),
  })).filter(p => p.species);
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

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  if (isFullscreen) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 z-50 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${activeBackground.image})` }}
      >
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 z-10"
          onClick={toggleFullscreen}
        >
          <Minimize2 className="w-4 h-4" />
        </Button>
        {roamingPokemon.map((pokemon) => (
          <RoamingPokemon
            key={pokemon.uniqueId}
            pokemonId={pokemon.speciesId}
            name={pokemon.species!.name}
            containerRef={containerRef}
          />
        ))}
      </div>
    );
  }

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
            {/* Fullscreen Button */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 z-10"
              onClick={toggleFullscreen}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>

            {/* Overlay for better visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            {/* Roaming Pokemon */}
            {roamingPokemon.length > 0 ? (
              roamingPokemon.map((pokemon) => (
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

        {/* Info */}
        <Card>
          <CardContent className="py-4">
            <h3 className="font-semibold mb-2">Roaming Pokémon</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Your Pokémon explore with quirky behaviors! Tap fullscreen for immersive view.
            </p>
            <div className="flex flex-wrap gap-2">
              {roamingPokemon.map((pokemon) => (
                <div
                  key={pokemon.uniqueId}
                  className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm"
                >
                  <span className="font-medium">{pokemon.nickname || pokemon.species?.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RoamingPage;
