import { useEffect, useRef } from "react";
import { type Cafe } from "@shared/schema";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  cafes: Cafe[];
  isLoading: boolean;
}

export function MapView({ cafes, isLoading }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import to avoid SSR issues
    import("leaflet").then((L) => {
      if (!mapRef.current) return;

      const map = L.map(mapRef.current).setView([43.2557, -79.8711], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || isLoading) return;

    // Dynamic import for markers
    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;

      // Clear existing markers
      markersRef.current.forEach(marker => map.removeLayer(marker));
      markersRef.current = [];

      // Add new markers
      cafes.forEach(cafe => {
        const marker = L.circleMarker([cafe.latitude, cafe.longitude], {
          radius: 8,
          fillColor: getColorByScore(cafe.vibeScore),
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        });
        
        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold">${cafe.name}</h3>
            <p class="text-sm">Vibe Score: ${cafe.vibeScore}</p>
            <p class="text-sm text-muted-foreground">${cafe.neighborhood}</p>
          </div>
        `);
        
        marker.addTo(map);
        markersRef.current.push(marker);
      });
    });
  }, [cafes, isLoading]);

  function getColorByScore(score: number): string {
    if (score >= 85) return '#DAA520'; // Gold
    if (score >= 75) return '#D2691E'; // Orange
    return '#8B4513'; // Brown
  }

  return (
    <div className="map-container w-full bg-muted" data-testid="map-container">
      <div ref={mapRef} className="w-full h-full" data-testid="map-leaflet" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="text-muted-foreground" data-testid="loading-map">Loading map...</div>
        </div>
      )}
    </div>
  );
}
