import { type User, type InsertUser, type Cafe, type InsertCafe } from "@shared/schema";
import { randomUUID } from "crypto";
import { calculateVibeScore } from "../client/src/lib/vibe-calculator";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCafes(): Promise<Cafe[]>;
  getCafe(id: string): Promise<Cafe | undefined>;
  createCafe(cafe: InsertCafe): Promise<Cafe>;
  updateCafe(id: string, updates: Partial<InsertCafe>): Promise<Cafe | undefined>;
  searchCafes(query: string): Promise<Cafe[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cafes: Map<string, Cafe>;

  constructor() {
    this.users = new Map();
    this.cafes = new Map();
    this.seedCafes();
  }

  private seedCafes() {
    const sampleCafes: InsertCafe[] = [
      {
        id: "cafe-1",
        name: "The Grind Coffee Co.",
        address: "123 King Street W, Hamilton, ON",
        neighborhood: "Downtown Hamilton",
        latitude: 43.2557,
        longitude: -79.8711,
        rating: 4.6,
        reviewCount: 128,
        priceLevel: "$$",
        imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        tags: ["Single Origin", "Pour Over", "WiFi"],
        yelpId: "the-grind-coffee-co-hamilton",
        phone: "(905) 123-4567",
        openingHours: {
          "Monday": "7:00 AM - 8:00 PM",
          "Tuesday": "7:00 AM - 8:00 PM",
          "Wednesday": "7:00 AM - 8:00 PM",
          "Thursday": "7:00 AM - 8:00 PM",
          "Friday": "7:00 AM - 9:00 PM",
          "Saturday": "8:00 AM - 9:00 PM",
          "Sunday": "8:00 AM - 6:00 PM"
        }
      },
      {
        id: "cafe-2",
        name: "Mulberry Coffee House",
        address: "456 King Street W, Hamilton, ON",
        neighborhood: "Westdale Village",
        latitude: 43.2601,
        longitude: -79.9311,
        rating: 4.4,
        reviewCount: 95,
        priceLevel: "$$",
        imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        tags: ["Local Roaster", "Study Friendly", "Quiet"],
        yelpId: "mulberry-coffee-house-hamilton",
        phone: "(905) 234-5678",
        openingHours: {
          "Monday": "6:30 AM - 7:00 PM",
          "Tuesday": "6:30 AM - 7:00 PM",
          "Wednesday": "6:30 AM - 7:00 PM",
          "Thursday": "6:30 AM - 7:00 PM",
          "Friday": "6:30 AM - 8:00 PM",
          "Saturday": "7:00 AM - 8:00 PM",
          "Sunday": "7:00 AM - 6:00 PM"
        }
      },
      {
        id: "cafe-3",
        name: "Sunrise Specialty Coffee",
        address: "789 James Street N, Hamilton, ON",
        neighborhood: "James Street North",
        latitude: 43.2565,
        longitude: -79.8693,
        rating: 4.8,
        reviewCount: 203,
        priceLevel: "$$$",
        imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        tags: ["Artisan Roasted", "Specialty Drinks", "Instagram Worthy"],
        yelpId: "sunrise-specialty-coffee-hamilton",
        phone: "(905) 345-6789",
        openingHours: {
          "Monday": "7:00 AM - 6:00 PM",
          "Tuesday": "7:00 AM - 6:00 PM",
          "Wednesday": "7:00 AM - 6:00 PM",
          "Thursday": "7:00 AM - 6:00 PM",
          "Friday": "7:00 AM - 7:00 PM",
          "Saturday": "8:00 AM - 7:00 PM",
          "Sunday": "8:00 AM - 5:00 PM"
        }
      },
      {
        id: "cafe-4",
        name: "Bean & Brew Collective",
        address: "321 Locke Street S, Hamilton, ON",
        neighborhood: "Locke Street",
        latitude: 43.2523,
        longitude: -79.8794,
        rating: 4.3,
        reviewCount: 76,
        priceLevel: "$$",
        imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        tags: ["Neighborhood Feel", "Outdoor Patio"],
        yelpId: "bean-brew-collective-hamilton",
        phone: "(905) 456-7890",
        openingHours: {
          "Monday": "7:00 AM - 5:00 PM",
          "Tuesday": "7:00 AM - 5:00 PM",
          "Wednesday": "7:00 AM - 5:00 PM",
          "Thursday": "7:00 AM - 5:00 PM",
          "Friday": "7:00 AM - 6:00 PM",
          "Saturday": "8:00 AM - 6:00 PM",
          "Sunday": "8:00 AM - 4:00 PM"
        }
      },
      {
        id: "cafe-5",
        name: "Steam Whistle Café",
        address: "654 Barton Street E, Hamilton, ON",
        neighborhood: "International Village",
        latitude: 43.2489,
        longitude: -79.8653,
        rating: 4.5,
        reviewCount: 164,
        priceLevel: "$$",
        imageUrl: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        tags: ["Espresso Bar", "Industrial Vibe", "Open Late"],
        yelpId: "steam-whistle-cafe-hamilton",
        phone: "(905) 567-8901",
        openingHours: {
          "Monday": "6:00 AM - 10:00 PM",
          "Tuesday": "6:00 AM - 10:00 PM",
          "Wednesday": "6:00 AM - 10:00 PM",
          "Thursday": "6:00 AM - 10:00 PM",
          "Friday": "6:00 AM - 11:00 PM",
          "Saturday": "7:00 AM - 11:00 PM",
          "Sunday": "7:00 AM - 9:00 PM"
        }
      },
      {
        id: "cafe-6",
        name: "Retro Roasters",
        address: "987 King Street E, Hamilton, ON",
        neighborhood: "King Street East",
        latitude: 43.2590,
        longitude: -79.8590,
        rating: 4.2,
        reviewCount: 89,
        priceLevel: "$$",
        imageUrl: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        tags: ["Vintage Vibe", "Board Games", "Comfy Seating"],
        yelpId: "retro-roasters-hamilton",
        phone: "(905) 678-9012",
        openingHours: {
          "Monday": "7:00 AM - 7:00 PM",
          "Tuesday": "7:00 AM - 7:00 PM",
          "Wednesday": "7:00 AM - 7:00 PM",
          "Thursday": "7:00 AM - 7:00 PM",
          "Friday": "7:00 AM - 8:00 PM",
          "Saturday": "8:00 AM - 8:00 PM",
          "Sunday": "8:00 AM - 6:00 PM"
        }
      }
    ];

    sampleCafes.forEach(cafe => {
      const vibeScore = calculateVibeScore(cafe.rating, cafe.reviewCount, cafe.priceLevel, cafe.tags || []);
      this.cafes.set(cafe.id, { ...cafe, vibeScore });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCafes(): Promise<Cafe[]> {
    return Array.from(this.cafes.values()).sort((a, b) => b.vibeScore - a.vibeScore);
  }

  async getCafe(id: string): Promise<Cafe | undefined> {
    return this.cafes.get(id);
  }

  async createCafe(insertCafe: InsertCafe): Promise<Cafe> {
    const id = insertCafe.id || randomUUID();
    const vibeScore = calculateVibeScore(insertCafe.rating, insertCafe.reviewCount, insertCafe.priceLevel, insertCafe.tags || []);
    const cafe: Cafe = { ...insertCafe, id, vibeScore };
    this.cafes.set(id, cafe);
    return cafe;
  }

  async updateCafe(id: string, updates: Partial<InsertCafe>): Promise<Cafe | undefined> {
    const existingCafe = this.cafes.get(id);
    if (!existingCafe) return undefined;

    const updatedCafe = { ...existingCafe, ...updates };
    if (updates.rating || updates.reviewCount || updates.priceLevel || updates.tags) {
      updatedCafe.vibeScore = calculateVibeScore(
        updatedCafe.rating,
        updatedCafe.reviewCount,
        updatedCafe.priceLevel,
        updatedCafe.tags || []
      );
    }
    
    this.cafes.set(id, updatedCafe);
    return updatedCafe;
  }

  async searchCafes(query: string): Promise<Cafe[]> {
    const allCafes = await this.getCafes();
    if (!query.trim()) return allCafes;

    const lowercaseQuery = query.toLowerCase();
    return allCafes.filter(cafe => 
      cafe.name.toLowerCase().includes(lowercaseQuery) ||
      cafe.neighborhood.toLowerCase().includes(lowercaseQuery) ||
      (cafe.tags || []).some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
}

function calculateVibeScore(rating: number, reviewCount: number, priceLevel: string, tags: string[]): number {
  // Base score from rating (0-50 points)
  const ratingScore = (rating / 5) * 50;
  
  // Review count score (0-20 points)
  const reviewScore = Math.min(reviewCount / 200 * 20, 20);
  
  // Price level score (0-15 points) - $$ is optimal
  const priceScores: Record<string, number> = { "$": 10, "$$": 15, "$$$": 10, "$$$$": 5 };
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

export const storage = new MemStorage();
