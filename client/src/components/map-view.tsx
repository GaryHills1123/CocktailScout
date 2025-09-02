import { useEffect, useRef, useState } from "react";
import { type Cafe } from "@shared/schema";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  cafes: Cafe[];
  isLoading: boolean;
  onCafeClick?: (cafeId: string) => void;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export function MapView({ cafes, isLoading, onCafeClick, userLocation }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
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

      // Center map on user location if available, otherwise Hamilton
      const initialLat = userLocation?.latitude ?? 43.2557;
      const initialLng = userLocation?.longitude ?? -79.8711;
      const map = L.map(mapRef.current).setView([initialLat, initialLng], 13);
      
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

  // Set up global callback for popup buttons
  useEffect(() => {
    if (onCafeClick) {
      (window as any).openCafeDetails = onCafeClick;
    }
    
    return () => {
      delete (window as any).openCafeDetails;
    };
  }, [onCafeClick]);

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

      // Sort cafes by vibe score to identify top 3
      const sortedCafes = [...cafes].sort((a, b) => b.vibeScore - a.vibeScore);
      const top3CafeIds = new Set(sortedCafes.slice(0, 3).map(cafe => cafe.id));

      // Function to get marker color - top 3 are always gold
      const getMarkerColor = (cafe: Cafe, isTop3: boolean) => {
        if (isTop3) return '#FFD700'; // Gold - Top 3
        if (cafe.vibeScore >= 80) return '#FFD700'; // Gold - Elite (80+)
        if (cafe.vibeScore >= 70) return '#32CD32'; // Green - Excellent (70-79)
        if (cafe.vibeScore >= 60) return '#4169E1'; // Blue - Good (60-69)
        return '#808080'; // Gray - Basic (below 60)
      };

      const getTierLabel = (cafe: Cafe, isTop3: boolean) => {
        if (isTop3) return 'Top 3';
        if (cafe.vibeScore >= 80) return 'Elite';
        if (cafe.vibeScore >= 70) return 'Excellent';
        if (cafe.vibeScore >= 60) return 'Good';
        return 'Fair';
      };

      // Add color-coded markers for each cafe
      cafes.forEach(cafe => {
        const isTop3 = top3CafeIds.has(cafe.id);
        const markerColor = getMarkerColor(cafe, isTop3);
        const tierLabel = getTierLabel(cafe, isTop3);
        
        // Create custom colored marker
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="
            background-color: ${markerColor};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            color: ${cafe.vibeScore >= 60 ? 'white' : 'black'};
          ">☕</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        
        const marker = L.marker([cafe.latitude, cafe.longitude], { icon: customIcon });
        
        marker.bindPopup(`
          <div style="padding: 10px; min-width: 180px;">
            <h3 style="margin: 0 0 6px 0; font-weight: bold; color: #333;">${cafe.name}</h3>
            <div style="margin: 4px 0; font-size: 15px; font-weight: bold; color: ${markerColor};">
              ${cafe.vibeScore}/100 • ${tierLabel}
            </div>
            <div style="margin: 4px 0; font-size: 13px; color: #666;">
              📍 ${cafe.neighborhood}
            </div>
            <div style="margin: 4px 0; font-size: 13px; color: #666;">
              ${cafe.priceLevel} • ⭐ ${cafe.rating} (${cafe.reviewCount} reviews)
            </div>
            <div style="margin-top: 8px; text-align: center;">
              <button 
                onclick="window.openCafeDetails('${cafe.id}')"
                style="
                  background: var(--primary, #8B5CF6); 
                  color: white; 
                  border: none; 
                  padding: 6px 12px; 
                  border-radius: 6px; 
                  cursor: pointer; 
                  font-size: 12px;
                  font-weight: 500;
                "
                onmouseover="this.style.opacity='0.9'"
                onmouseout="this.style.opacity='1'"
              >
                View Details
              </button>
            </div>
          </div>
        `);
        
        marker.addTo(map);
        markersRef.current.push(marker);
      });

      // Fit map to show all markers if we have any
      if (markersRef.current.length > 0) {
        const group = new (L as any).featureGroup(markersRef.current);
        map.fitBounds(group.getBounds(), { 
          padding: [20, 20],
          maxZoom: 15
        });
      }
    }

    addMarkers();
  }, [mapReady, cafes, isLoading]);

  // Add user location marker
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !userLocation) return;

    async function addUserMarker() {
      const L = await import("leaflet");
      const map = mapInstanceRef.current;

      // Remove existing user marker
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
      }

      // Create a custom user location marker
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div style="
          background-color: #FF4444;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: -8px;
            left: -8px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: rgba(255, 68, 68, 0.2);
            animation: pulse 2s infinite;
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(0.8); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.3; }
            100% { transform: scale(0.8); opacity: 1; }
          }
        </style>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const userMarker = L.marker([userLocation!.latitude, userLocation!.longitude], { 
        icon: userIcon,
        zIndexOffset: 1000 // Keep user marker on top
      });

      userMarker.bindPopup(`
        <div style="padding: 10px; min-width: 120px; text-align: center;">
          <h3 style="margin: 0 0 6px 0; font-weight: bold; color: #333;">📍 You are here</h3>
          <div style="font-size: 12px; color: #666;">
            ${userLocation!.latitude.toFixed(4)}, ${userLocation!.longitude.toFixed(4)}
          </div>
        </div>
      `);

      userMarker.addTo(map);
      userMarkerRef.current = userMarker;
    }

    addUserMarker();
  }, [mapReady, userLocation]);

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
        <>
          <div className="absolute top-4 right-4 bg-background/90 text-foreground px-2 py-1 rounded text-sm shadow">
            {cafes.length} cafés on map
          </div>
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-background/95 text-foreground p-3 rounded-lg shadow-lg border">
            <h4 className="font-semibold text-sm mb-2">Vibe Score Legend</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FFD700' }}></div>
                <span>🏆 Top 3 & Elite (80+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#32CD32' }}></div>
                <span>70-79: Excellent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#4169E1' }}></div>
                <span>60-69: Good</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#808080' }}></div>
                <span>Below 60: Fair</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
