import type { Cafe } from '../shared/schema.js';

export interface FoursquareVenue {
  fsq_id: string;
  name: string;
  location: {
    address?: string;
    locality?: string;
    region?: string;
    postcode?: string;
    country?: string;
    formatted_address?: string;
    geocodes: {
      main: {
        latitude: number;
        longitude: number;
      };
    };
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
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.foursquare.com/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add auth parameters for v2 API
    url.searchParams.append('client_id', this.apiKey);
    url.searchParams.append('client_secret', ''); // Legacy keys often don't need secret
    url.searchParams.append('v', '20231010'); // API version date
    
    console.log('Making Foursquare API request to:', url.toString());
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Foursquare API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async searchCoffeeShops(
    latitude: number = 43.2557, // Hamilton, Ontario
    longitude: number = -79.8711,
    radius: number = 10000, // 10km radius
    limit: number = 50
  ): Promise<any[]> {
    const params = {
      categoryId: '4bf58dd8d48988d116941735', // Coffee shop category for v2 API
      ll: `${latitude},${longitude}`,
      radius: radius.toString(),
      limit: Math.min(limit, 50).toString(), // v2 API max is 50
      intent: 'browse'
    };

    const response = await this.makeRequest('/venues/search', params);
    return response.response?.venues || [];
  }

  async searchByQuery(
    query: string,
    latitude: number = 43.2557,
    longitude: number = -79.8711,
    radius: number = 10000,
    limit: number = 50
  ): Promise<any[]> {
    const params = {
      query,
      ll: `${latitude},${longitude}`,
      radius: radius.toString(),
      limit: Math.min(limit, 50).toString(),
      intent: 'browse'
    };

    const response = await this.makeRequest('/venues/search', params);
    return response.response?.venues || [];
  }

  // Convert legacy v2 venue to our Cafe format
  convertToCafe(venue: any): Cafe {
    const address = venue.location?.formattedAddress?.join(', ') || 
      [venue.location?.address, venue.location?.city, venue.location?.state]
        .filter(Boolean)
        .join(', ');

    // Extract tags from categories
    const tags: string[] = [];
    
    // Add category-based tags
    venue.categories?.forEach((cat: any) => {
      if (cat.name.toLowerCase().includes('coffee')) tags.push('Coffee');
      if (cat.name.toLowerCase().includes('cafe')) tags.push('Café');
      if (cat.name.toLowerCase().includes('espresso')) tags.push('Espresso');
    });

    // Determine neighborhood from address  
    let neighborhood = 'Hamilton';
    const addressLower = address.toLowerCase();
    if (addressLower.includes('james') || addressLower.includes('downtown')) neighborhood = 'Downtown';
    else if (addressLower.includes('westdale')) neighborhood = 'Westdale';
    else if (addressLower.includes('barton')) neighborhood = 'Barton';
    else if (addressLower.includes('stinson')) neighborhood = 'Stinson';
    else if (addressLower.includes('locke')) neighborhood = 'Locke Street';

    return {
      id: venue.id,
      name: venue.name,
      address: address,
      neighborhood: neighborhood,
      latitude: venue.location?.lat || 0,
      longitude: venue.location?.lng || 0,
      rating: venue.rating || 0,
      reviewCount: venue.stats?.checkinsCount || venue.stats?.usersCount || 0,
      priceLevel: venue.price?.tier === 1 ? '$' : venue.price?.tier === 3 ? '$$$' : venue.price?.tier === 4 ? '$$$$' : '$$',
      tags: tags.length > 0 ? tags : ['Coffee'], // Ensure at least one tag
      imageUrl: venue.photos?.groups?.[0]?.items?.[0] 
        ? `${venue.photos.groups[0].items[0].prefix}300x300${venue.photos.groups[0].items[0].suffix}`
        : '/placeholder-cafe.jpg',
      website: venue.url || null,
      phone: venue.contact?.phone || null,
      openingHours: venue.hours?.status ? { general: venue.hours.status } : {},
      description: `Coffee shop in ${neighborhood}, Hamilton`
    };
  }

  async getCoffeeShopsForHamilton(): Promise<Cafe[]> {
    try {
      console.log('Fetching coffee shops from Foursquare...');
      
      const venues = await this.searchCoffeeShops();
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
}