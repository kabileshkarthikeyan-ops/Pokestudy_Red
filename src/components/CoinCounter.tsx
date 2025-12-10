import { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoinCounterProps {
  coins: number;
  className?: string;
  showAnimation?: boolean;
}

export const CoinCounter = ({ coins, className, showAnimation = false }: CoinCounterProps) => {
  const [displayCoins, setDisplayCoins] = useState(coins);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (coins !== displayCoins) {
      setIsAnimating(true);
      const diff = coins - displayCoins;
      const step = diff > 0 ? 1 : -1;
      const interval = setInterval(() => {
        setDisplayCoins(prev => {
          if (prev === coins) {
            clearInterval(interval);
            setIsAnimating(false);
            return prev;
          }
          return prev + step;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [coins, displayCoins]);

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20',
        isAnimating && 'coin-glow',
        className
      )}
    >
      <Coins 
        className={cn(
          'w-6 h-6 text-primary',
          isAnimating && showAnimation && 'coin-spin'
        )} 
      />
      <span className="font-bold text-lg text-foreground tabular-nums">
        {displayCoins}
      </span>
    </div>
  );
};
