import { useState, useEffect, useCallback } from 'react';
import { GameState, OwnedPokemon, DEFAULT_GAME_STATE, StudyEntry } from '@/types/pokemon';
import { POKEMON_DATABASE, RARITY_WEIGHTS, getPokemonById } from '@/data/pokemonDatabase';
import { getRandomNature } from '@/data/pokemonNatures';

const STORAGE_KEY = 'study-pokedex-state';

export const useGameState = () => {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_GAME_STATE, ...JSON.parse(saved) };
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

  const addCoins = useCallback((minutes: number) => {
    const coinsEarned = Math.floor(minutes / state.settings.coinConversion);
    const entry: StudyEntry = {
      date: new Date().toISOString(),
      minutes,
      coinsEarned,
    };
    
    setState(prev => ({
      ...prev,
      coins: prev.coins + coinsEarned,
      studyHistory: [...prev.studyHistory, entry],
    }));
    
    return coinsEarned;
  }, [state.settings.coinConversion]);

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
  };
};
