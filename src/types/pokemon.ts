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
}

export interface GameState {
  coins: number;
  ownedPokemon: OwnedPokemon[];
  pokedexSeen: number[];
  pokedexCaught: number[];
  tradesToday: { before12: boolean; after12: boolean };
  lastTradeDate: string;
  studyHistory: StudyEntry[];
  customGroups: string[];
  settings: GameSettings;
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
  coinConversion: number; // minutes per coin
  roamingBackground?: string;
  purchasedBackgrounds?: string[];
  roamingPokemon?: string[]; // uniqueIds of Pokemon set to roam
}

export const DEFAULT_GAME_STATE: GameState = {
  coins: 0,
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
    coinConversion: 60, // 60 minutes = 1 coin
  },
};
