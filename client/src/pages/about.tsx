import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { ArrowLeft, Star, Camera, MessageSquare, Users, DollarSign, Tag, Trophy } from "lucide-react";
import cocktailScoutLogo from "@assets/cocktaiscout-logo_1757258392750.png";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white text-black shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={cocktailScoutLogo} 
                alt="Cocktail Scout Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-sans font-bold text-black tracking-tight">Cocktail Scout</h1>
                <p className="text-sm text-gray-600">Gary rates best bar vibes near you</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Map
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                How Vibe Scores Work
              </CardTitle>
              <CardDescription>
                Our proprietary algorithm rates bars 0-100 based on social activity, quality, and atmosphere
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                **Cocktail Scout** uses Gary's expert algorithm to find bars with the best vibes. 
                We heavily weight **social activity** because the best bars are where people gather, 
                share experiences, and create memories. Here's exactly how we calculate each bar's vibe score:
              </p>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown (0-100 Scale)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Rating Score */}
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">Rating Quality</h3>
                    <Badge variant="secondary">Up to 45 points</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    High-quality establishments with excellent reviews get the highest base scores. 
                    Bars rated 9.0+ get a 5-point excellence bonus.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Photo Score */}
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Camera className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">Social Photos</h3>
                    <Badge variant="secondary">Up to 20 points</Badge>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700">Heavily Weighted</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Bars with lots of customer photos show active social scenes. 
                    2 points per photo, with a 5-point bonus for venues with 15+ photos.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Social Keywords */}
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">Social Vibe Keywords</h3>
                    <Badge variant="secondary">Up to 25 points</Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Heavily Weighted</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Reviews mentioning social energy words get big bonuses. We scan for:
                  </p>
                  <div className="flex flex-wrap gap-1 text-xs">
                    <Badge variant="outline">lively</Badge>
                    <Badge variant="outline">great atmosphere</Badge>
                    <Badge variant="outline">buzzing</Badge>
                    <Badge variant="outline">fun crowd</Badge>
                    <Badge variant="outline">amazing vibe</Badge>
                    <Badge variant="outline">packed</Badge>
                    <Badge variant="outline">social</Badge>
                    <Badge variant="outline">+ more</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Other Factors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-blue-600 mt-1" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">Review Count</h4>
                      <Badge variant="outline">8 pts</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">More reviews = more popular</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="h-4 w-4 text-purple-600 mt-1" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">Price Fairness</h4>
                      <Badge variant="outline">10 pts</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">$$ pricing is optimal</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="h-4 w-4 text-red-600 mt-1" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">Bar Keywords</h4>
                      <Badge variant="outline">15 pts</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Craft cocktails, live music, etc.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Trophy className="h-4 w-4 text-yellow-600 mt-1" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">Specialty Bonus</h4>
                      <Badge variant="outline">8 pts</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Cocktail bars & breweries</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Final Boost */}
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-primary">Gary's Excitement Boost</h3>
                  <Badge className="bg-primary text-primary-foreground">+10 points</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Every bar gets a +10 boost to make rankings more exciting! 
                  This pushes the best venues into the high 80s and 90s where they belong.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Examples */}
          <Card>
            <CardHeader>
              <CardTitle>What Makes a High Vibe Score?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-primary/50 pl-4">
                  <h4 className="font-semibold text-primary mb-1">85+ Score (Exceptional)</h4>
                  <p className="text-sm text-muted-foreground">
                    High ratings + lots of customer photos + reviews mentioning "amazing atmosphere," 
                    "packed," "great vibe" + reasonable prices + specialty focus
                  </p>
                </div>
                
                <div className="border-l-4 border-orange-300 pl-4">
                  <h4 className="font-semibold text-orange-600 mb-1">75-84 Score (Excellent)</h4>
                  <p className="text-sm text-muted-foreground">
                    Good ratings + some social photos + positive atmosphere reviews + decent pricing
                  </p>
                </div>
                
                <div className="border-l-4 border-slate-300 pl-4">
                  <h4 className="font-semibold text-slate-600 mb-1">Under 75 (Good/Fair)</h4>
                  <p className="text-sm text-muted-foreground">
                    Missing social proof, few photos, limited atmosphere keywords, or quality issues
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center pt-8">
            <Link href="/">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start Exploring Hamilton's Best Bars
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}