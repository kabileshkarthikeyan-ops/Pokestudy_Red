import { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { CoinCounter } from './CoinCounter';
import { useGameState } from '@/hooks/useGameState';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { state } = useGameState();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Study Pokédex
          </h1>
          <CoinCounter coins={state.coins} showAnimation />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {children}
      </main>

      {/* Navigation */}
      <Navigation />
    </div>
  );
};
