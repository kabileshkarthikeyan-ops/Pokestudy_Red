import { useState } from 'react';
import { Store, Coins, Sparkles, Clock } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useGameState } from '@/hooks/useGameState';
import { getPokemonById } from '@/data/pokemonDatabase';
import { PokemonSprite } from '@/components/PokemonSprite';
import { TypeBadge } from '@/components/TypeBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ShopItem } from '@/types/pokemon';

const ShopPage = () => {
  const { state, purchaseShopItem, refreshShop } = useGameState();
  const { toast } = useToast();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const today = new Date().toDateString();
  const isNewDay = state.lastShopDate !== today;

  // Auto-refresh shop on new day
  if (isNewDay && state.dailyShop.length > 0) {
    refreshShop();
  }

  const handlePurchase = (item: ShopItem) => {
    if (state.coins < item.price) {
      toast({ title: 'Not enough coins!', variant: 'destructive' });
      return;
    }

    setPurchasingId(item.id);
    setTimeout(() => {
      const result = purchaseShopItem(item.id);
      if (result) {
        const species = getPokemonById(result.speciesId!);
        toast({ 
          title: result.isShiny ? '✨ SHINY!' : 'Pokémon obtained!',
          description: `You got ${species?.name}!`
        });
      }
      setPurchasingId(null);
    }, 500);
  };

  // Calculate time until midnight refresh
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const hoursUntilRefresh = Math.floor((midnight.getTime() - now.getTime()) / (1000 * 60 * 60));
  const minutesUntilRefresh = Math.floor(((midnight.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="w-6 h-6" />
            Pokémon Market
          </h1>
        </div>

        <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Daily Market</p>
                <p className="text-xs text-muted-foreground">Same stock for all trainers today!</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Refreshes in {hoursUntilRefresh}h {minutesUntilRefresh}m</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {state.dailyShop.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Market is setting up...</p>
              <Button onClick={() => refreshShop()}>Open Market</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {state.dailyShop.map((item) => {
              const species = item.speciesId ? getPokemonById(item.speciesId) : null;
              const isSoldOut = item.purchased;

              return (
                <Card 
                  key={item.id}
                  className={cn(
                    'transition-all overflow-hidden',
                    isSoldOut && 'opacity-50'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-lg relative">
                        {species && (
                          <PokemonSprite
                            pokemonId={species.id}
                            name={species.name}
                            className="w-14 h-14"
                          />
                        )}
                        {item.isShiny && (
                          <div className="absolute -top-1 -right-1">
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{species?.name}</p>
                          {item.isShiny && (
                            <Badge className="bg-yellow-500/20 text-yellow-600 text-[10px]">
                              ✨ Shiny
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          #{species?.id.toString().padStart(3, '0')} • {species?.rarity}
                        </p>
                        <div className="flex gap-1">
                          {species?.types.map(type => (
                            <TypeBadge key={type} type={type} size="sm" />
                          ))}
                        </div>
                      </div>

                      <div className="text-right">
                        {item.purchased ? (
                          <Badge variant="outline" className="text-muted-foreground">
                            SOLD
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => handlePurchase(item)}
                            disabled={isSoldOut || purchasingId === item.id || state.coins < item.price}
                            size="sm"
                            className="min-w-20"
                          >
                            {purchasingId === item.id ? (
                              '...'
                            ) : (
                              <>
                                <Coins className="w-3 h-3 mr-1" />
                                {item.price}
                              </>
                            )}
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

        <Card>
          <CardContent className="py-4">
            <h3 className="font-semibold mb-2">About the Market</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Market Pokémon aren't available via catching</li>
              <li>• Stock refreshes at midnight</li>
              <li>• Same selection for all trainers globally</li>
              <li>• Rare chance for shiny Pokémon!</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ShopPage;
