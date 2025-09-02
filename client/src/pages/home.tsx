import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapView } from "@/components/map-view";
import { CafeList } from "@/components/cafe-list";
import { useCafes } from "@/hooks/use-cafes";
import { Map, List, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGeolocation } from "@/hooks/use-geolocation";

export default function Home() {
  const [currentView, setCurrentView] = useState<"map" | "list">("map");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [sortBy, setSortBy] = useState("vibe");
  
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

  const filters = ["All", "Open Now"];

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
      <header className="bg-primary text-primary-foreground shadow-lg relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">☕️</div>
              <div>
                <h1 className="text-xl font-serif font-semibold" data-testid="title-app">CafeScout</h1>
                <div className="flex items-center space-x-2">
                  <p className="text-sm opacity-90">best coffee vibes near you</p>
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
                        {city && cafes ? `${city} • Found ${cafes.length} cafés nearby` : 
                         city ? `${city} • Finding cafés...` :
                         cafes ? `Found ${cafes.length} cafés nearby` : 'Finding cafés near you...'}
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
                className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
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
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filters={filters}
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
    </div>
  );
}
