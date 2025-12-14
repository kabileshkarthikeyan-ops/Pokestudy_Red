export type PokemonType = 
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythical';

export interface PokemonSpecies {
  id: number;
  name: string;
  types: PokemonType[];
  rarity: Rarity;
  evolvesFrom?: number;
  evolvesTo?: number[];
  evolutionBranch?: boolean;
}

export interface OwnedPokemon {
  uniqueId: string;
  speciesId: number;
  level: number;
  xp: number;
  caughtAt: number;
  isFavorite: boolean;
  group?: string;
  nickname?: string;
  nature?: string;
  ability?: string;
  moves?: string[];
  isRoaming?: boolean;
  friendship?: number;
  isHatched?: boolean; // Hatched Pokemon have better stats
  berryBoost?: number; // Stat boost from berries
}

export type BurnoutMode = 'vacation' | 'standard' | 'exam';

export type QuestCategory = 'study' | 'health' | 'consistency' | 'challenge';

export interface Egg {
  id: string;
  speciesId: number;
  rarity: Rarity;
  incubationProgress: number; // 0-100
  requiredMinutes: number;
  purchasedAt: number;
  isShiny?: boolean;
  isPaused?: boolean;
  lastTickAt?: number;
}

export interface DailyQuest {
  id: string;
  type: QuestCategory;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  reward: { type: 'coins' | 'friendship' | 'berries' | 'pokemon'; amount: number; speciesId?: number };
}

export interface ShopItem {
  id: string;
  type: 'bargain' | 'premium' | 'gambler';
  speciesId?: number;
  eggRarity?: Rarity;
  price: number;
  purchased: boolean;
  isShiny?: boolean;
}

export interface DailySummary {
  date: string;
  minutesStudied: number;
  coinsEarned: number;
  pokemonCaught: number;
  pokemonEvolved: number;
  eggsHatched: number;
  questsCompleted: number;
}

export interface GameState {
  coins: number;
  berries: number;
  ownedPokemon: OwnedPokemon[];
  pokedexSeen: number[];
  pokedexCaught: number[];
  tradesToday: { before12: boolean; after12: boolean };
  lastTradeDate: string;
  studyHistory: StudyEntry[];
  customGroups: string[];
  settings: GameSettings;
  // Phase 3 systems
  eggs: Egg[];
  dailyQuests: DailyQuest[];
  dailyShop: ShopItem[];
  lastShopDate: string;
  lastQuestDate: string;
  questStreak: number;
  researchStamps: number;
  dailySummary?: DailySummary;
  showDailySummary?: boolean;
}

export interface StudyEntry {
  date: string;
  minutes: number;
  coinsEarned: number;
}

export interface GameSettings {
  theme: 'light' | 'dark' | 'amoled';
  animations: 'full' | 'reduced' | 'off';
  uiScale: 'small' | 'medium' | 'large';
  coinConversion: number;
  roamingBackground?: string;
  purchasedBackgrounds?: string[];
  roamingPokemon?: string[];
  burnoutMode: BurnoutMode;
  visibleNavItems: string[];
}

export const DEFAULT_GAME_STATE: GameState = {
  coins: 0,
  berries: 0,
  ownedPokemon: [],
  pokedexSeen: [],
  pokedexCaught: [],
  tradesToday: { before12: false, after12: false },
  lastTradeDate: '',
  studyHistory: [],
  customGroups: ['Favorites'],
  settings: {
    theme: 'light',
    animations: 'full',
    uiScale: 'medium',
    coinConversion: 60,
    burnoutMode: 'standard',
    visibleNavItems: ['/', '/catch', '/evolve', '/trade', '/collection', '/pokedex', '/roaming', '/settings'],
  },
  eggs: [],
  dailyQuests: [],
  dailyShop: [],
  lastShopDate: '',
  lastQuestDate: '',
  questStreak: 0,
  researchStamps: 0,
};
