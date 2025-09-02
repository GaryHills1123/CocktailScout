import { type Cafe } from "@shared/schema";
import { VibeScoreRing } from "./vibe-score-ring.tsx";
import { Badge } from "@/components/ui/badge";

interface CafeCardProps {
  cafe: Cafe;
  onClick?: (cafeId: string) => void;
}

export function CafeCard({ cafe, onClick }: CafeCardProps) {
  const handleClick = () => {
    onClick?.(cafe.id);
  };

  return (
    <div 
      className="cafe-card p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
      data-testid={`card-cafe-${cafe.id}`}
      onClick={handleClick}
    >
      <div className="flex space-x-4">
        {/* Café Image */}
        <img 
          src={cafe.imageUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=120"} 
          alt={`${cafe.name} interior`}
          className="w-20 h-20 rounded-lg object-cover flex-shrink-0" 
          data-testid={`img-cafe-${cafe.id}`}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground truncate" data-testid={`text-cafe-name-${cafe.id}`}>
                {cafe.name}
              </h3>
              <p className="text-sm text-muted-foreground" data-testid={`text-neighborhood-${cafe.id}`}>
                {cafe.neighborhood}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm" data-testid={`text-rating-${cafe.id}`}>
                  ⭐ {cafe.rating}
                </span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground" data-testid={`text-reviews-${cafe.id}`}>
                  {cafe.reviewCount} reviews
                </span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm" data-testid={`text-price-${cafe.id}`}>
                  {cafe.priceLevel}
                </span>
              </div>
            </div>
            
            {/* Vibe Score */}
            <div className="flex flex-col items-center">
              <VibeScoreRing score={cafe.vibeScore} />
              <span className="text-xs text-muted-foreground mt-1">vibe</span>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {cafe.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant={index === 0 && cafe.vibeScore >= 85 ? "default" : "secondary"}
                className={`text-xs ${
                  index === 0 && cafe.vibeScore >= 85
                    ? "bg-accent/20 text-accent-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
                data-testid={`badge-tag-${cafe.id}-${index}`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
