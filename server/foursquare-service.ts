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
  private readonly baseUrl = 'https://api.foursquare.com/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': this.apiKey,
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
  ): Promise<FoursquareVenue[]> {
    const params = {
      categories: '13035,13038', // Coffee shop and Cafe categories
      ll: `${latitude},${longitude}`,
      radius: radius.toString(),
      limit: limit.toString(),
      fields: 'name,location,categories,rating,stats,price,photos,website,tel,hours,tips',
      sort: 'RELEVANCE'
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

  // Convert Foursquare venue to our Cafe format
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

    return {
      id: venue.fsq_id,
      name: venue.name,
      address: address,
      neighborhood: neighborhood,
      latitude: venue.location.geocodes.main.latitude,
      longitude: venue.location.geocodes.main.longitude,
      rating: venue.rating || 0,
      reviewCount: venue.stats?.total_ratings || 0,
      priceLevel: venue.price === 1 ? '$' : venue.price === 3 ? '$$$' : venue.price === 4 ? '$$$$' : '$$', // Convert number to string format
      tags: tags.length > 0 ? tags : ['Coffee'], // Ensure at least one tag
      imageUrl: venue.photos?.[0] 
        ? `${venue.photos[0].prefix}300x300${venue.photos[0].suffix}`
        : '/placeholder-cafe.jpg',
      website: venue.website || null,
      phone: venue.tel || null,
      openingHours: venue.hours?.display ? { general: venue.hours.display } : {},
      description: venue.tips?.[0]?.text || `Coffee shop in ${neighborhood}, Hamilton`
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