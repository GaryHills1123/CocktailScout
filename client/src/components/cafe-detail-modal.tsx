import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Star, 
  Users, 
  DollarSign,
  X,
  ExternalLink,
  MessageSquare,
  Navigation
} from "lucide-react";
import { type CafeDetails } from "@shared/schema";

interface CafeDetailModalProps {
  cafeId: string | null;
  onClose: () => void;
  userLocation?: { latitude: number; longitude: number };
}

export function CafeDetailModal({ cafeId, onClose, userLocation }: CafeDetailModalProps) {
  const { data: cafeDetails, isLoading, error } = useQuery<CafeDetails>({
    queryKey: ['/api/cafes', cafeId, 'details'],
    enabled: !!cafeId,
  });

  // Helper function to open directions
  const openDirections = (lat: number, lng: number) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    if (isIOS || isMac) {
      // Open in Apple Maps with origin and destination
      if (userLocation) {
        window.open(`http://maps.apple.com/?saddr=${userLocation.latitude},${userLocation.longitude}&daddr=${lat},${lng}&dirflg=d`, '_blank');
      } else {
        window.open(`http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`, '_blank');
      }
    } else {
      // Open in Google Maps with origin and destination
      if (userLocation) {
        window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${lat},${lng}`, '_blank');
      } else {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
      }
    }
  };

  if (!cafeId) return null;

  return (
    <Dialog open={!!cafeId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden z-[9999]" style={{ zIndex: 9999 }}>
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading café details...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-destructive mb-4">Failed to load café details</p>
            <Button onClick={onClose} variant="outline">Close</Button>
          </div>
        ) : cafeDetails ? (
          <>
            {/* Header with close button */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white"
                onClick={onClose}
                data-testid="button-close-modal"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Hero image */}
              {cafeDetails.photos.length > 0 ? (
                <div className="h-64 overflow-hidden bg-muted">
                  <img
                    src={cafeDetails.photos[0].url}
                    alt={cafeDetails.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-64 bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <p>No photos available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <ScrollArea className="max-h-[calc(90vh-16rem)]">
              <div className="p-6 space-y-6">
                {/* Header info */}
                <div>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold" data-testid="text-cafe-name">
                      {cafeDetails.name}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4" />
                    <span data-testid="text-cafe-address">{cafeDetails.address}</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium" data-testid="text-cafe-rating">
                        {cafeDetails.rating.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">
                        ({cafeDetails.reviewCount} reviews)
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span data-testid="text-cafe-price">{cafeDetails.priceLevel}</span>
                    </div>

                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Vibe Score: {Math.round(cafeDetails.vibeScore)}
                    </Badge>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {cafeDetails.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" data-testid={`tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Contact info */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Contact Information</h3>
                  
                  {cafeDetails.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`tel:${cafeDetails.phone}`}
                        className="text-primary hover:underline"
                        data-testid="link-phone"
                      >
                        {cafeDetails.phone}
                      </a>
                    </div>
                  )}

                  {cafeDetails.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={cafeDetails.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                        data-testid="link-website"
                      >
                        Visit Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                    <button 
                      onClick={() => openDirections(cafeDetails.latitude, cafeDetails.longitude)}
                      className="text-primary hover:underline flex items-center gap-1"
                      data-testid="button-directions"
                    >
                      Get Directions
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Opening hours */}
                {cafeDetails.hours?.display && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Opening Hours
                      </h3>
                      <div className="text-sm">
                        <p data-testid="text-opening-hours">{cafeDetails.hours.display}</p>
                        {cafeDetails.hours.openNow !== undefined && (
                          <Badge 
                            variant={cafeDetails.hours.openNow ? "default" : "secondary"}
                            className="mt-2"
                          >
                            {cafeDetails.hours.openNow ? "Open Now" : "Closed"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Description */}
                {cafeDetails.description && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-semibold">About</h3>
                      <p className="text-muted-foreground leading-relaxed" data-testid="text-description">
                        {cafeDetails.description}
                      </p>
                    </div>
                  </>
                )}

                {/* Reviews */}
                {cafeDetails.reviews.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Recent Reviews
                      </h3>
                      <div className="space-y-4">
                        {cafeDetails.reviews.slice(0, 3).map((review, index) => (
                          <div key={index} className="bg-muted/30 p-3 rounded-lg">
                            <p className="text-sm leading-relaxed mb-2" data-testid={`review-text-${index}`}>
                              {review.text}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.date).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Photo gallery */}
                {cafeDetails.photos.length > 1 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-semibold">Photos</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {cafeDetails.photos.slice(1, 7).map((photo, index) => (
                          <div key={photo.id} className="aspect-square overflow-hidden rounded-lg bg-muted">
                            <img
                              src={photo.url}
                              alt={`${cafeDetails.name} photo ${index + 2}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                              data-testid={`photo-${index + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}