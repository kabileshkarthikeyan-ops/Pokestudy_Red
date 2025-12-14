import { Clock, Coins, Star, Egg, CheckCircle, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DailySummary } from '@/types/pokemon';

interface DailySummaryDialogProps {
  summary: DailySummary;
  open: boolean;
  onClose: () => void;
}

export const DailySummaryDialog = ({ summary, open, onClose }: DailySummaryDialogProps) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const stats = [
    { icon: Clock, label: 'Time Studied', value: formatTime(summary.minutesStudied), color: 'text-blue-500' },
    { icon: Coins, label: 'Coins Earned', value: summary.coinsEarned.toString(), color: 'text-yellow-500' },
    { icon: Star, label: 'Pokémon Caught', value: summary.pokemonCaught.toString(), color: 'text-purple-500' },
    { icon: Award, label: 'Pokémon Evolved', value: summary.pokemonEvolved.toString(), color: 'text-green-500' },
    { icon: Egg, label: 'Eggs Hatched', value: summary.eggsHatched.toString(), color: 'text-pink-500' },
    { icon: CheckCircle, label: 'Quests Done', value: summary.questsCompleted.toString(), color: 'text-emerald-500' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Daily Summary</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            {new Date(summary.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ icon: Icon, label, value, color }) => (
              <Card key={label} className="overflow-hidden">
                <CardContent className="p-3 text-center">
                  <Icon className={`w-6 h-6 mx-auto mb-1 ${color}`} />
                  <p className="text-lg font-bold">{value}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {summary.minutesStudied >= 60 && (
            <Card className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50">
              <CardContent className="py-3 text-center">
                <p className="font-bold text-yellow-600 dark:text-yellow-400">
                  🔥 Great Focus Session!
                </p>
                <p className="text-sm text-muted-foreground">
                  You studied for over an hour!
                </p>
              </CardContent>
            </Card>
          )}

          <Button onClick={onClose} className="w-full">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
