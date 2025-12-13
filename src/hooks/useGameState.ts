import { useState, useEffect, useCallback } from 'react';
import { GameState, OwnedPokemon, DEFAULT_GAME_STATE, StudyEntry, Egg, DailyQuest, ShopItem } from '@/types/pokemon';
import { POKEMON_DATABASE, RARITY_WEIGHTS, getPokemonById } from '@/data/pokemonDatabase';
import { getRandomNature } from '@/data/pokemonNatures';

const STORAGE_KEY = 'study-pokedex-state';

// Generate daily shop items based on date seed
const generateShopItems = (dateSeed: string): ShopItem[] => {
  const seed = dateSeed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (index: number) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };

  const items: ShopItem[] = [];
  
  // Bargain Bin (2 common/uncommon)
  const commonPokemon = POKEMON_DATABASE.filter(p => p.rarity === 'common' || p.rarity === 'uncommon');
  for (let i = 0; i < 2; i++) {
    const pokemon = commonPokemon[Math.floor(random(i) * commonPokemon.length)];
    items.push({
      id: `bargain-${i}-${dateSeed}`,
      type: 'bargain',
      speciesId: pokemon.id,
      price: 2 + Math.floor(random(i + 10) * 3),
      purchased: false,
    });
  }

  // Premium Shelf (1 rare/starter)
  const rarePokemon = POKEMON_DATABASE.filter(p => p.rarity === 'rare');
  const premiumPokemon = rarePokemon[Math.floor(random(100) * rarePokemon.length)];
  items.push({
    id: `premium-${dateSeed}`,
    type: 'premium',
    speciesId: premiumPokemon.id,
    price: 8 + Math.floor(random(101) * 5),
    purchased: false,
  });

  // Gambler's Box
  const isShiny = random(200) < 0.01;
  const isLegendary = random(201) < 0.01;
  let gamblerPokemon;
  if (isLegendary) {
    const legendaries = POKEMON_DATABASE.filter(p => p.rarity === 'legendary' || p.rarity === 'mythical');
    gamblerPokemon = legendaries[Math.floor(random(202) * legendaries.length)];
  } else {
    gamblerPokemon = POKEMON_DATABASE[Math.floor(random(203) * POKEMON_DATABASE.length)];
  }
  items.push({
    id: `gambler-${dateSeed}`,
    type: 'gambler',
    speciesId: gamblerPokemon.id,
    price: 15,
    purchased: false,
    isShiny,
  });

  return items;
};

// Generate daily quests
const generateQuests = (): DailyQuest[] => {
  const questTypes: DailyQuest['type'][] = ['endurance', 'punctuality', 'dedication'];
  
  return questTypes.map((type, i) => {
    let title = '';
    let description = '';
    let target = 0;
    let reward: DailyQuest['reward'] = { type: 'coins', amount: 2 };

    switch (type) {
      case 'endurance':
        target = [30, 45, 60][Math.floor(Math.random() * 3)];
        title = 'Study Marathon';
        description = `Study for ${target} minutes total today`;
        reward = { type: 'coins', amount: Math.floor(target / 15) };
        break;
      case 'punctuality':
        target = 8;
        title = 'Early Bird';
        description = 'Start studying before 8 AM';
        reward = { type: 'coins', amount: 3 };
        break;
      case 'dedication':
        target = 90;
        title = 'Deep Focus';
        description = `Complete a ${target}+ minute session without breaks`;
        reward = { type: 'friendship', amount: 10 };
        break;
    }

    return {
      id: `quest-${type}-${Date.now()}-${i}`,
      type,
      title,
      description,
      target,
      progress: 0,
      completed: false,
      reward,
    };
  });
};

export const useGameState = () => {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_GAME_STATE,
          ...parsed,
          settings: {
            ...DEFAULT_GAME_STATE.settings,
            ...(parsed.settings || {}),
          },
        };
      } catch {
        return DEFAULT_GAME_STATE;
      }
    }
    return DEFAULT_GAME_STATE;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Check and reset daily trades
  useEffect(() => {
    const today = new Date().toDateString();
    if (state.lastTradeDate !== today) {
      setState(prev => ({
        ...prev,
        tradesToday: { before12: false, after12: false },
        lastTradeDate: today,
      }));
    }
  }, [state.lastTradeDate]);

  const getBurnoutMultiplier = useCallback(() => {
    const mode = state.settings.burnoutMode ?? 'standard';
    switch (mode) {
      case 'vacation':
        return 0.5;
      case 'exam':
        return 1.5;
      case 'standard':
      default:
        return 1;
    }
  }, [state.settings.burnoutMode]);

  const addCoins = useCallback((minutes: number) => {
    const multiplier = getBurnoutMultiplier() ?? 1;
    const coinConversion = state.settings.coinConversion || DEFAULT_GAME_STATE.settings.coinConversion;
    const effectiveMinutes = Math.floor(minutes * multiplier);
    const coinsEarned = Math.floor(effectiveMinutes / coinConversion);
    
    const entry: StudyEntry = {
      date: new Date().toISOString(),
      minutes,
      coinsEarned,
    };

    // Update egg incubation
    const updatedEggs = state.eggs.map(egg => ({
      ...egg,
      incubationProgress: Math.min(100, egg.incubationProgress + (minutes / egg.requiredMinutes) * 100),
    }));
    
    setState(prev => ({
      ...prev,
      coins: prev.coins + coinsEarned,
      studyHistory: [...prev.studyHistory, entry],
      eggs: updatedEggs,
    }));
    
    return coinsEarned;
  }, [state.settings.coinConversion, state.eggs, getBurnoutMultiplier]);

  const spendCoins = useCallback((amount: number): boolean => {
    if (state.coins < amount) return false;
    setState(prev => ({ ...prev, coins: prev.coins - amount }));
    return true;
  }, [state.coins]);

  const catchPokemon = useCallback((): OwnedPokemon | null => {
    if (state.coins < 3) return null;

    const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let selectedRarity: keyof typeof RARITY_WEIGHTS = 'common';

    for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
      random -= weight;
      if (random <= 0) {
        selectedRarity = rarity as keyof typeof RARITY_WEIGHTS;
        break;
      }
    }

    const eligiblePokemon = POKEMON_DATABASE.filter(p => p.rarity === selectedRarity);
    const randomPokemon = eligiblePokemon[Math.floor(Math.random() * eligiblePokemon.length)];

    if (!randomPokemon) return null;

    const isDuplicate = state.pokedexCaught.includes(randomPokemon.id);
    
    const newPokemon: OwnedPokemon = {
      uniqueId: `${randomPokemon.id}-${Date.now()}`,
      speciesId: randomPokemon.id,
      level: 1,
      xp: isDuplicate ? 10 : 0,
      caughtAt: Date.now(),
      isFavorite: false,
      nature: getRandomNature(),
      friendship: 70,
    };

    setState(prev => ({
      ...prev,
      coins: prev.coins - 3,
      ownedPokemon: [...prev.ownedPokemon, newPokemon],
      pokedexSeen: [...new Set([...prev.pokedexSeen, randomPokemon.id])],
      pokedexCaught: [...new Set([...prev.pokedexCaught, randomPokemon.id])],
    }));

    return newPokemon;
  }, [state.coins, state.pokedexCaught]);

  const evolvePokemon = useCallback((uniqueId: string, targetEvolutionId?: number): OwnedPokemon | null => {
    if (state.coins < 2) return null;

    const pokemon = state.ownedPokemon.find(p => p.uniqueId === uniqueId);
    if (!pokemon) return null;

    const species = getPokemonById(pokemon.speciesId);
    if (!species?.evolvesTo || species.evolvesTo.length === 0) return null;

    const evolutionId = targetEvolutionId ?? species.evolvesTo[0];
    if (!species.evolvesTo.includes(evolutionId)) return null;

    const evolvedPokemon: OwnedPokemon = {
      ...pokemon,
      speciesId: evolutionId,
      level: pokemon.level + 1,
    };

    setState(prev => ({
      ...prev,
      coins: prev.coins - 2,
      ownedPokemon: prev.ownedPokemon.map(p => 
        p.uniqueId === uniqueId ? evolvedPokemon : p
      ),
      pokedexSeen: [...new Set([...prev.pokedexSeen, evolutionId])],
      pokedexCaught: [...new Set([...prev.pokedexCaught, evolutionId])],
    }));

    return evolvedPokemon;
  }, [state.coins, state.ownedPokemon]);

  const tradePokemon = useCallback((uniqueId: string): OwnedPokemon | null => {
    if (state.coins < 1) return null;

    const now = new Date();
    const isBefore12 = now.getHours() < 12;
    const tradeKey = isBefore12 ? 'before12' : 'after12';

    if (state.tradesToday[tradeKey]) return null;

    const pokemonIndex = state.ownedPokemon.findIndex(p => p.uniqueId === uniqueId);
    if (pokemonIndex === -1) return null;

    const randomSpecies = POKEMON_DATABASE[Math.floor(Math.random() * POKEMON_DATABASE.length)];
    
    const newPokemon: OwnedPokemon = {
      uniqueId: `${randomSpecies.id}-${Date.now()}`,
      speciesId: randomSpecies.id,
      level: 1,
      xp: 0,
      caughtAt: Date.now(),
      isFavorite: false,
      nature: getRandomNature(),
      friendship: 70,
    };

    setState(prev => ({
      ...prev,
      coins: prev.coins - 1,
      ownedPokemon: [
        ...prev.ownedPokemon.slice(0, pokemonIndex),
        newPokemon,
        ...prev.ownedPokemon.slice(pokemonIndex + 1),
      ],
      tradesToday: { ...prev.tradesToday, [tradeKey]: true },
      pokedexSeen: [...new Set([...prev.pokedexSeen, randomSpecies.id])],
      pokedexCaught: [...new Set([...prev.pokedexCaught, randomSpecies.id])],
    }));

    return newPokemon;
  }, [state.coins, state.ownedPokemon, state.tradesToday]);

  const toggleFavorite = useCallback((uniqueId: string) => {
    setState(prev => ({
      ...prev,
      ownedPokemon: prev.ownedPokemon.map(p =>
        p.uniqueId === uniqueId ? { ...p, isFavorite: !p.isFavorite } : p
      ),
    }));
  }, []);

  const setGroup = useCallback((uniqueId: string, group: string | undefined) => {
    setState(prev => ({
      ...prev,
      ownedPokemon: prev.ownedPokemon.map(p =>
        p.uniqueId === uniqueId ? { ...p, group } : p
      ),
    }));
  }, []);

  const addCustomGroup = useCallback((groupName: string) => {
    setState(prev => ({
      ...prev,
      customGroups: [...new Set([...prev.customGroups, groupName])],
    }));
  }, []);

  const updatePokemon = useCallback((uniqueId: string, updates: Partial<OwnedPokemon>) => {
    setState(prev => ({
      ...prev,
      ownedPokemon: prev.ownedPokemon.map(p =>
        p.uniqueId === uniqueId ? { ...p, ...updates } : p
      ),
    }));
  }, []);

  const setRoamingPokemon = useCallback((pokemonIds: string[]) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, roamingPokemon: pokemonIds },
    }));
  }, []);

  const updateSettings = useCallback((settings: Partial<GameState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  }, []);

  const resetGame = useCallback(() => {
    setState(DEFAULT_GAME_STATE);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const canTrade = useCallback(() => {
    const now = new Date();
    const isBefore12 = now.getHours() < 12;
    return isBefore12 ? !state.tradesToday.before12 : !state.tradesToday.after12;
  }, [state.tradesToday]);

  // Shop functions
  const refreshShop = useCallback(() => {
    const today = new Date().toDateString();
    const items = generateShopItems(today);
    setState(prev => ({
      ...prev,
      dailyShop: items,
      lastShopDate: today,
    }));
  }, []);

  const purchaseShopItem = useCallback((itemId: string): { type: 'pokemon' | 'egg'; speciesId?: number; rarity?: string; isShiny?: boolean } | null => {
    const item = state.dailyShop.find(i => i.id === itemId);
    if (!item || item.purchased || state.coins < item.price) return null;

    const purchasedCount = state.dailyShop.filter(i => i.purchased).length;
    if (purchasedCount >= 2) return null;

    const newPokemon: OwnedPokemon = {
      uniqueId: `${item.speciesId}-${Date.now()}`,
      speciesId: item.speciesId!,
      level: 1,
      xp: 0,
      caughtAt: Date.now(),
      isFavorite: false,
      nature: getRandomNature(),
      friendship: 70,
    };

    setState(prev => ({
      ...prev,
      coins: prev.coins - item.price,
      ownedPokemon: [...prev.ownedPokemon, newPokemon],
      dailyShop: prev.dailyShop.map(i => i.id === itemId ? { ...i, purchased: true } : i),
      pokedexSeen: [...new Set([...prev.pokedexSeen, item.speciesId!])],
      pokedexCaught: [...new Set([...prev.pokedexCaught, item.speciesId!])],
    }));

    return { type: 'pokemon', speciesId: item.speciesId, isShiny: item.isShiny };
  }, [state.dailyShop, state.coins]);

  // Incubator functions
  const hatchEgg = useCallback((eggId: string): OwnedPokemon | null => {
    const egg = state.eggs.find(e => e.id === eggId);
    if (!egg || egg.incubationProgress < 100) return null;

    const newPokemon: OwnedPokemon = {
      uniqueId: `${egg.speciesId}-${Date.now()}`,
      speciesId: egg.speciesId,
      level: 1,
      xp: 0,
      caughtAt: Date.now(),
      isFavorite: false,
      nature: getRandomNature(),
      friendship: 70,
    };

    setState(prev => ({
      ...prev,
      eggs: prev.eggs.filter(e => e.id !== eggId),
      ownedPokemon: [...prev.ownedPokemon, newPokemon],
      pokedexSeen: [...new Set([...prev.pokedexSeen, egg.speciesId])],
      pokedexCaught: [...new Set([...prev.pokedexCaught, egg.speciesId])],
    }));

    return newPokemon;
  }, [state.eggs]);

  // Quest functions
  const refreshQuests = useCallback(() => {
    const today = new Date().toDateString();
    const quests = generateQuests();
    setState(prev => ({
      ...prev,
      dailyQuests: quests,
      lastQuestDate: today,
    }));
  }, []);

  const claimQuestReward = useCallback((questId: string) => {
    const quest = state.dailyQuests.find(q => q.id === questId);
    if (!quest || quest.completed) return;

    let updates: Partial<GameState> = {
      dailyQuests: state.dailyQuests.map(q => q.id === questId ? { ...q, completed: true, progress: q.target } : q),
    };

    if (quest.reward.type === 'coins') {
      updates.coins = state.coins + quest.reward.amount;
    }

    // Check if all quests completed for stamp
    const completedAfter = state.dailyQuests.filter(q => q.id === questId || q.completed).length;
    if (completedAfter === 3) {
      updates.researchStamps = (state.researchStamps || 0) + 1;
      updates.questStreak = (state.questStreak || 0) + 1;
    }

    setState(prev => ({ ...prev, ...updates }));
  }, [state.dailyQuests, state.coins, state.researchStamps, state.questStreak]);

  return {
    state,
    addCoins,
    spendCoins,
    catchPokemon,
    evolvePokemon,
    tradePokemon,
    toggleFavorite,
    setGroup,
    addCustomGroup,
    updatePokemon,
    setRoamingPokemon,
    updateSettings,
    resetGame,
    canTrade,
    refreshShop,
    purchaseShopItem,
    hatchEgg,
    refreshQuests,
    claimQuestReward,
    getBurnoutMultiplier,
  };
};
