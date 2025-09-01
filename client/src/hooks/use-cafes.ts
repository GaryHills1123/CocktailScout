import { useQuery } from "@tanstack/react-query";
import { type Cafe } from "@shared/schema";

export function useCafes(searchQuery?: string) {
  return useQuery<Cafe[]>({
    queryKey: searchQuery ? ["/api/cafes/search", { q: searchQuery }] : ["/api/cafes"],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/cafes/search?q=${encodeURIComponent(searchQuery)}`
        : "/api/cafes";
      
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
