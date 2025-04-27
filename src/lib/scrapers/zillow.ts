import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import { getStateAbbreviation } from '@/lib/utils';

export type Lead = {
  id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  days_on_market: number;
  description: string;
  source: string;
  keywords_matched: string[];
  listing_url: string;
  created_at: string;
  property_type?: string;
  listing_type: 'fsbo' | 'agent' | 'both';
};

// Add type for Zillow data structure
interface ZillowData {
  searchPageState: {
    cat1: {
      searchResults: {
        listResults: Array<{
          addressCity?: string;
          addressState?: string;
          addressZipcode?: string;
          address?: string;
          price?: string;
          daysOnZillow?: string;
          description?: string;
          isPremierBuilder?: boolean;
          isListedByOwner?: boolean;
          statusType?: string;
          detailUrl?: string;
          [key: string]: any;
        }>;
      };
    };
  };
  [key: string]: any;
}

export async function scrapeZillowFSBO(
  city: string, 
  state: string, 
  keywords: string[] = [],
  listingType: 'fsbo' | 'agent' | 'both' = 'both'
): Promise<Lead[]> {
  try {
    const stateAbbr = getStateAbbreviation(state);
    if (!stateAbbr) {
      console.error(`Invalid state name: ${state}`);
      return [];
    }

    const formattedCity = city.toLowerCase().replace(/\s+/g, '-');
    const formattedState = stateAbbr.toLowerCase();
    
    let url = `https://www.zillow.com/${formattedCity}-${formattedState}/`;
    
    // Apply listing type filter
    if (listingType === 'fsbo') {
      url += 'fsbo/';
    } else if (listingType === 'agent') {
      url += 'houses/';
    }
    
    console.log(`Scraping Zillow for ${city}, ${state} (${listingType}): ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch from Zillow: ${response.status} ${response.statusText}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Find the Zillow data in the script tag
    let jsonData: ZillowData | null = null;
    $('script').each((i, elem) => {
      const scriptContent = $(elem).html() || '';
      if (scriptContent.includes('__PRELOADED_STATE__')) {
        const match = scriptContent.match(/window\['__PRELOADED_STATE__'\]\s*=\s*({.*});/);
        if (match && match[1]) {
          try {
            jsonData = JSON.parse(match[1]) as ZillowData;
          } catch (e) {
            console.error('Failed to parse Zillow data:', e);
          }
        }
      }
    });

    if (!jsonData || !jsonData.searchPageState || !jsonData.searchPageState.cat1 || !jsonData.searchPageState.cat1.searchResults) {
      console.error('Failed to extract property data from Zillow');
      return [];
    }

    const results = jsonData.searchPageState.cat1.searchResults.listResults || [];
    console.log(`Found ${results.length} Zillow results`);

    const leads: Lead[] = [];

    for (const result of results) {
      // Filter by city and state to ensure we only get properties in the requested location
      const propertyCity = result.addressCity || '';
      const propertyState = result.addressState || '';
      
      // Skip properties that don't match the requested city/state
      if (
        propertyCity.toLowerCase() !== city.toLowerCase() ||
        propertyState.toLowerCase() !== stateAbbr.toLowerCase()
      ) {
        continue;
      }
      
      const price = parseFloat(result.price?.replace(/[^0-9.]/g, '') || '0');
      const address = result.address || '';
      const propertyZip = result.addressZipcode || '';
      const fullAddress = `${address}, ${propertyCity}, ${propertyState} ${propertyZip}`;
      
      const daysOnMarket = parseInt(result.daysOnZillow || '0', 10);
      const description = result.description || '';
      
      // Extract property type
      let propertyType = 'unknown';
      if (result.isPremierBuilder) {
        propertyType = 'new construction';
      } else if (result.statusType === 'FOR_SALE' && result.isListedByOwner) {
        propertyType = 'fsbo';
      } else if (result.statusType === 'FOR_SALE') {
        propertyType = 'for sale';
      } else if (result.statusType === 'AUCTION') {
        propertyType = 'auction'; 
      }
      
      // Determine if the keywords match
      const keywordsMatched = keywords.filter(keyword => 
        description.toLowerCase().includes(keyword.toLowerCase()) || 
        address.toLowerCase().includes(keyword.toLowerCase())
      );
      
      const lead: Lead = {
        id: uuidv4(),
        address: fullAddress,
        city: propertyCity,
        state: propertyState,
        price,
        days_on_market: daysOnMarket,
        description,
        source: 'zillow',
        keywords_matched: keywordsMatched,
        listing_url: `https://www.zillow.com${result.detailUrl}`,
        created_at: new Date().toISOString(),
        property_type: propertyType,
        listing_type: result.isListedByOwner ? 'fsbo' : 'agent'
      };
      
      leads.push(lead);
    }

    return leads;
  } catch (error) {
    console.error('Error scraping Zillow:', error);
    return [];
  }
}

// Keep mock data function as fallback only
function getMockZillowData(city: string, state: string, keywords: string[] = [], listingType: 'fsbo' | 'agent' | 'both' = 'fsbo'): Lead[] {
  console.warn(`Using mock Zillow data as fallback for ${city}, ${state}`);
  
  const streets = ['Maple', 'Oak', 'Pine', 'Elm', 'Cedar', 'Willow', 'Birch', 'Spruce'];
  const streetTypes = ['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Ct', 'Way', 'Pl'];
  const propertyTypes = ['Single Family', 'Condo', 'Townhouse', 'Multi-family'];
  
  const mockData: Lead[] = [];
  
  // Generate 3-7 random properties
  const numProperties = Math.floor(Math.random() * 5) + 3;
  
  for (let i = 0; i < numProperties; i++) {
    const streetNum = Math.floor(Math.random() * 9000) + 1000;
    const street = streets[Math.floor(Math.random() * streets.length)];
    const streetType = streetTypes[Math.floor(Math.random() * streetTypes.length)];
    const address = `${streetNum} ${street} ${streetType}`;
    
    const price = Math.floor(Math.random() * 1000000) + 200000;
    const daysOnMarket = Math.floor(Math.random() * 120) + 1;
    const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    
    const beds = Math.floor(Math.random() * 4) + 1;
    const baths = Math.floor(Math.random() * 3) + 1;
    const sqft = (Math.floor(Math.random() * 2000) + 800);
    
    const description = `${beds} beds, ${baths} baths, ${sqft} sqft. ${listingType === 'fsbo' ? 'For sale by owner' : 'Agent listed'} property in ${city}, ${state}. Great opportunity!`;
    
    // Match keywords if any
    const matchedKeywords = keywords.filter(keyword => 
      description.toLowerCase().includes(keyword.toLowerCase()) || 
      address.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // If keywords were provided but none match, add one random keyword to ensure results
    if (keywords.length > 0 && matchedKeywords.length === 0) {
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
      matchedKeywords.push(randomKeyword);
    }
    
    mockData.push({
      id: `zillow-mock-${uuidv4()}`,
      address,
      city,
      state,
      price,
      days_on_market: daysOnMarket,
      description,
      source: 'zillow',
      keywords_matched: matchedKeywords,
      listing_url: `https://www.zillow.com/homes/${encodeURIComponent(address)}_rb/`,
      created_at: new Date().toISOString(),
      property_type: propertyType,
      listing_type: listingType
    });
  }
  
  return mockData;
} 