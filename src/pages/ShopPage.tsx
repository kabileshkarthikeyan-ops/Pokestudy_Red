import { useState } from 'react';
import { Store, Coins, Sparkles, Gift, HelpCircle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useGameState } from '@/hooks/useGameState';
import { getPokemonById } from '@/data/pokemonDatabase';
import { PokemonSprite } from '@/components/PokemonSprite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        if (result.type === 'pokemon') {
          const species = getPokemonById(result.speciesId!);
          toast({ 
            title: result.isShiny ? '✨ SHINY!' : 'Pokémon obtained!',
            description: `You got ${species?.name}!`
          });
        } else {
          toast({ 
            title: 'Egg obtained!',
            description: `A ${result.rarity} egg has been added to your incubator!`
          });
        }
      }
      setPurchasingId(null);
    }, 500);
  };

  const getTierColor = (type: ShopItem['type']) => {
    switch (type) {
      case 'bargain': return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      case 'premium': return 'bg-purple-500/20 text-purple-600 dark:text-purple-400';
      case 'gambler': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400';
    }
  };

  const getTierLabel = (type: ShopItem['type']) => {
    switch (type) {
      case 'bargain': return 'Bargain Bin';
      case 'premium': return 'Premium Shelf';
      case 'gambler': return "Gambler's Box";
    }
  };

  const purchasedCount = state.dailyShop.filter(i => i.purchased).length;
  const maxPurchases = 2;

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="w-6 h-6" />
            Daily Shop
          </h1>
          <Badge variant="outline" className="text-sm">
            {maxPurchases - purchasedCount} / {maxPurchases} left
          </Badge>
        </div>

        <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="py-3 text-center">
            <p className="text-sm text-muted-foreground">
              Traveling Merchant • Refreshes at midnight
            </p>
          </CardContent>
        </Card>

        {state.dailyShop.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Shop is setting up...</p>
              <Button onClick={() => refreshShop()}>Open Shop</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {state.dailyShop.map((item) => {
              const species = item.speciesId ? getPokemonById(item.speciesId) : null;
              const isSoldOut = item.purchased || purchasedCount >= maxPurchases;
              const isGambler = item.type === 'gambler';

              return (
                <Card 
                  key={item.id}
                  className={cn(
                    'transition-all',
                    isSoldOut && 'opacity-50'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-lg">
                        {isGambler ? (
                          <div className="relative">
                            <Gift className="w-10 h-10 text-amber-500" />
                            <HelpCircle className="w-4 h-4 absolute -top-1 -right-1 text-amber-500" />
                          </div>
                        ) : species ? (
                          <PokemonSprite
                            pokemonId={species.id}
                            name={species.name}
                            className="w-14 h-14"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-accent/50" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getTierColor(item.type)} variant="secondary">
                            {getTierLabel(item.type)}
                          </Badge>
                          {item.isShiny && (
                            <Badge className="bg-yellow-500/20 text-yellow-600">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Shiny
                            </Badge>
                          )}
                        </div>
                        <p className="font-semibold">
                          {isGambler 
                            ? 'Mystery Box' 
                            : species?.name || `${item.eggRarity} Egg`
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isGambler 
                            ? '1% legendary/shiny chance!' 
                            : species 
                              ? `#${species.id.toString().padStart(3, '0')}`
                              : 'Incubation required'
                          }
                        </p>
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

        {purchasedCount >= maxPurchases && (
          <Card className="border-destructive/50">
            <CardContent className="py-4 text-center text-muted-foreground">
              <p className="font-semibold text-destructive">SOLD OUT</p>
              <p className="text-sm">Come back tomorrow for new items!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ShopPage;
