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

      // Fix default icon paths for bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current).setView([43.2557, -79.8711], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      console.log('Map initialized successfully');
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || isLoading || cafes.length === 0) return;
    
    console.log('Adding markers, cafes count:', cafes.length, cafes);

    // Add a small delay to ensure map is fully ready
    setTimeout(() => {
      import("leaflet").then((L) => {
        const map = mapInstanceRef.current;
        if (!map) {
          console.log('Map not ready');
          return;
        }

        // Clear existing markers
        markersRef.current.forEach(marker => {
          try {
            map.removeLayer(marker);
          } catch (e) {
            console.log('Error removing marker:', e);
          }
        });
        markersRef.current = [];

        // Add new markers - try both circle markers and regular markers
        cafes.forEach(cafe => {
          console.log('Adding marker for:', cafe.name, 'at', cafe.latitude, cafe.longitude);
          
          // Try regular marker first
          const marker = L.marker([cafe.latitude, cafe.longitude]);
          
          marker.bindPopup(`
            <div style="padding: 8px;">
              <h3 style="margin: 0; font-weight: bold;">${cafe.name}</h3>
              <p style="margin: 4px 0; font-size: 14px;">Vibe Score: ${cafe.vibeScore}</p>
              <p style="margin: 4px 0; font-size: 14px; color: #666;">${cafe.neighborhood}</p>
            </div>
          `);
          
          marker.addTo(map);
          markersRef.current.push(marker);
          console.log('Marker added successfully for', cafe.name);
        });
        
        console.log('Total markers added:', markersRef.current.length);
        
        // Also try to fit the map bounds to show all markers
        if (markersRef.current.length > 0) {
          const group = new L.featureGroup(markersRef.current);
          map.fitBounds(group.getBounds(), { padding: [20, 20] });
        }
      });
    }, 100);
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
