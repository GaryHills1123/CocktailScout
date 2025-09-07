export function calculateVibeScore(
  rating: number, 
  reviewCount: number, 
  priceLevel: string, 
  tags: string[],
  name?: string,
  photoCount?: number,
  reviewText?: string
): number {
  // Base score from rating (0-45 points) - reduced to make room for social factors
  // Handle both 5-point and 10-point scales
  const normalizedRating = rating > 5 ? rating / 10 : rating / 5;
  let ratingScore = Math.min(normalizedRating * 45, 45);
  
  // Bonus for exceptional ratings (9.0+ gets extra points)
  if (rating >= 9.0) {
    ratingScore += 5; // Excellence bonus
  }
  
  // Review count score (0-8 points) - reduced weight
  const reviewScore = Math.min(reviewCount / 40 * 8, 8);
  
  // Price level score (0-10 points) - $$ is optimal
  const priceScores: Record<string, number> = { 
    "$": 8, 
    "$$": 10, 
    "$$$": 8, 
    "$$$$": 4 
  };
  const priceScore = priceScores[priceLevel] || 0;
  
  // 🔥 PHOTO COUNT SCORE (0-20 points) - HEAVILY WEIGHTED FOR SOCIAL ACTIVITY
  let photoScore = 0;
  if (photoCount !== undefined) {
    // More photos = more social venue, heavily weighted
    photoScore = Math.min(photoCount * 2, 20); // 2 points per photo, max 20
    if (photoCount >= 15) photoScore += 5; // Bonus for very social venues
  }
  
  // 🔥 SOCIAL KEYWORDS ANALYSIS (0-25 points) - HEAVILY WEIGHTED
  const socialKeywords = [
    // High-energy social words
    "fun", "lively", "energetic", "buzzing", "happening", "vibrant", "active",
    "crowded", "packed", "busy", "popular", "trendy", "hotspot",
    // Social atmosphere words  
    "great atmosphere", "amazing vibe", "good crowd", "fun crowd", "young crowd",
    "social", "party", "nightlife", "scene", "meet people", "hang out",
    // Activity words
    "dancing", "music", "DJ", "live band", "karaoke", "games", "trivia",
    "events", "happy hour", "late night", "weekend", "group", "friends",
    // Positive social energy
    "awesome", "incredible", "amazing", "fantastic", "love this place", "best bar"
  ];
  
  let socialScore = 0;
  if (reviewText) {
    const text = reviewText.toLowerCase();
    const matches = socialKeywords.filter(keyword => text.includes(keyword));
    socialScore = Math.min(matches.length * 3, 25); // 3 points per social keyword
    
    // Extra bonuses for really social indicators
    if (text.includes("packed") || text.includes("busy")) socialScore += 3;
    if (text.includes("amazing vibe") || text.includes("great atmosphere")) socialScore += 4;
    if (text.includes("young crowd") || text.includes("fun crowd")) socialScore += 4;
  }
  
  // Bar keyword bonus (0-15 points) - reduced to make room for social factors
  const barKeywords = [
    "Craft Cocktails", "Whiskey", "Beer Garden", "Live Music",
    "Sports Bar", "Craft Beer", "Wine Bar", "Cocktail Lounge",
    "Pub", "Brewery", "Happy Hour", "Local Brews", "Mixology"
  ];
  
  const keywordMatches = tags.filter(tag => 
    barKeywords.some(keyword => tag.includes(keyword))
  ).length;
  let keywordScore = Math.min(keywordMatches * 3, 15); // Reduced from 5 to 3 points
  
  // Specialty establishment bonus (0-8 points) - slightly reduced
  let specialtyBonus = 0;
  if (name) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('cocktail') || nameLower.includes('craft')) {
      specialtyBonus += 6; // Strong specialty indicator
    } else if (nameLower.includes('pub') || nameLower.includes('brewery') || nameLower.includes('tavern')) {
      specialtyBonus += 4; // Moderate specialty indicator
    }
  }
  
  const totalScore = ratingScore + reviewScore + priceScore + photoScore + socialScore + keywordScore + specialtyBonus;
  // Boost all scores by +10 to make rankings more exciting
  const boostedScore = totalScore + 10;
  return Math.round(Math.min(boostedScore, 100));
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
