import { useQuery } from "@tanstack/react-query";
import { type Cafe } from "@shared/schema";

interface UseCafesOptions {
  searchQuery?: string;
  latitude?: number;
  longitude?: number;
}

export function useCafes(options: UseCafesOptions = {}) {
  const { searchQuery, latitude, longitude } = options;
  
  return useQuery<Cafe[]>({
    queryKey: searchQuery 
      ? ["/api/cafes/search", { q: searchQuery, lat: latitude, lng: longitude }] 
      : ["/api/cafes", { lat: latitude, lng: longitude }],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('q', searchQuery);
      }
      if (latitude !== undefined) {
        params.append('lat', latitude.toString());
      }
      if (longitude !== undefined) {
        params.append('lng', longitude.toString());
      }

      const url = searchQuery 
        ? `/api/cafes/search?${params.toString()}`
        : `/api/cafes?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch cafes: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCafe(id: string) {
  return useQuery<Cafe>({
    queryKey: ["/api/cafes", id],
    queryFn: async () => {
      const response = await fetch(`/api/cafes/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch cafe: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!id,
  });
}
