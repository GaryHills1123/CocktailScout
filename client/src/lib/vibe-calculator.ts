export function calculateVibeScore(
  rating: number, 
  reviewCount: number, 
  priceLevel: string, 
  tags: string[]
): number {
  // Base score from rating (0-50 points)
  const ratingScore = (rating / 5) * 50;
  
  // Review count score (0-20 points)
  const reviewScore = Math.min(reviewCount / 200 * 20, 20);
  
  // Price level score (0-15 points) - $$ is optimal
  const priceScores: Record<string, number> = { 
    "$": 10, 
    "$$": 15, 
    "$$$": 10, 
    "$$$$": 5 
  };
  const priceScore = priceScores[priceLevel] || 0;
  
  // Coffee keyword bonus (0-15 points)
  const coffeeKeywords = [
    "Single Origin", "Pour Over", "Artisan Roasted", "Specialty Drinks",
    "Local Roaster", "Espresso Bar", "French Press", "Cold Brew",
    "Organic", "Fair Trade", "Third Wave"
  ];
  
  const keywordMatches = tags.filter(tag => 
    coffeeKeywords.some(keyword => tag.includes(keyword))
  ).length;
  const keywordScore = Math.min(keywordMatches * 5, 15);
  
  const totalScore = ratingScore + reviewScore + priceScore + keywordScore;
  return Math.round(Math.min(totalScore, 100));
}

export function getScoreColor(score: number): string {
  if (score >= 85) return "hsl(40, 90%, 50%)"; // Accent color for high scores
  if (score >= 75) return "hsl(20, 60%, 35%)"; // Primary color for good scores
  return "hsl(20, 10%, 45%)"; // Muted color for lower scores
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Exceptional";
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Great";
  if (score >= 60) return "Good";
  return "Fair";
}
