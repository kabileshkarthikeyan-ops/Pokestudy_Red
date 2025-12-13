import { useState } from 'react';
import { Scroll, Clock, Target, Zap, Award, Star, CheckCircle2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useGameState } from '@/hooks/useGameState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { DailyQuest } from '@/types/pokemon';

const QuestsPage = () => {
  const { state, claimQuestReward, refreshQuests } = useGameState();
  const { toast } = useToast();
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const today = new Date().toDateString();
  const isNewDay = state.lastQuestDate !== today;

  // Auto-refresh quests on new day
  if (isNewDay && state.dailyQuests.length > 0) {
    refreshQuests();
  }

  const getQuestIcon = (type: DailyQuest['type']) => {
    switch (type) {
      case 'endurance': return Clock;
      case 'punctuality': return Target;
      case 'dedication': return Zap;
    }
  };

  const getQuestColor = (type: DailyQuest['type']) => {
    switch (type) {
      case 'endurance': return 'text-blue-500';
      case 'punctuality': return 'text-green-500';
      case 'dedication': return 'text-purple-500';
    }
  };

  const handleClaim = (quest: DailyQuest) => {
    if (!quest.completed || quest.progress < quest.target) return;

    setClaimingId(quest.id);
    setTimeout(() => {
      claimQuestReward(quest.id);
      toast({
        title: 'Quest completed!',
        description: `Claimed ${quest.reward.amount} ${quest.reward.type}!`
      });
      setClaimingId(null);
    }, 500);
  };

  const completedCount = state.dailyQuests.filter(q => q.completed).length;
  const allCompleted = completedCount === 3;

  const isSunday = new Date().getDay() === 0;

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scroll className="w-6 h-6" />
            Professor's Research
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {state.researchStamps} stamps
            </Badge>
          </div>
        </div>

        {/* Quest Streak */}
        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span className="font-medium">Quest Streak</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{state.questStreak} days</p>
                <p className="text-xs text-muted-foreground">
                  {7 - (state.researchStamps % 7)} stamps to Master Ball
                </p>
              </div>
            </div>
            <Progress value={(state.researchStamps % 7) / 7 * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Sunday Boss Event */}
        {isSunday && (
          <Card className="border-2 border-purple-500/50 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <Zap className="w-5 h-5" />
                Elite Research Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">Study for 5 hours today for a guaranteed Legendary encounter!</p>
              <Progress value={Math.min(100, (state.studyHistory
                .filter(e => new Date(e.date).toDateString() === today)
                .reduce((sum, e) => sum + e.minutes, 0) / 300) * 100)} 
                className="h-2" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                {state.studyHistory
                  .filter(e => new Date(e.date).toDateString() === today)
                  .reduce((sum, e) => sum + e.minutes, 0)} / 300 minutes
              </p>
            </CardContent>
          </Card>
        )}

        {/* Daily Quests */}
        {state.dailyQuests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Scroll className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No quests available</p>
              <Button onClick={() => refreshQuests()}>Get Today's Quests</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {state.dailyQuests.map((quest) => {
              const Icon = getQuestIcon(quest.type);
              const progress = Math.min(100, (quest.progress / quest.target) * 100);
              const isComplete = quest.progress >= quest.target;
              const isClaimed = quest.completed;

              return (
                <Card 
                  key={quest.id}
                  className={cn(
                    'transition-all',
                    isClaimed && 'opacity-60'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'p-2 rounded-lg bg-muted',
                        getQuestColor(quest.type)
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{quest.title}</h3>
                          <Badge variant="secondary" className="text-xs">
                            +{quest.reward.amount} {quest.reward.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {quest.description}
                        </p>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{quest.progress} / {quest.target}</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>

                      <div className="ml-2">
                        {isClaimed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : isComplete ? (
                          <Button 
                            size="sm"
                            onClick={() => handleClaim(quest)}
                            disabled={claimingId === quest.id}
                          >
                            {claimingId === quest.id ? '...' : 'Claim'}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* All Quests Completed */}
        {allCompleted && state.dailyQuests.length > 0 && (
          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/50">
            <CardContent className="py-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="font-bold text-green-600 dark:text-green-400">
                All Research Complete!
              </p>
              <p className="text-sm text-muted-foreground">
                +1 Research Stamp earned!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default QuestsPage;
