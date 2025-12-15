import { useState, useEffect, useCallback } from 'react';
import { GameState, OwnedPokemon, DEFAULT_GAME_STATE, StudyEntry, Egg, DailyQuest, ShopItem, DailySummary, QuestCategory } from '@/types/pokemon';
import { POKEMON_DATABASE, RARITY_WEIGHTS, getPokemonById } from '@/data/pokemonDatabase';
import { getRandomNature } from '@/data/pokemonNatures';

const STORAGE_KEY = 'study-pokedex-state';

// Get first-stage Pokemon (no evolvesFrom)
const getFirstStagePokemon = () => {
  return POKEMON_DATABASE.filter(p => !p.evolvesFrom);
};

// Generate daily shop items (Market) - 3-5 Pokemon, 2-3 coins each
const generateShopItems = (dateSeed: string): ShopItem[] => {
  const seed = dateSeed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (index: number) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };

  const items: ShopItem[] = [];
  const itemCount = 3 + Math.floor(random(0) * 3); // 3-5 items
  
  // Market Pokemon - mix of rare and uncommon, NOT available via catching
  const marketPokemon = POKEMON_DATABASE.filter(p => 
    p.rarity === 'rare' || p.rarity === 'uncommon'
  );

  for (let i = 0; i < itemCount; i++) {
    const pokemon = marketPokemon[Math.floor(random(i + 10) * marketPokemon.length)];
    const isRare = pokemon.rarity === 'rare';
    
    items.push({
      id: `market-${i}-${dateSeed}`,
      type: isRare ? 'premium' : 'bargain',
      speciesId: pokemon.id,
      price: isRare ? 3 : 2, // 2-3 coins
      purchased: false,
      isShiny: random(i + 100) < 0.01, // 1% shiny chance
    });
  }

  return items;
};

// Generate daily quests with multiple categories
const generateQuests = (): DailyQuest[] => {
  const quests: DailyQuest[] = [];
  
  // Study quests (always included)
  const studyTargets = [30, 60, 90, 120];
  const studyTarget = studyTargets[Math.floor(Math.random() * studyTargets.length)];
  quests.push({
    id: `quest-study-${Date.now()}`,
    type: 'study',
    title: studyTarget >= 90 ? 'Deep Focus' : 'Study Session',
    description: `Study for ${studyTarget} minutes today`,
    target: studyTarget,
    progress: 0,
    completed: false,
    reward: { type: 'coins', amount: Math.floor(studyTarget / 30) + 1 },
  });

  // Health quest
  const healthQuests = [
    { title: 'Early Bird', desc: 'Start studying before 7 AM', reward: 2 },
    { title: 'Rest Well', desc: 'Take a break after 60 min of study', reward: 1 },
    { title: 'Hydration', desc: 'Complete a study session (any length)', reward: 1 },
  ];
  const healthQuest = healthQuests[Math.floor(Math.random() * healthQuests.length)];
  quests.push({
    id: `quest-health-${Date.now()}`,
    type: 'health',
    title: healthQuest.title,
    description: healthQuest.desc,
    target: 1,
    progress: 0,
    completed: false,
    reward: { type: 'berries', amount: healthQuest.reward },
  });

  // Consistency/Challenge quest
  const isChallenge = Math.random() > 0.5;
  if (isChallenge) {
    quests.push({
      id: `quest-challenge-${Date.now()}`,
      type: 'challenge',
      title: 'Marathon Study',
      description: 'Complete a 2+ hour study session',
      target: 120,
      progress: 0,
      completed: false,
      reward: { type: 'coins', amount: 5 },
    });
  } else {
    quests.push({
      id: `quest-consistency-${Date.now()}`,
      type: 'consistency',
      title: 'Daily Dedication',
      description: 'Complete all other quests today',
      target: 2,
      progress: 0,
      completed: false,
      reward: { type: 'berries', amount: 3 },
    });
  }

  return quests;
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
          berries: parsed.berries || 0,
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

  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [coinAnimationAmount, setCoinAnimationAmount] = useState(0);

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
    const updatedEggs = state.eggs.map(egg => {
      if (egg.isPaused) return egg;
      return {
        ...egg,
        incubationProgress: Math.min(100, egg.incubationProgress + (minutes / egg.requiredMinutes) * 100),
        lastTickAt: Date.now(),
      };
    });

    // Update daily summary
    const today = new Date().toDateString();
    const currentSummary = state.dailySummary?.date === today ? state.dailySummary : {
      date: today,
      minutesStudied: 0,
      coinsEarned: 0,
      pokemonCaught: 0,
      pokemonEvolved: 0,
      eggsHatched: 0,
      questsCompleted: 0,
    };
    
    const updatedSummary: DailySummary = {
      ...currentSummary,
      minutesStudied: currentSummary.minutesStudied + minutes,
      coinsEarned: currentSummary.coinsEarned + coinsEarned,
    };

    // Show coin animation
    if (coinsEarned > 0) {
      setCoinAnimationAmount(coinsEarned);
      setShowCoinAnimation(true);
    }
    
    setState(prev => ({
      ...prev,
      coins: prev.coins + coinsEarned,
      studyHistory: [...prev.studyHistory, entry],
      eggs: updatedEggs,
      dailySummary: updatedSummary,
    }));
    
    return coinsEarned;
  }, [state.settings.coinConversion, state.eggs, state.dailySummary, getBurnoutMultiplier]);

  const hideCoinAnimation = useCallback(() => {
    setShowCoinAnimation(false);
  }, []);

  const spendCoins = useCallback((amount: number): boolean => {
    if (state.coins < amount) return false;
    setState(prev => ({ ...prev, coins: prev.coins - amount }));
    return true;
  }, [state.coins]);

  const catchPokemon = useCallback((): { pokemon: OwnedPokemon; isDuplicate: boolean; refundCoins: number } | null => {
    if (state.coins < 3) return null;

    // Favor first-stage Pokemon (80% chance)
    const useFirstStage = Math.random() < 0.8;
    
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

    let eligiblePokemon = POKEMON_DATABASE.filter(p => p.rarity === selectedRarity);
    
    // Filter to first-stage if applicable
    if (useFirstStage) {
      const firstStageOnly = eligiblePokemon.filter(p => !p.evolvesFrom);
      if (firstStageOnly.length > 0) {
        eligiblePokemon = firstStageOnly;
      }
    }

    const randomPokemon = eligiblePokemon[Math.floor(Math.random() * eligiblePokemon.length)];

    if (!randomPokemon) return null;

    const isDuplicate = state.pokedexCaught.includes(randomPokemon.id);
    const refundCoins = isDuplicate ? 2 : 0; // +2 coins refund for duplicate
    
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

    // Update daily summary
    const today = new Date().toDateString();
    const currentSummary = state.dailySummary?.date === today ? state.dailySummary : {
      date: today,
      minutesStudied: 0,
      coinsEarned: 0,
      pokemonCaught: 0,
      pokemonEvolved: 0,
      eggsHatched: 0,
      questsCompleted: 0,
    };

    // Net cost: 3 coins spent - refund for duplicate
    const netCost = 3 - refundCoins;

    setState(prev => ({
      ...prev,
      coins: prev.coins - netCost,
      ownedPokemon: [...prev.ownedPokemon, newPokemon],
      pokedexSeen: [...new Set([...prev.pokedexSeen, randomPokemon.id])],
      pokedexCaught: [...new Set([...prev.pokedexCaught, randomPokemon.id])],
      dailySummary: { ...currentSummary, pokemonCaught: currentSummary.pokemonCaught + 1 },
    }));

    // Show refund animation
    if (refundCoins > 0) {
      setCoinAnimationAmount(refundCoins);
      setShowCoinAnimation(true);
    }

    return { pokemon: newPokemon, isDuplicate, refundCoins };
  }, [state.coins, state.pokedexCaught, state.dailySummary]);

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

    const today = new Date().toDateString();
    const currentSummary = state.dailySummary?.date === today ? state.dailySummary : {
      date: today,
      minutesStudied: 0,
      coinsEarned: 0,
      pokemonCaught: 0,
      pokemonEvolved: 0,
      eggsHatched: 0,
      questsCompleted: 0,
    };

    setState(prev => ({
      ...prev,
      coins: prev.coins - 2,
      ownedPokemon: prev.ownedPokemon.map(p => 
        p.uniqueId === uniqueId ? evolvedPokemon : p
      ),
      pokedexSeen: [...new Set([...prev.pokedexSeen, evolutionId])],
      pokedexCaught: [...new Set([...prev.pokedexCaught, evolutionId])],
      dailySummary: { ...currentSummary, pokemonEvolved: currentSummary.pokemonEvolved + 1 },
    }));

    return evolvedPokemon;
  }, [state.coins, state.ownedPokemon, state.dailySummary]);

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

  const feedBerry = useCallback((uniqueId: string) => {
    if (state.berries < 1) return false;
    
    setState(prev => ({
      ...prev,
      berries: prev.berries - 1,
      ownedPokemon: prev.ownedPokemon.map(p =>
        p.uniqueId === uniqueId 
          ? { 
              ...p, 
              friendship: Math.min(255, (p.friendship || 70) + 5),
              berryBoost: (p.berryBoost || 0) + 1,
            } 
          : p
      ),
    }));
    return true;
  }, [state.berries]);

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
  const addEgg = useCallback((speciesId: number, rarity: string, requiredMinutes: number) => {
    if (state.eggs.length >= 3) return false;
    
    const newEgg: Egg = {
      id: `egg-${Date.now()}`,
      speciesId,
      rarity: rarity as any,
      incubationProgress: 0,
      requiredMinutes,
      purchasedAt: Date.now(),
      lastTickAt: Date.now(),
    };

    setState(prev => ({
      ...prev,
      eggs: [...prev.eggs, newEgg],
    }));
    return true;
  }, [state.eggs]);

  const toggleEggPause = useCallback((eggId: string) => {
    setState(prev => ({
      ...prev,
      eggs: prev.eggs.map(e => 
        e.id === eggId ? { ...e, isPaused: !e.isPaused } : e
      ),
    }));
  }, []);

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
      friendship: 100, // Higher friendship for hatched Pokemon
      isHatched: true,
    };

    const today = new Date().toDateString();
    const currentSummary = state.dailySummary?.date === today ? state.dailySummary : {
      date: today,
      minutesStudied: 0,
      coinsEarned: 0,
      pokemonCaught: 0,
      pokemonEvolved: 0,
      eggsHatched: 0,
      questsCompleted: 0,
    };

    setState(prev => ({
      ...prev,
      eggs: prev.eggs.filter(e => e.id !== eggId),
      ownedPokemon: [...prev.ownedPokemon, newPokemon],
      pokedexSeen: [...new Set([...prev.pokedexSeen, egg.speciesId])],
      pokedexCaught: [...new Set([...prev.pokedexCaught, egg.speciesId])],
      dailySummary: { ...currentSummary, eggsHatched: currentSummary.eggsHatched + 1 },
    }));

    return newPokemon;
  }, [state.eggs, state.dailySummary]);

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
    } else if (quest.reward.type === 'berries') {
      updates.berries = (state.berries || 0) + quest.reward.amount;
    }

    // Update daily summary
    const today = new Date().toDateString();
    const currentSummary = state.dailySummary?.date === today ? state.dailySummary : {
      date: today,
      minutesStudied: 0,
      coinsEarned: 0,
      pokemonCaught: 0,
      pokemonEvolved: 0,
      eggsHatched: 0,
      questsCompleted: 0,
    };
    updates.dailySummary = { ...currentSummary, questsCompleted: currentSummary.questsCompleted + 1 };

    // Check if all quests completed for stamp
    const completedAfter = state.dailyQuests.filter(q => q.id === questId || q.completed).length;
    if (completedAfter === state.dailyQuests.length) {
      updates.researchStamps = (state.researchStamps || 0) + 1;
      updates.questStreak = (state.questStreak || 0) + 1;
    }

    setState(prev => ({ ...prev, ...updates }));
  }, [state.dailyQuests, state.coins, state.berries, state.researchStamps, state.questStreak, state.dailySummary]);

  const showDailySummaryDialog = useCallback(() => {
    setState(prev => ({ ...prev, showDailySummary: true }));
  }, []);

  const hideDailySummaryDialog = useCallback(() => {
    setState(prev => ({ ...prev, showDailySummary: false }));
  }, []);

  // Transfer to professor - delete pokemon for +1 coin
  const transferToProfessor = useCallback((uniqueId: string): boolean => {
    const pokemon = state.ownedPokemon.find(p => p.uniqueId === uniqueId);
    if (!pokemon) return false;

    setState(prev => ({
      ...prev,
      coins: prev.coins + 1,
      ownedPokemon: prev.ownedPokemon.filter(p => p.uniqueId !== uniqueId),
    }));

    setCoinAnimationAmount(1);
    setShowCoinAnimation(true);

    return true;
  }, [state.ownedPokemon]);

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
    feedBerry,
    setRoamingPokemon,
    updateSettings,
    resetGame,
    canTrade,
    refreshShop,
    purchaseShopItem,
    addEgg,
    toggleEggPause,
    hatchEgg,
    refreshQuests,
    claimQuestReward,
    getBurnoutMultiplier,
    showCoinAnimation,
    coinAnimationAmount,
    hideCoinAnimation,
    showDailySummaryDialog,
    hideDailySummaryDialog,
    transferToProfessor,
  };
};
