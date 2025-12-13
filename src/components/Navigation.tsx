import { NavLink, useLocation } from 'react-router-dom';
import { Home, Target, Sparkles, ArrowLeftRight, Grid3X3, BookOpen, PawPrint, Settings, Store, Egg, Scroll } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameState } from '@/hooks/useGameState';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const allNavItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/catch', icon: Target, label: 'Catch' },
  { path: '/evolve', icon: Sparkles, label: 'Evolve' },
  { path: '/trade', icon: ArrowLeftRight, label: 'Trade' },
  { path: '/collection', icon: Grid3X3, label: 'Box' },
  { path: '/pokedex', icon: BookOpen, label: 'Dex' },
  { path: '/roaming', icon: PawPrint, label: 'Roam' },
  { path: '/shop', icon: Store, label: 'Shop' },
  { path: '/incubator', icon: Egg, label: 'Eggs' },
  { path: '/quests', icon: Scroll, label: 'Quests' },
  { path: '/settings', icon: Settings, label: 'Set' },
];

export const Navigation = () => {
  const location = useLocation();
  const { state } = useGameState();

  const visiblePaths = state.settings.visibleNavItems || allNavItems.map(i => i.path);
  const navItems = allNavItems.filter(item => visiblePaths.includes(item.path));

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50">
      <div className="max-w-lg mx-auto">
        <ScrollArea className="w-full">
          <div className="flex items-center py-2 px-2 gap-1 min-w-max">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <NavLink
                  key={path}
                  to={path}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 shrink-0',
                    isActive 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive && 'scale-110')} />
                  <span className="text-[10px] font-medium">{label}</span>
                </NavLink>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="h-1" />
        </ScrollArea>
      </div>
    </nav>
  );
};

export { allNavItems };
