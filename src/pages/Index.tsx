import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Target, Sparkles, ArrowLeftRight, Coins, BookOpen, TrendingUp } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useGameState } from '@/hooks/useGameState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Index = () => {
  const navigate = useNavigate();
  const { state, addCoins, canTrade } = useGameState();
  const { toast } = useToast();
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState<number | null>(null);

  const handleStudySubmit = () => {
    const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
    
    if (totalMinutes <= 0) {
      toast({
        title: 'Enter study time',
        description: 'Please enter how long you studied.',
        variant: 'destructive',
      });
      return;
    }

    setIsConverting(true);
    const coins = addCoins(totalMinutes);
    setEarnedCoins(coins);

    setTimeout(() => {
      setIsConverting(false);
      setHours('');
      setMinutes('');
      
      if (coins > 0) {
        toast({
          title: `+${coins} coins earned!`,
          description: `Great job studying for ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m!`,
        });
      } else {
        toast({
          title: 'Keep going!',
          description: `Study for ${state.settings.coinConversion} minutes to earn a coin.`,
        });
      }
      
      setTimeout(() => setEarnedCoins(null), 2000);
    }, 800);
  };

  const actions = [
    {
      icon: Target,
      label: 'Catch',
      cost: 3,
      path: '/catch',
      color: 'bg-pokemon-grass',
      disabled: state.coins < 3,
    },
    {
      icon: Sparkles,
      label: 'Evolve',
      cost: 2,
      path: '/evolve',
      color: 'bg-pokemon-psychic',
      disabled: state.coins < 2 || state.ownedPokemon.length === 0,
    },
    {
      icon: ArrowLeftRight,
      label: 'Trade',
      cost: 1,
      path: '/trade',
      color: 'bg-pokemon-water',
      disabled: state.coins < 1 || !canTrade() || state.ownedPokemon.length === 0,
    },
  ];

  const tradeAvailable = canTrade();
  const now = new Date();
  const isBefore12 = now.getHours() < 12;

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Study Input Section */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Log Study Time
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  max="24"
                  placeholder="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="text-center text-lg font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minutes">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="text-center text-lg font-semibold"
                />
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {state.settings.coinConversion} min = 1 coin
            </div>

            <Button
              onClick={handleStudySubmit}
              disabled={isConverting}
              className="w-full h-12 text-lg font-bold relative overflow-hidden"
            >
              {isConverting ? (
                <span className="flex items-center gap-2">
                  <Coins className="w-5 h-5 coin-spin" />
                  Converting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Convert to Coins
                </span>
              )}
            </Button>

            {/* Floating coins animation */}
            {earnedCoins !== null && earnedCoins > 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <span className="text-4xl font-bold text-primary float-up">
                  +{earnedCoins}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {actions.map(({ icon: Icon, label, cost, path, color, disabled }) => (
              <Button
                key={label}
                variant="outline"
                onClick={() => navigate(path)}
                disabled={disabled}
                className={cn(
                  'h-auto py-4 flex flex-col gap-2 relative overflow-hidden group',
                  !disabled && 'hover:border-primary'
                )}
              >
                <div className={cn(
                  'p-2 rounded-full transition-transform group-hover:scale-110',
                  color,
                  disabled && 'opacity-50'
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold">{label}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Coins className="w-3 h-3" /> {cost}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Trade Status */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Trade Window</h3>
                <p className="text-sm text-muted-foreground">
                  {isBefore12 ? 'Morning' : 'Afternoon'} trade: {' '}
                  <span className={tradeAvailable ? 'text-success' : 'text-destructive'}>
                    {tradeAvailable ? 'Available' : 'Used'}
                  </span>
                </p>
              </div>
              <ArrowLeftRight className={cn(
                'w-8 h-8',
                tradeAvailable ? 'text-success' : 'text-muted-foreground'
              )} />
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/collection')}>
            <CardContent className="py-4 text-center">
              <p className="text-3xl font-bold text-primary">{state.ownedPokemon.length}</p>
              <p className="text-sm text-muted-foreground">Pokémon Owned</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/pokedex')}>
            <CardContent className="py-4 text-center">
              <p className="text-3xl font-bold text-accent">{state.pokedexCaught.length}</p>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <BookOpen className="w-4 h-4" /> Pokédex
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
