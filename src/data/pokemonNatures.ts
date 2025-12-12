// Pokemon natures affect behavior in roaming mode
export interface Nature {
  id: string;
  name: string;
  increasedStat: string;
  decreasedStat: string;
  behaviorModifier: 'bold' | 'timid' | 'playful' | 'calm' | 'lazy';
}

export const NATURES: Nature[] = [
  { id: 'hardy', name: 'Hardy', increasedStat: 'Attack', decreasedStat: 'Attack', behaviorModifier: 'calm' },
  { id: 'lonely', name: 'Lonely', increasedStat: 'Attack', decreasedStat: 'Defense', behaviorModifier: 'timid' },
  { id: 'brave', name: 'Brave', increasedStat: 'Attack', decreasedStat: 'Speed', behaviorModifier: 'bold' },
  { id: 'adamant', name: 'Adamant', increasedStat: 'Attack', decreasedStat: 'Sp. Attack', behaviorModifier: 'bold' },
  { id: 'naughty', name: 'Naughty', increasedStat: 'Attack', decreasedStat: 'Sp. Defense', behaviorModifier: 'playful' },
  { id: 'bold', name: 'Bold', increasedStat: 'Defense', decreasedStat: 'Attack', behaviorModifier: 'bold' },
  { id: 'docile', name: 'Docile', increasedStat: 'Defense', decreasedStat: 'Defense', behaviorModifier: 'calm' },
  { id: 'relaxed', name: 'Relaxed', increasedStat: 'Defense', decreasedStat: 'Speed', behaviorModifier: 'lazy' },
  { id: 'impish', name: 'Impish', increasedStat: 'Defense', decreasedStat: 'Sp. Attack', behaviorModifier: 'playful' },
  { id: 'lax', name: 'Lax', increasedStat: 'Defense', decreasedStat: 'Sp. Defense', behaviorModifier: 'lazy' },
  { id: 'timid', name: 'Timid', increasedStat: 'Speed', decreasedStat: 'Attack', behaviorModifier: 'timid' },
  { id: 'hasty', name: 'Hasty', increasedStat: 'Speed', decreasedStat: 'Defense', behaviorModifier: 'playful' },
  { id: 'serious', name: 'Serious', increasedStat: 'Speed', decreasedStat: 'Speed', behaviorModifier: 'calm' },
  { id: 'jolly', name: 'Jolly', increasedStat: 'Speed', decreasedStat: 'Sp. Attack', behaviorModifier: 'playful' },
  { id: 'naive', name: 'Naive', increasedStat: 'Speed', decreasedStat: 'Sp. Defense', behaviorModifier: 'playful' },
  { id: 'modest', name: 'Modest', increasedStat: 'Sp. Attack', decreasedStat: 'Attack', behaviorModifier: 'calm' },
  { id: 'mild', name: 'Mild', increasedStat: 'Sp. Attack', decreasedStat: 'Defense', behaviorModifier: 'timid' },
  { id: 'quiet', name: 'Quiet', increasedStat: 'Sp. Attack', decreasedStat: 'Speed', behaviorModifier: 'lazy' },
  { id: 'bashful', name: 'Bashful', increasedStat: 'Sp. Attack', decreasedStat: 'Sp. Attack', behaviorModifier: 'timid' },
  { id: 'rash', name: 'Rash', increasedStat: 'Sp. Attack', decreasedStat: 'Sp. Defense', behaviorModifier: 'bold' },
  { id: 'calm', name: 'Calm', increasedStat: 'Sp. Defense', decreasedStat: 'Attack', behaviorModifier: 'calm' },
  { id: 'gentle', name: 'Gentle', increasedStat: 'Sp. Defense', decreasedStat: 'Defense', behaviorModifier: 'timid' },
  { id: 'sassy', name: 'Sassy', increasedStat: 'Sp. Defense', decreasedStat: 'Speed', behaviorModifier: 'bold' },
  { id: 'careful', name: 'Careful', increasedStat: 'Sp. Defense', decreasedStat: 'Sp. Attack', behaviorModifier: 'calm' },
  { id: 'quirky', name: 'Quirky', increasedStat: 'Sp. Defense', decreasedStat: 'Sp. Defense', behaviorModifier: 'playful' },
];

export const getRandomNature = (): string => {
  return NATURES[Math.floor(Math.random() * NATURES.length)].id;
};

export const getNatureById = (id: string): Nature | undefined => {
  return NATURES.find(n => n.id === id);
};
