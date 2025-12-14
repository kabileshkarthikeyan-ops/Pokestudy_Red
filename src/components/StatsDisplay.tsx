import { getBaseStats, getStatColor, getStatPercent } from '@/data/pokemonStats';

interface StatsDisplayProps {
  pokemonId: number;
  compact?: boolean;
}

const STAT_NAMES = [
  { key: 'hp', label: 'HP', short: 'HP' },
  { key: 'attack', label: 'Attack', short: 'Atk' },
  { key: 'defense', label: 'Defense', short: 'Def' },
  { key: 'spAttack', label: 'Sp. Atk', short: 'SpA' },
  { key: 'spDefense', label: 'Sp. Def', short: 'SpD' },
  { key: 'speed', label: 'Speed', short: 'Spe' },
];

export const StatsDisplay = ({ pokemonId, compact = false }: StatsDisplayProps) => {
  const stats = getBaseStats(pokemonId);

  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-1 text-[10px]">
        {STAT_NAMES.map(({ key, short }) => {
          const value = stats[key as keyof typeof stats] as number;
          return (
            <div key={key} className="flex items-center gap-1">
              <span className="text-muted-foreground w-6">{short}</span>
              <span className="font-bold">{value}</span>
            </div>
          );
        })}
        <div className="col-span-3 border-t pt-1 mt-1">
          <span className="text-muted-foreground">Total: </span>
          <span className="font-bold">{stats.total}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {STAT_NAMES.map(({ key, label }) => {
        const value = stats[key as keyof typeof stats] as number;
        const percent = getStatPercent(value);
        const color = getStatColor(value);

        return (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-16">{label}</span>
            <span className="text-xs font-bold w-8 text-right">{value}</span>
            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percent}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-2 pt-1 border-t">
        <span className="text-xs font-medium">Total</span>
        <span className="text-sm font-bold ml-auto">{stats.total}</span>
      </div>
    </div>
  );
};
