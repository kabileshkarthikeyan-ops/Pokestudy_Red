import { NavLink, useLocation } from 'react-router-dom';
import { Home, Target, Sparkles, ArrowLeftRight, Grid3X3, BookOpen, PawPrint, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/catch', icon: Target, label: 'Catch' },
  { path: '/evolve', icon: Sparkles, label: 'Evolve' },
  { path: '/trade', icon: ArrowLeftRight, label: 'Trade' },
  { path: '/collection', icon: Grid3X3, label: 'Box' },
  { path: '/pokedex', icon: BookOpen, label: 'Dex' },
  { path: '/roaming', icon: PawPrint, label: 'Roam' },
  { path: '/settings', icon: Settings, label: 'Set' },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50">
      <div className="max-w-lg mx-auto px-2">
        <div className="flex justify-around items-center py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <NavLink
                key={path}
                to={path}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all duration-200',
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
      </div>
    </nav>
  );
};
