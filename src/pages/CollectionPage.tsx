import { useState, useMemo } from 'react';
import { Grid3X3, Star, Filter, SortAsc } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useGameState } from '@/hooks/useGameState';
import { getPokemonById } from '@/data/pokemonDatabase';
import { PokemonCard } from '@/components/PokemonCard';
import { PokemonSprite } from '@/components/PokemonSprite';
import { TypeBadge } from '@/components/TypeBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { OwnedPokemon } from '@/types/pokemon';

type SortOption = 'recent' | 'number' | 'level' | 'name';
type FilterOption = 'all' | 'favorites' | string;

const CollectionPage = () => {
  const { state, toggleFavorite, setGroup, addCustomGroup } = useGameState();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedPokemon, setSelectedPokemon] = useState<OwnedPokemon | null>(null);
  const [newGroupName, setNewGroupName] = useState('');

  const filteredAndSortedPokemon = useMemo(() => {
    let result = [...state.ownedPokemon];

    // Filter
    if (filterBy === 'favorites') {
      result = result.filter(p => p.isFavorite);
    } else if (filterBy !== 'all') {
      result = result.filter(p => p.group === filterBy);
    }

    // Search
    if (searchQuery) {
      result = result.filter(p => {
        const species = getPokemonById(p.speciesId);
        return species?.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'number':
          return a.speciesId - b.speciesId;
        case 'level':
          return b.level - a.level;
        case 'name':
          const nameA = getPokemonById(a.speciesId)?.name || '';
          const nameB = getPokemonById(b.speciesId)?.name || '';
          return nameA.localeCompare(nameB);
        case 'recent':
        default:
          return b.caughtAt - a.caughtAt;
      }
    });

    return result;
  }, [state.ownedPokemon, filterBy, searchQuery, sortBy]);

  const selectedSpecies = selectedPokemon ? getPokemonById(selectedPokemon.speciesId) : null;

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      addCustomGroup(newGroupName.trim());
      setNewGroupName('');
    }
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
            placeholder="Search Pokémon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <div className="flex gap-2">
            <Select value={filterBy} onValueChange={(v) => setFilterBy(v as FilterOption)}>
              <SelectTrigger className="flex-1">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="favorites">⭐ Favorites</SelectItem>
                {state.customGroups.map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="flex-1">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
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
                onClick={() => setSelectedPokemon(pokemon)}
                onFavorite={() => toggleFavorite(pokemon.uniqueId)}
              />
            ))}
          </div>
        )}

        {/* Pokemon Detail Dialog */}
        <Dialog open={!!selectedPokemon} onOpenChange={() => setSelectedPokemon(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center">
                {selectedSpecies?.name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedPokemon && selectedSpecies && (
              <div className="space-y-4">
                <div className="text-center">
                  <PokemonSprite
                    pokemonId={selectedSpecies.id}
                    name={selectedSpecies.name}
                    className="w-32 h-32 mx-auto"
                    animate
                  />
                  <p className="text-sm text-muted-foreground">
                    #{selectedSpecies.id.toString().padStart(3, '0')}
                  </p>
                </div>

                <div className="flex justify-center gap-2">
                  {selectedSpecies.types.map(type => (
                    <TypeBadge key={type} type={type} />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <Card>
                    <CardContent className="py-3">
                      <p className="text-2xl font-bold">{selectedPokemon.level}</p>
                      <p className="text-xs text-muted-foreground">Level</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-3">
                      <p className="text-2xl font-bold">{selectedPokemon.xp}</p>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Group</p>
                  <Select 
                    value={selectedPokemon.group || 'none'} 
                    onValueChange={(v) => setGroup(selectedPokemon.uniqueId, v === 'none' ? undefined : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No group" />
                    </SelectTrigger>
                    <SelectContent>
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
                    />
                    <Button variant="outline" onClick={handleAddGroup}>
                      Add
                    </Button>
                  </div>
                </div>

                <Button
                  variant={selectedPokemon.isFavorite ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => toggleFavorite(selectedPokemon.uniqueId)}
                >
                  <Star className={selectedPokemon.isFavorite ? 'fill-current' : ''} />
                  {selectedPokemon.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Caught: {new Date(selectedPokemon.caughtAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CollectionPage;
