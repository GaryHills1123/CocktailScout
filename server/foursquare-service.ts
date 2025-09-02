import type { Cafe } from '../shared/schema.js';
import { calculateVibeScore } from '../client/src/lib/vibe-calculator.js';

export interface FoursquareVenue {
  fsq_place_id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  location: {
    address?: string;
    locality?: string;
    region?: string;
    postcode?: string;
    country?: string;
    formatted_address?: string;
  };
  categories: Array<{
    id: number;
    name: string;
    short_name?: string;
    plural_name?: string;
  }>;
  rating?: number;
  stats?: {
    total_ratings?: number;
  };
  price?: number;
  photos?: Array<{
    id: string;
    created_at: string;
    prefix: string;
    suffix: string;
    width: number;
    height: number;
  }>;
  website?: string;
  tel?: string;
  hours?: {
    display: string;
    is_local_holiday: boolean;
    open_now: boolean;
    regular: Array<{
      close: string;
      day: number;
      open: string;
    }>;
  };
  tips?: Array<{
    text: string;
    created_at: string;
  }>;
}

export interface FoursquareResponse {
  results: FoursquareVenue[];
}

export class FoursquareService {
  private readonly apiKey?: string;
  private readonly clientId?: string;
  private readonly clientSecret?: string;
  private readonly baseUrl = 'https://places-api.foursquare.com';
  private accessToken?: string;
  private tokenExpiry?: number;

  constructor(apiKey?: string, clientId?: string, clientSecret?: string) {
    if (apiKey) {
      // Service API Key approach - new API keys don't need fsq3 prefix
      this.apiKey = apiKey;
    } else if (clientId && clientSecret) {
      // OAuth approach
      this.clientId = clientId;
      this.clientSecret = clientSecret;
    } else {
      throw new Error('Either apiKey or clientId+clientSecret must be provided');
    }
  }

  private async getAccessToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('OAuth credentials not configured');
    }

    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    console.log('Getting OAuth access token...');
    
    const response = await fetch('https://foursquare.com/oauth2/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials'
      })
    });

    if (!response.ok) {
      throw new Error(`OAuth token request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    // Set expiry to 1 hour from now (default for client credentials)
    this.tokenExpiry = Date.now() + (3600 * 1000);
    
    console.log('OAuth access token obtained successfully');
    return this.accessToken;
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    console.log('Making Foursquare v3 API request to:', url.toString());

    let authHeader: string;
    if (this.apiKey) {
      // Service API Key - v3 requires Bearer prefix
      authHeader = `Bearer ${this.apiKey}`;
    } else {
      // OAuth token
      const token = await this.getAccessToken();
      authHeader = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': authHeader,
        'X-Places-Api-Version': '2025-06-17',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Foursquare API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async searchCoffeeShops(
    latitude: number,
    longitude: number,
    radius: number = 10000, // 10km radius
    limit: number = 50
  ): Promise<FoursquareVenue[]> {
    const params = {
      query: 'coffee',
      ll: `${latitude},${longitude}`,
      radius: radius.toString(),
      limit: limit.toString(),
      fields: 'fsq_place_id,name,location,latitude,longitude,rating,price,stats,photos'
    };

    const response: FoursquareResponse = await this.makeRequest('/places/search', params);
    return response.results || [];
  }

  async searchByQuery(
    query: string,
    latitude: number = 43.2557,
    longitude: number = -79.8711,
    radius: number = 10000,
    limit: number = 50
  ): Promise<FoursquareVenue[]> {
    const params = {
      query,
      categories: '13035,13038', // Coffee shop and Cafe categories  
      ll: `${latitude},${longitude}`,
      radius: radius.toString(),
      limit: limit.toString(),
      fields: 'name,location,categories,rating,stats,price,photos,website,tel,hours,tips'
    };

    const response: FoursquareResponse = await this.makeRequest('/places/search', params);
    return response.results || [];
  }

  // Convert Foursquare v3 venue to our Cafe format
  convertToCafe(venue: FoursquareVenue): Cafe {
    const address = venue.location.formatted_address || 
      [venue.location.address, venue.location.locality, venue.location.region]
        .filter(Boolean)
        .join(', ');

    // Extract tags from categories and other data
    const tags: string[] = [];
    
    // Add category-based tags
    venue.categories?.forEach(cat => {
      if (cat.name.toLowerCase().includes('coffee')) tags.push('Coffee');
      if (cat.name.toLowerCase().includes('cafe')) tags.push('Café');
      if (cat.name.toLowerCase().includes('espresso')) tags.push('Espresso');
    });

    // Add tags based on tips/reviews content
    const tipTexts = venue.tips?.map(t => t.text.toLowerCase()).join(' ') || '';
    if (tipTexts.includes('wifi') || tipTexts.includes('laptop')) tags.push('WiFi');
    if (tipTexts.includes('study') || tipTexts.includes('work')) tags.push('Study Friendly');
    if (tipTexts.includes('pour over') || tipTexts.includes('single origin')) tags.push('Specialty Coffee');
    if (tipTexts.includes('quiet')) tags.push('Quiet');
    if (tipTexts.includes('busy') || tipTexts.includes('popular')) tags.push('Bustling');

    // Determine neighborhood from address
    let neighborhood = 'Hamilton';
    const addressLower = address.toLowerCase();
    if (addressLower.includes('james') || addressLower.includes('downtown')) neighborhood = 'Downtown';
    else if (addressLower.includes('westdale')) neighborhood = 'Westdale';
    else if (addressLower.includes('barton')) neighborhood = 'Barton';
    else if (addressLower.includes('stinson')) neighborhood = 'Stinson';
    else if (addressLower.includes('locke')) neighborhood = 'Locke Street';

    const rating = venue.rating || 0;
    const reviewCount = venue.stats?.total_ratings || 0;
    const priceLevel = venue.price === 1 ? '$' : venue.price === 3 ? '$$$' : venue.price === 4 ? '$$$$' : '$$';
    const finalTags = tags.length > 0 ? tags : ['Coffee'];
    
    // Calculate vibe score
    const vibeScore = calculateVibeScore(rating, reviewCount, priceLevel, finalTags);

    return {
      id: venue.fsq_place_id,
      name: venue.name,
      address: address,
      neighborhood: neighborhood,
      latitude: venue.latitude || 43.2557,
      longitude: venue.longitude || -79.8711,
      rating: rating,
      reviewCount: reviewCount,
      priceLevel: priceLevel,
      tags: finalTags,
      vibeScore: vibeScore,
      imageUrl: venue.photos?.[0] 
        ? `${venue.photos[0].prefix}300x300${venue.photos[0].suffix}`
        : 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      website: venue.website || null,
      phone: venue.tel || null,
      openingHours: venue.hours?.display ? { general: venue.hours.display } : {},
      description: venue.tips?.[0]?.text || `Coffee shop in ${neighborhood}, Hamilton`
    };
  }

  async getCoffeeShopsForLocation(latitude: number, longitude: number): Promise<Cafe[]> {
    try {
      console.log(`Fetching coffee shops from Foursquare for location: ${latitude}, ${longitude}`);
      
      const venues = await this.searchCoffeeShops(latitude, longitude);
      console.log(`Found ${venues.length} venues from Foursquare`);
      
      const cafes = venues.map(venue => this.convertToCafe(venue));
      
      console.log(`Converted ${cafes.length} venues to cafe format`);
      return cafes;
      
    } catch (error) {
      console.error('Error fetching data from Foursquare:', error);
      // Return empty array if API fails - app will fall back to any existing data
      return [];
    }
  }

  // Get detailed information for a specific café
  async getCafeDetails(placeId: string): Promise<any> {
    const params = {
      fields: 'fsq_place_id,name,location,latitude,longitude,rating,price,stats,photos,website,tel,hours,tips,description'
    };

    try {
      const response = await this.makeRequest(`/places/${placeId}`, params);
      return response;
    } catch (error) {
      console.error(`Error fetching details for café ${placeId}:`, error);
      throw error;
    }
  }

  // Keep the old method for backward compatibility, defaulting to Hamilton
  async getCoffeeShopsForHamilton(): Promise<Cafe[]> {
    return this.getCoffeeShopsForLocation(43.2557, -79.8711);
  }
}