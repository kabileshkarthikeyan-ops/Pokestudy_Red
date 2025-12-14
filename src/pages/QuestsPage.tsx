import { useState } from 'react';
import { Scroll, Clock, Target, Zap, Award, Star, CheckCircle2, Heart, Sparkles, Dumbbell } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useGameState } from '@/hooks/useGameState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { DailyQuest, QuestCategory } from '@/types/pokemon';

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

  const getQuestIcon = (type: QuestCategory) => {
    switch (type) {
      case 'study': return Clock;
      case 'health': return Heart;
      case 'consistency': return Target;
      case 'challenge': return Dumbbell;
      default: return Zap;
    }
  };

  const getQuestColor = (type: QuestCategory) => {
    switch (type) {
      case 'study': return 'text-blue-500 bg-blue-500/10';
      case 'health': return 'text-pink-500 bg-pink-500/10';
      case 'consistency': return 'text-green-500 bg-green-500/10';
      case 'challenge': return 'text-purple-500 bg-purple-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'coins': return '🪙';
      case 'berries': return '🫐';
      case 'friendship': return '💖';
      case 'pokemon': return '✨';
      default: return '🎁';
    }
  };

  const handleClaim = (quest: DailyQuest) => {
    if (quest.completed) return;

    setClaimingId(quest.id);
    setTimeout(() => {
      claimQuestReward(quest.id);
      const rewardIcon = getRewardIcon(quest.reward.type);
      toast({
        title: 'Quest completed!',
        description: `Claimed ${quest.reward.amount} ${rewardIcon} ${quest.reward.type}!`
      });
      setClaimingId(null);
    }, 500);
  };

  const completedCount = state.dailyQuests.filter(q => q.completed).length;
  const allCompleted = completedCount === state.dailyQuests.length && state.dailyQuests.length > 0;

  const isSunday = new Date().getDay() === 0;

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scroll className="w-6 h-6" />
            Daily Quests
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {state.researchStamps} stamps
            </Badge>
          </div>
        </div>

        {/* Quest Streak & Berries */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10">
            <CardContent className="py-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-bold">{state.questStreak} day streak</p>
                  <p className="text-xs text-muted-foreground">
                    {7 - (state.researchStamps % 7)} to Master Ball
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
            <CardContent className="py-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🫐</span>
                <div>
                  <p className="text-sm font-bold">{state.berries || 0} Berries</p>
                  <p className="text-xs text-muted-foreground">
                    Feed to Pokémon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stamp Progress */}
        <Card>
          <CardContent className="py-3">
            <div className="flex justify-between text-sm mb-2">
              <span>Weekly Progress</span>
              <span>{state.researchStamps % 7}/7 stamps</span>
            </div>
            <Progress value={(state.researchStamps % 7) / 7 * 100} className="h-2" />
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
                        'p-2 rounded-lg',
                        getQuestColor(quest.type)
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{quest.title}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {getRewardIcon(quest.reward.type)} +{quest.reward.amount}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {quest.description}
                        </p>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {quest.type}
                        </Badge>
                      </div>

                      <div className="ml-2">
                        {isClaimed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleClaim(quest)}
                            disabled={claimingId === quest.id}
                          >
                            {claimingId === quest.id ? '...' : 'Claim'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* All Quests Completed */}
        {allCompleted && (
          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/50">
            <CardContent className="py-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="font-bold text-green-600 dark:text-green-400">
                All Quests Complete!
              </p>
              <p className="text-sm text-muted-foreground">
                +1 Research Stamp earned!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quest Info */}
        <Card>
          <CardContent className="py-4">
            <h3 className="font-semibold mb-2">Quest Categories</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-muted-foreground">Study</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-muted-foreground">Health</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">Consistency</span>
              </div>
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-purple-500" />
                <span className="text-muted-foreground">Challenge</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default QuestsPage;
