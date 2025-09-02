import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapView } from "@/components/map-view";
import { CafeList } from "@/components/cafe-list";
import { CafeDetailModal } from "@/components/cafe-detail-modal";
import { useCafes } from "@/hooks/use-cafes";
import { Map, List, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGeolocation } from "@/hooks/use-geolocation";
import cafeScoutLogo from "@assets/cafescout_1756830031685.webp";

export default function Home() {
  const [currentView, setCurrentView] = useState<"map" | "list">("map");
  const [sortBy, setSortBy] = useState("vibe");
  const [selectedCafeId, setSelectedCafeId] = useState<string | null>(null);
  
  const isMobile = useIsMobile();
  const { latitude, longitude, city, loading: locationLoading, error: locationError, requestLocation, permission } = useGeolocation();
  
  // Auto-request location on component mount
  useEffect(() => {
    requestLocation();
  }, []);
  
  const { data: cafes, isLoading, error } = useCafes({ 
    latitude: latitude || undefined, 
    longitude: longitude || undefined 
  });

  const toggleView = () => {
    setCurrentView(currentView === "map" ? "list" : "map");
  };

  const handleCafeClick = (cafeId: string) => {
    setSelectedCafeId(cafeId);
  };

  const handleCloseModal = () => {
    setSelectedCafeId(null);
  };


  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Cafes</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white text-black shadow-lg relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={cafeScoutLogo} 
                alt="CafeScout Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-serif font-semibold text-black" data-testid="title-app">CaféScout</h1>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600">best coffee vibes near you</p>
                  {/* Location Status */}
                  {locationLoading && (
                    <div className="flex items-center space-x-1 text-xs opacity-75">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Finding location...</span>
                    </div>
                  )}
                  {latitude && longitude && !locationLoading && (
                    <div className="flex items-center space-x-1 text-xs opacity-75">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {city ? `${city}${cafes ? ` • ${cafes.length} cafés` : ''}` :
                         cafes ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)} • ${cafes.length} cafés` : 'Finding cafés near you...'}
                      </span>
                    </div>
                  )}
                  {locationError && !locationLoading && (
                    <div className="flex items-center space-x-1 text-xs opacity-75">
                      <AlertCircle className="w-3 h-3" />
                      <span>Using Hamilton, ON</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleView}
                className="bg-gray-100 hover:bg-gray-200 text-black"
                data-testid="button-view-toggle"
              >
                {currentView === "map" ? <List className="w-4 h-4 mr-2" /> : <Map className="w-4 h-4 mr-2" />}
                {currentView === "map" ? "List" : "Map"}
              </Button>
            </div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Map View */}
        <div 
          className={`w-full ${currentView === "list" ? "hidden" : "block"} ${!isMobile ? "lg:w-1/2 xl:w-3/5 lg:block" : ""}`}
          data-testid="container-map"
        >
          <MapView 
            cafes={cafes || []} 
            isLoading={isLoading} 
            onCafeClick={handleCafeClick}
            userLocation={latitude && longitude ? { latitude, longitude } : undefined}
          />
        </div>

        {/* Café List */}
        <div 
          className={`w-full ${currentView === "map" ? "hidden" : "block"} ${!isMobile ? "lg:w-1/2 xl:w-2/5 lg:block" : ""} bg-card`}
          data-testid="container-list"
        >
          <CafeList 
            cafes={cafes || []} 
            isLoading={isLoading}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onCafeClick={handleCafeClick}
            userLocation={latitude && longitude ? { latitude, longitude } : undefined}
          />
        </div>
      </div>

      {/* Mobile Footer Toggle */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground p-4 z-30">
          <Button 
            onClick={toggleView}
            className="w-full py-3 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
            data-testid="button-mobile-toggle"
          >
            {currentView === "map" ? "Show List View" : "Show Map View"}
          </Button>
        </div>
      )}

      {/* Café Detail Modal */}
      <CafeDetailModal 
        cafeId={selectedCafeId}
        onClose={handleCloseModal}
        userLocation={latitude && longitude ? { latitude, longitude } : undefined}
      />
    </div>
  );
}
