import { type User, type InsertUser, type Cafe, type InsertCafe } from "@shared/schema";
import { randomUUID } from "crypto";
import { calculateVibeScore } from "../client/src/lib/vibe-calculator";
import { FoursquareService } from "./foursquare-service.js";

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
  private foursquareService: FoursquareService | null;
  private isDataLoaded: boolean = false;
  private lastDataFetch: number = 0;
  private cacheExpiry: number = 1000 * 60 * 60; // 1 hour cache

  constructor() {
    this.users = new Map();
    this.cafes = new Map();
    
    // Initialize Foursquare service using OAuth credentials
    const clientId = process.env.FOURSQUARE_CLIENT_ID;
    const clientSecret = process.env.FOURSQUARE_CLIENT_SECRET;
    const apiKey = process.env.FOURSQUARE_API_KEY;
    
    console.log('Foursquare OAuth Client ID loaded:', clientId ? `${clientId.substring(0, 10)}...` : 'No client ID found');
    console.log('Foursquare OAuth Client Secret loaded:', clientSecret ? `${clientSecret.substring(0, 10)}...` : 'No client secret found');
    console.log('Foursquare API key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'No key found');
    
    // Try Service API key first (with Bearer token fix), fallback to OAuth
    if (apiKey) {
      this.foursquareService = new FoursquareService(apiKey);
      console.log('Using Foursquare Service API key authentication with Bearer token');
    } else if (clientId && clientSecret) {
      this.foursquareService = new FoursquareService(undefined, clientId, clientSecret);
      console.log('Using Foursquare OAuth authentication');
    } else {
      this.foursquareService = null;
      console.log('No Foursquare credentials available');
    }
    
    // Seed with sample data initially - real data will be loaded on first request  
    this.seedCafes();
    
    console.log('MemStorage initialized with Foursquare service:', !!this.foursquareService);
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
        imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" as string,
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
        address: "193 James Street N, Hamilton, ON",
        neighborhood: "James Street North",
        latitude: 43.2580,
        longitude: -79.8690,
        rating: 4.4,
        reviewCount: 95,
        priceLevel: "$$",
        imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" as string,
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
        imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" as string,
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
        imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" as string,
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
        imageUrl: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" as string,
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
        imageUrl: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" as string,
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
      this.cafes.set(cafe.id, { ...cafe, vibeScore, imageUrl: cafe.imageUrl || null, openingHours: cafe.openingHours || {} });
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
    const now = Date.now();
    
    // Check if we need to fetch fresh data (first time or cache expired)  
    const shouldFetchData = this.foursquareService && 
      (!this.isDataLoaded || (now - this.lastDataFetch > this.cacheExpiry));
    
    if (shouldFetchData) {
      try {
        console.log('Loading real coffee shop data from Foursquare...');
        const realCafes = await this.foursquareService.getCoffeeShopsForHamilton();
        console.log(`Foursquare returned ${realCafes.length} cafes`);
        
        if (realCafes.length > 0) {
          // Clear existing data and add real data
          this.cafes.clear();
          realCafes.forEach(cafe => {
            this.cafes.set(cafe.id, cafe);
          });
          this.isDataLoaded = true;
          this.lastDataFetch = now;
          console.log(`Successfully loaded ${realCafes.length} real coffee shops from Foursquare`);
        } else {
          console.log('No cafes returned from Foursquare, keeping sample data');
        }
      } catch (error) {
        console.error('Failed to load real data, using sample data:', error);
        console.error('Error details:', error.message || error);
      }
    } else if (this.isDataLoaded) {
      console.log('Using cached coffee shop data (no API call)');
    }
    
    return Array.from(this.cafes.values()).sort((a, b) => b.vibeScore - a.vibeScore);
  }

  async getCafe(id: string): Promise<Cafe | undefined> {
    return this.cafes.get(id);
  }

  async createCafe(insertCafe: InsertCafe): Promise<Cafe> {
    const id = insertCafe.id || randomUUID();
    const vibeScore = calculateVibeScore(insertCafe.rating, insertCafe.reviewCount, insertCafe.priceLevel, insertCafe.tags || []);
    const cafe: Cafe = { ...insertCafe, id, vibeScore, imageUrl: insertCafe.imageUrl || null, openingHours: insertCafe.openingHours || {} };
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
        Array.isArray(updatedCafe.tags) ? updatedCafe.tags : []
      );
    }
    
    const finalCafe: Cafe = {
      ...updatedCafe,
      imageUrl: updatedCafe.imageUrl || null,
      openingHours: updatedCafe.openingHours || {}
    };
    this.cafes.set(id, finalCafe);
    return finalCafe;
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


export const storage = new MemStorage();
