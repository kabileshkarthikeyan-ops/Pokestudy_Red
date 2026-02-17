import { ReactNode, useEffect } from 'react';
import { Navigation } from './Navigation';
import { CoinCounter } from './CoinCounter';
import { useGameState } from '@/hooks/useGameState';

interface LayoutProps {
  children: ReactNode;
}

// Text size classes
const TEXT_SIZE_CLASSES = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
};

// Popup size classes (for dialog max-width)
const POPUP_SIZE_STYLES = {
  compact: '--popup-max-width: 20rem',
  normal: '--popup-max-width: 28rem',
  large: '--popup-max-width: 36rem',
};

export const Layout = ({ children }: LayoutProps) => {
  const { state } = useGameState();
  
  // Apply text size and popup size to document
  useEffect(() => {
    const root = document.documentElement;
    const textSize = state.settings.textSize || 'medium';
    const popupSize = state.settings.popupSize || 'normal';
    
    // Remove old text size classes
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    root.classList.add(TEXT_SIZE_CLASSES[textSize]);
    
    // Set popup size CSS variable
    root.style.setProperty('--popup-max-width', 
      popupSize === 'compact' ? '20rem' : 
      popupSize === 'large' ? '36rem' : '28rem'
    );
  }, [state.settings.textSize, state.settings.popupSize]);

  return (
    <div className="min-h-screen bg-background pb-20" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Pokestudy Red
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
