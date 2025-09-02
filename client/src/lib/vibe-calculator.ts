export function calculateVibeScore(
  rating: number, 
  reviewCount: number, 
  priceLevel: string, 
  tags: string[]
): number {
  // Base score from rating (0-60 points) - increased weight for quality
  // Handle both 5-point and 10-point scales
  const normalizedRating = rating > 5 ? rating / 10 : rating / 5;
  let ratingScore = Math.min(normalizedRating * 60, 60);
  
  // Bonus for exceptional ratings (9.0+ gets extra points)
  if (rating >= 9.0) {
    ratingScore += 5; // Excellence bonus
  }
  
  // Review count score (0-15 points) - reduced weight, easier to max out
  const reviewScore = Math.min(reviewCount / 50 * 15, 15);
  
  // Price level score (0-15 points) - $$ is optimal
  const priceScores: Record<string, number> = { 
    "$": 10, 
    "$$": 15, 
    "$$$": 10, 
    "$$$$": 5 
  };
  const priceScore = priceScores[priceLevel] || 0;
  
  // Coffee keyword bonus (0-20 points) - increased for specialty focus
  const coffeeKeywords = [
    "Single Origin", "Pour Over", "Artisan Roasted", "Specialty Drinks",
    "Local Roaster", "Espresso Bar", "French Press", "Cold Brew",
    "Organic", "Fair Trade", "Third Wave", "Latte Art", "Specialty Coffee"
  ];
  
  const keywordMatches = tags.filter(tag => 
    coffeeKeywords.some(keyword => tag.includes(keyword))
  ).length;
  const keywordScore = Math.min(keywordMatches * 5, 20);
  
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
