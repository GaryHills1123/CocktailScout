import { CafeCard } from "./cafe-card.tsx";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Cafe } from "@shared/schema";
import { useMemo } from "react";

interface CafeListProps {
  cafes: Cafe[];
  isLoading: boolean;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onCafeClick?: (cafeId: string) => void;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export function CafeList({ 
  cafes, 
  isLoading, 
  sortBy, 
  onSortChange,
  onCafeClick,
  userLocation 
}: CafeListProps) {

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };
  
  const sortedCafes = useMemo(() => {
    // Apply sorting
    const sorted = [...cafes].sort((a, b) => {
      switch (sortBy) {
        case "distance":
          if (!userLocation) return 0; // If no user location, don't sort
          const distanceA = calculateDistance(
            userLocation.latitude, 
            userLocation.longitude, 
            a.latitude, 
            a.longitude
          );
          const distanceB = calculateDistance(
            userLocation.latitude, 
            userLocation.longitude, 
            b.latitude, 
            b.longitude
          );
          return distanceA - distanceB; // Closest first
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
  }, [cafes, sortBy, userLocation]);

  return (
    <div className="h-full flex flex-col">
      {/* Sort Controls */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground" data-testid="text-cafe-count">
            {sortedCafes.length} cafés found
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
        ) : sortedCafes.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-muted-foreground" data-testid="text-no-cafes">No cafés found</div>
          </div>
        ) : (
          sortedCafes.map(cafe => (
            <CafeCard key={cafe.id} cafe={cafe} onClick={onCafeClick} />
          ))
        )}
      </div>
    </div>
  );
}
