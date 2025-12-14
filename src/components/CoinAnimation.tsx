import { useEffect, useState } from 'react';
import { Coins, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoinAnimationProps {
  amount: number;
  onComplete?: () => void;
}

export const CoinAnimation = ({ amount, onComplete }: CoinAnimationProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [showTotal, setShowTotal] = useState(false);

  useEffect(() => {
    // Create sparkle particles
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.cos((i / 12) * Math.PI * 2) * 60,
      y: Math.sin((i / 12) * Math.PI * 2) * 60,
      delay: i * 0.05,
    }));
    setParticles(newParticles);

    // Show total after particles
    const timer = setTimeout(() => setShowTotal(true), 300);
    const completeTimer = setTimeout(() => onComplete?.(), 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [amount, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="relative">
        {/* Central coin */}
        <div className="relative animate-bounce">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 flex items-center justify-center shadow-2xl">
            <Coins className="w-10 h-10 text-yellow-800" />
          </div>
          {/* Glow */}
          <div className="absolute inset-0 rounded-full bg-yellow-400/50 blur-xl animate-pulse" />
        </div>

        {/* Sparkle particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute top-1/2 left-1/2 w-3 h-3"
            style={{
              animation: `particle-fly 0.8s ease-out ${particle.delay}s forwards`,
              '--tx': `${particle.x}px`,
              '--ty': `${particle.y}px`,
            } as React.CSSProperties}
          >
            <Sparkles className="w-full h-full text-yellow-400" />
          </div>
        ))}

        {/* Amount display */}
        {showTotal && (
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 animate-scale-in">
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-6 py-3 rounded-full font-bold text-2xl shadow-xl">
              <span>+{amount}</span>
              <Coins className="w-6 h-6" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
