import { useState, useMemo } from 'react';
import { Grid3X3, Star, Filter, SortAsc, Edit3, Heart, Footprints } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useGameState } from '@/hooks/useGameState';
import { getPokemonById } from '@/data/pokemonDatabase';
import { getNatureById, NATURES } from '@/data/pokemonNatures';
import { PokemonCard } from '@/components/PokemonCard';
import { PokemonSprite } from '@/components/PokemonSprite';
import { TypeBadge } from '@/components/TypeBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OwnedPokemon } from '@/types/pokemon';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type SortOption = 'recent' | 'number' | 'level' | 'name';
type FilterOption = 'all' | 'favorites' | string;

// Common Pokemon moves for selection
const COMMON_MOVES = [
  'Tackle', 'Scratch', 'Pound', 'Quick Attack', 'Ember', 'Water Gun', 'Vine Whip',
  'Thunderbolt', 'Ice Beam', 'Flamethrower', 'Surf', 'Earthquake', 'Psychic',
  'Shadow Ball', 'Dragon Claw', 'Iron Tail', 'Hyper Beam', 'Focus Blast',
  'Stone Edge', 'X-Scissor', 'Dark Pulse', 'Flash Cannon', 'Moonblast'
];

// Common Pokemon abilities
const COMMON_ABILITIES = [
  'Overgrow', 'Blaze', 'Torrent', 'Static', 'Levitate', 'Intimidate',
  'Swift Swim', 'Chlorophyll', 'Sand Stream', 'Drought', 'Drizzle',
  'Pressure', 'Inner Focus', 'Synchronize', 'Natural Cure', 'Shed Skin',
  'Guts', 'Marvel Scale', 'Speed Boost', 'Huge Power', 'Adaptability'
];

const CollectionPage = () => {
  const { state, toggleFavorite, setGroup, addCustomGroup, updatePokemon, setRoamingPokemon } = useGameState();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedPokemon, setSelectedPokemon] = useState<OwnedPokemon | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingNickname, setEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState('');

  const filteredAndSortedPokemon = useMemo(() => {
    let result = [...state.ownedPokemon];

    if (filterBy === 'favorites') {
      result = result.filter(p => p.isFavorite);
    } else if (filterBy !== 'all') {
      result = result.filter(p => p.group === filterBy);
    }

    if (searchQuery) {
      result = result.filter(p => {
        const species = getPokemonById(p.speciesId);
        const nickname = p.nickname?.toLowerCase() || '';
        return species?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               nickname.includes(searchQuery.toLowerCase());
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'number':
          return a.speciesId - b.speciesId;
        case 'level':
          return b.level - a.level;
        case 'name':
          const nameA = a.nickname || getPokemonById(a.speciesId)?.name || '';
          const nameB = b.nickname || getPokemonById(b.speciesId)?.name || '';
          return nameA.localeCompare(nameB);
        case 'recent':
        default:
          return b.caughtAt - a.caughtAt;
      }
    });

    return result;
  }, [state.ownedPokemon, filterBy, searchQuery, sortBy]);

  const selectedSpecies = selectedPokemon ? getPokemonById(selectedPokemon.speciesId) : null;
  const selectedNature = selectedPokemon?.nature ? getNatureById(selectedPokemon.nature) : null;
  const roamingIds = state.settings.roamingPokemon || [];

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      addCustomGroup(newGroupName.trim());
      setNewGroupName('');
    }
  };

  const handleSaveNickname = () => {
    if (selectedPokemon) {
      updatePokemon(selectedPokemon.uniqueId, { nickname: tempNickname.trim() || undefined });
      setSelectedPokemon({ ...selectedPokemon, nickname: tempNickname.trim() || undefined });
      setEditingNickname(false);
      toast({ title: 'Nickname saved!' });
    }
  };

  const handleMoveChange = (slotIndex: number, move: string) => {
    if (selectedPokemon) {
      const currentMoves = selectedPokemon.moves || ['', '', '', ''];
      const newMoves = [...currentMoves];
      newMoves[slotIndex] = move === 'none' ? '' : move;
      updatePokemon(selectedPokemon.uniqueId, { moves: newMoves });
      setSelectedPokemon({ ...selectedPokemon, moves: newMoves });
    }
  };

  const handleAbilityChange = (ability: string) => {
    if (selectedPokemon) {
      updatePokemon(selectedPokemon.uniqueId, { ability: ability === 'none' ? undefined : ability });
      setSelectedPokemon({ ...selectedPokemon, ability: ability === 'none' ? undefined : ability });
    }
  };

  const handleToggleRoaming = () => {
    if (selectedPokemon) {
      const isCurrentlyRoaming = roamingIds.includes(selectedPokemon.uniqueId);
      let newRoamingIds: string[];
      
      if (isCurrentlyRoaming) {
        newRoamingIds = roamingIds.filter(id => id !== selectedPokemon.uniqueId);
        toast({ title: 'Removed from roaming!' });
      } else {
        if (roamingIds.length >= 5) {
          toast({ title: 'Max 5 roaming Pokémon!', variant: 'destructive' });
          return;
        }
        newRoamingIds = [...roamingIds, selectedPokemon.uniqueId];
        toast({ title: 'Added to roaming!' });
      }
      
      setRoamingPokemon(newRoamingIds);
    }
  };

  const openPokemonDetail = (pokemon: OwnedPokemon) => {
    setSelectedPokemon(pokemon);
    setTempNickname(pokemon.nickname || '');
    setEditingNickname(false);
  };

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Grid3X3 className="w-6 h-6" />
            Collection
          </h1>
          <span className="text-muted-foreground">
            {state.ownedPokemon.length} Pokémon
          </span>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <Input
            placeholder="Search by name or nickname..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <div className="flex gap-2">
            <Select value={filterBy} onValueChange={(v) => setFilterBy(v as FilterOption)}>
              <SelectTrigger className="flex-1 bg-card">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border z-50">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="favorites">⭐ Favorites</SelectItem>
                {state.customGroups.map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="flex-1 bg-card">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border z-50">
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="number"># Number</SelectItem>
                <SelectItem value="level">Level</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pokemon Grid */}
        {filteredAndSortedPokemon.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Grid3X3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {state.ownedPokemon.length === 0 
                  ? "You haven't caught any Pokémon yet!"
                  : "No Pokémon match your filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filteredAndSortedPokemon.map(pokemon => (
              <PokemonCard
                key={pokemon.uniqueId}
                pokemon={pokemon}
                onClick={() => openPokemonDetail(pokemon)}
                onFavorite={() => toggleFavorite(pokemon.uniqueId)}
              />
            ))}
          </div>
        )}

        {/* Pokemon Detail Dialog */}
        <Dialog open={!!selectedPokemon} onOpenChange={() => setSelectedPokemon(null)}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center flex items-center justify-center gap-2">
                {editingNickname ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempNickname}
                      onChange={(e) => setTempNickname(e.target.value.slice(0, 12))}
                      placeholder={selectedSpecies?.name}
                      className="w-32 h-8 text-center"
                      maxLength={12}
                    />
                    <Button size="sm" onClick={handleSaveNickname}>Save</Button>
                  </div>
                ) : (
                  <>
                    <span>{selectedPokemon?.nickname || selectedSpecies?.name}</span>
                    <button 
                      onClick={() => setEditingNickname(true)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {selectedPokemon && selectedSpecies && (
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="moves">Moves</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="text-center">
                    <PokemonSprite
                      pokemonId={selectedSpecies.id}
                      name={selectedSpecies.name}
                      className="w-28 h-28 mx-auto"
                      animate
                    />
                    <p className="text-sm text-muted-foreground">
                      #{selectedSpecies.id.toString().padStart(3, '0')}
                    </p>
                    {selectedPokemon.nickname && (
                      <p className="text-xs text-muted-foreground">({selectedSpecies.name})</p>
                    )}
                  </div>

                  <div className="flex justify-center gap-2">
                    {selectedSpecies.types.map(type => (
                      <TypeBadge key={type} type={type} />
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <Card>
                      <CardContent className="py-2">
                        <p className="text-xl font-bold">{selectedPokemon.level}</p>
                        <p className="text-[10px] text-muted-foreground">Level</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="py-2">
                        <p className="text-xl font-bold">{selectedPokemon.xp}</p>
                        <p className="text-[10px] text-muted-foreground">XP</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="py-2">
                        <p className="text-xl font-bold flex items-center justify-center">
                          <Heart className="w-4 h-4 mr-1 text-pink-500" />
                          {selectedPokemon.friendship || 70}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Friendship</p>
                      </CardContent>
                    </Card>
                  </div>

                  {selectedNature && (
                    <Card className="bg-muted/50">
                      <CardContent className="py-3 text-center">
                        <p className="text-sm font-semibold">{selectedNature.name} Nature</p>
                        <p className="text-xs text-muted-foreground">
                          +{selectedNature.increasedStat} / -{selectedNature.decreasedStat}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant={selectedPokemon.isFavorite ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => {
                        toggleFavorite(selectedPokemon.uniqueId);
                        setSelectedPokemon({ ...selectedPokemon, isFavorite: !selectedPokemon.isFavorite });
                      }}
                    >
                      <Star className={cn('w-4 h-4 mr-1', selectedPokemon.isFavorite && 'fill-current')} />
                      Favorite
                    </Button>
                    <Button
                      variant={roamingIds.includes(selectedPokemon.uniqueId) ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={handleToggleRoaming}
                    >
                      <Footprints className="w-4 h-4 mr-1" />
                      Roam
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="moves" className="space-y-3 mt-4">
                  <p className="text-sm font-medium text-center">Moveset</p>
                  {[0, 1, 2, 3].map((slotIndex) => (
                    <Select
                      key={slotIndex}
                      value={selectedPokemon.moves?.[slotIndex] || 'none'}
                      onValueChange={(v) => handleMoveChange(slotIndex, v)}
                    >
                      <SelectTrigger className="bg-card">
                        <SelectValue placeholder={`Move ${slotIndex + 1}`} />
                      </SelectTrigger>
                      <SelectContent className="bg-card border border-border z-50 max-h-48">
                        <SelectItem value="none">-- Empty --</SelectItem>
                        {COMMON_MOVES.map(move => (
                          <SelectItem key={move} value={move}>{move}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ))}

                  <div className="pt-2">
                    <p className="text-sm font-medium text-center mb-2">Ability</p>
                    <Select
                      value={selectedPokemon.ability || 'none'}
                      onValueChange={handleAbilityChange}
                    >
                      <SelectTrigger className="bg-card">
                        <SelectValue placeholder="Select ability" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border border-border z-50 max-h-48">
                        <SelectItem value="none">-- None --</SelectItem>
                        {COMMON_ABILITIES.map(ability => (
                          <SelectItem key={ability} value={ability}>{ability}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Group</p>
                    <Select 
                      value={selectedPokemon.group || 'none'} 
                      onValueChange={(v) => {
                        setGroup(selectedPokemon.uniqueId, v === 'none' ? undefined : v);
                        setSelectedPokemon({ ...selectedPokemon, group: v === 'none' ? undefined : v });
                      }}
                    >
                      <SelectTrigger className="bg-card">
                        <SelectValue placeholder="No group" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border border-border z-50">
                        <SelectItem value="none">No group</SelectItem>
                        {state.customGroups.map(group => (
                          <SelectItem key={group} value={group}>{group}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      <Input
                        placeholder="New group name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="outline" onClick={handleAddGroup}>
                        Add
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    Caught: {new Date(selectedPokemon.caughtAt).toLocaleDateString()}
                  </p>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CollectionPage;
