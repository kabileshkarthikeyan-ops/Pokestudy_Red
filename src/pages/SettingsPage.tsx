import { Settings, Moon, Sun, Zap, Gauge, RotateCcw, Download, Upload } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useGameState } from '@/hooks/useGameState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const SettingsPage = () => {
  const { state, updateSettings, resetGame } = useGameState();
  const { toast } = useToast();

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (state.settings.theme === 'dark' || state.settings.theme === 'amoled') {
      root.classList.add('dark');
    }
    
    if (state.settings.theme === 'amoled') {
      root.style.setProperty('--background', '0 0% 0%');
      root.style.setProperty('--card', '0 0% 5%');
    } else {
      root.style.removeProperty('--background');
      root.style.removeProperty('--card');
    }
  }, [state.settings.theme]);

  const handleExport = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-pokedex-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Backup exported',
      description: 'Your data has been downloaded.',
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          localStorage.setItem('study-pokedex-state', JSON.stringify(data));
          window.location.reload();
        } catch {
          toast({
            title: 'Import failed',
            description: 'Invalid backup file.',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    resetGame();
    toast({
      title: 'Game reset',
      description: 'All data has been cleared.',
    });
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Settings
        </h1>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sun className="w-5 h-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Theme</Label>
              <Select 
                value={state.settings.theme} 
                onValueChange={(v) => updateSettings({ theme: v as any })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <span className="flex items-center gap-2">
                      <Sun className="w-4 h-4" /> Light
                    </span>
                  </SelectItem>
                  <SelectItem value="dark">
                    <span className="flex items-center gap-2">
                      <Moon className="w-4 h-4" /> Dark
                    </span>
                  </SelectItem>
                  <SelectItem value="amoled">AMOLED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>UI Scale</Label>
              <Select 
                value={state.settings.uiScale} 
                onValueChange={(v) => updateSettings({ uiScale: v as any })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Animations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Animations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label>Animation Level</Label>
              <Select 
                value={state.settings.animations} 
                onValueChange={(v) => updateSettings({ animations: v as any })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full</SelectItem>
                  <SelectItem value="reduced">Reduced</SelectItem>
                  <SelectItem value="off">Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Game Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              Game Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Coin Conversion Rate</Label>
                <span className="text-sm text-muted-foreground">
                  {state.settings.coinConversion} min = 1 coin
                </span>
              </div>
              <Slider
                value={[state.settings.coinConversion]}
                onValueChange={([v]) => updateSettings({ coinConversion: v })}
                min={15}
                max={120}
                step={15}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>15 min</span>
                <span>120 min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Backup
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleImport}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Backup
            </Button>

            <Separator />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your progress, including:
                    <ul className="list-disc list-inside mt-2">
                      <li>All caught Pokémon</li>
                      <li>All earned coins</li>
                      <li>Pokédex progress</li>
                      <li>Study history</li>
                    </ul>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>
                    Yes, reset everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Study Time</p>
                <p className="font-bold text-lg">
                  {Math.floor(state.studyHistory.reduce((acc, e) => acc + e.minutes, 0) / 60)}h{' '}
                  {state.studyHistory.reduce((acc, e) => acc + e.minutes, 0) % 60}m
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Coins Earned</p>
                <p className="font-bold text-lg">
                  {state.studyHistory.reduce((acc, e) => acc + e.coinsEarned, 0)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Pokémon Caught</p>
                <p className="font-bold text-lg">{state.pokedexCaught.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Study Sessions</p>
                <p className="font-bold text-lg">{state.studyHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardContent className="py-4 text-center text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Study Time Pokédex</p>
            <p>Version 1.0.0</p>
            <p className="mt-2">Turn study time into Pokémon adventures!</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SettingsPage;
