import { CafeCard } from "./cafe-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Cafe } from "@shared/schema";
import { useMemo } from "react";

interface CafeListProps {
  cafes: Cafe[];
  isLoading: boolean;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  filters: string[];
}

export function CafeList({ 
  cafes, 
  isLoading, 
  selectedFilter, 
  onFilterChange, 
  sortBy, 
  onSortChange,
  filters 
}: CafeListProps) {
  
  const filteredAndSortedCafes = useMemo(() => {
    let filtered = cafes;

    // Apply filters
    if (selectedFilter !== "All") {
      filtered = cafes.filter(cafe => {
        switch (selectedFilter) {
          case "Open Now":
            // Simple mock for now - in real app would check current time against hours
            return true;
          case "Study Spots":
            return cafe.tags.some(tag => 
              tag.toLowerCase().includes("study") || 
              tag.toLowerCase().includes("quiet") || 
              tag.toLowerCase().includes("wifi")
            );
          case "Outdoor Seating":
            return cafe.tags.some(tag => 
              tag.toLowerCase().includes("outdoor") || 
              tag.toLowerCase().includes("patio")
            );
          default:
            return true;
        }
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "distance":
          // Mock distance sorting - in real app would calculate from user location
          return 0;
        case "price":
          const priceOrder = { "$": 1, "$$": 2, "$$$": 3, "$$$$": 4 };
          return (priceOrder[a.priceLevel as keyof typeof priceOrder] || 0) - 
                 (priceOrder[b.priceLevel as keyof typeof priceOrder] || 0);
        case "vibe":
        default:
          return b.vibeScore - a.vibeScore;
      }
    });

    return sorted;
  }, [cafes, selectedFilter, sortBy]);

  return (
    <div className="h-full flex flex-col">
      {/* Filters */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.map(filter => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? "default" : "secondary"}
              size="sm"
              onClick={() => onFilterChange(filter)}
              className={`rounded-full text-sm font-medium ${
                selectedFilter === filter 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              data-testid={`filter-${filter.toLowerCase().replace(" ", "-")}`}
            >
              {filter}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground" data-testid="text-cafe-count">
            {filteredAndSortedCafes.length} cafés found
          </span>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-48 text-sm bg-background border-border" data-testid="select-sort">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vibe">Sort by Vibe Score</SelectItem>
              <SelectItem value="distance">Sort by Distance</SelectItem>
              <SelectItem value="price">Sort by Price</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Café Cards */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="text-muted-foreground" data-testid="loading-cafes">Loading cafés...</div>
          </div>
        ) : filteredAndSortedCafes.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-muted-foreground" data-testid="text-no-cafes">No cafés found</div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or filters
              </p>
            )}
          </div>
        ) : (
          filteredAndSortedCafes.map(cafe => (
            <CafeCard key={cafe.id} cafe={cafe} />
          ))
        )}
      </div>
    </div>
  );
}
