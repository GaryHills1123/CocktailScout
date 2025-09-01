import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapView } from "@/components/map-view";
import { CafeList } from "@/components/cafe-list";
import { useCafes } from "@/hooks/use-cafes";
import { Search, Map, List } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<"map" | "list">("map");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [sortBy, setSortBy] = useState("vibe");
  
  const isMobile = useIsMobile();
  const { data: cafes, isLoading, error } = useCafes(searchQuery);

  const toggleView = () => {
    setCurrentView(currentView === "map" ? "list" : "map");
  };

  const filters = ["All", "Open Now", "Study Spots", "Outdoor Seating"];

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
                <h1 className="text-xl font-serif font-semibold" data-testid="title-app">vibecode</h1>
                <p className="text-sm opacity-90">best coffee vibes in Hamilton</p>
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

      {/* Search Bar */}
      <div className="sticky top-0 z-20 search-floating border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search cafés in Hamilton..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 bg-card border-border"
              data-testid="input-search"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Map View */}
        <div 
          className={`w-full lg:w-1/2 xl:w-3/5 ${isMobile && currentView === "list" ? "hidden" : "block"}`}
          data-testid="container-map"
        >
          <MapView cafes={cafes || []} isLoading={isLoading} />
        </div>

        {/* Café List */}
        <div 
          className={`w-full lg:w-1/2 xl:w-2/5 bg-card ${isMobile && currentView === "map" ? "hidden" : "block"}`}
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
