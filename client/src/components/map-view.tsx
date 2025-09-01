import { useEffect, useRef, useState } from "react";
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
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    async function initMap() {
      const L = await import("leaflet");
      
      if (!mapRef.current) return;

      // Fix default marker icons for bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current).setView([43.2557, -79.8711], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);
    }

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // Add markers when map is ready and we have cafes
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || isLoading || cafes.length === 0) return;

    async function addMarkers() {
      const L = await import("leaflet");
      const map = mapInstanceRef.current;

      // Clear existing markers
      markersRef.current.forEach(marker => {
        map.removeLayer(marker);
      });
      markersRef.current = [];

      // Add markers for each cafe
      cafes.forEach(cafe => {
        const marker = L.marker([cafe.latitude, cafe.longitude]);
        
        marker.bindPopup(`
          <div style="padding: 8px; min-width: 150px;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold; color: #333;">${cafe.name}</h3>
            <div style="margin: 4px 0; font-size: 14px; color: #666;">
              <strong>Vibe Score:</strong> ${cafe.vibeScore}/100
            </div>
            <div style="margin: 4px 0; font-size: 13px; color: #666;">
              ${cafe.neighborhood}
            </div>
            <div style="margin: 4px 0; font-size: 13px; color: #666;">
              ${cafe.priceLevel} • ⭐ ${cafe.rating} (${cafe.reviewCount} reviews)
            </div>
          </div>
        `);
        
        marker.addTo(map);
        markersRef.current.push(marker);
      });

      // Fit map to show all markers if we have any
      if (markersRef.current.length > 0) {
        const group = new L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds(), { 
          padding: [20, 20],
          maxZoom: 15
        });
      }
    }

    addMarkers();
  }, [mapReady, cafes, isLoading]);

  return (
    <div className="map-container w-full bg-muted relative" data-testid="map-container">
      <div ref={mapRef} className="w-full h-full" data-testid="map-leaflet" />
      {(isLoading || !mapReady) && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
          <div className="text-muted-foreground" data-testid="loading-map">
            {isLoading ? "Loading cafés..." : "Loading map..."}
          </div>
        </div>
      )}
      {mapReady && !isLoading && cafes.length > 0 && (
        <div className="absolute top-4 right-4 bg-background/90 text-foreground px-2 py-1 rounded text-sm shadow">
          {cafes.length} cafés on map
        </div>
      )}
    </div>
  );
}
