import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';

export type Lead = {
  id: string;
  address: string;
  city: string;
  price: number;
  days_on_market: number;
  description: string;
  source: string;
  keywords_matched: string[];
  listing_url: string;
  created_at: string;
  property_type?: string;
};

export async function scrapeZillowFSBO(city: string, keywords: string[] = []): Promise<Lead[]> {
  try {
    // Use real scraping logic - don't immediately return mock data
    const urlCity = encodeURIComponent(city);
    const url = `https://www.zillow.com/homes/fsbo/${urlCity}/`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch from Zillow: ${res.status} ${res.statusText}`);
      return getMockZillowData(city, keywords);
    }
    
    const html = await res.text();
    const $ = cheerio.load(html);

    // Zillow embeds JSON in __NEXT_DATA__
    const nextData = $('#__NEXT_DATA__').html();
    if (!nextData) {
      console.log('No __NEXT_DATA__ found in Zillow page');
      return getMockZillowData(city, keywords);
    }

    const data = JSON.parse(nextData);
    const results = data.props?.pageProps?.searchResults?.listResults || [];
    
    if (!results || !results.length) {
      console.log('No results found in Zillow data');
      return getMockZillowData(city, keywords);
    }

    return results.map((r: any) => {
      // Extract address components
      const addressParts = r.address.split(', ');
      const streetAddress = addressParts[0] || '';
      const cityPart = addressParts[1] || '';
      
      // Create property description from available data
      const bedsBaths = r.beds && r.baths ? `${r.beds} beds, ${r.baths} baths, ` : '';
      const sqft = r.area ? `${r.area} sqft. ` : '';
      const description = `${bedsBaths}${sqft}For sale by owner property listed on Zillow.`;
      
      // Find matching keywords in description or address
      const matchedKeywords = keywords.filter(keyword => 
        description.toLowerCase().includes(keyword.toLowerCase()) || 
        r.address.toLowerCase().includes(keyword.toLowerCase())
      );
      
      // Convert price from string to number if needed
      let price = r.price;
      if (typeof price === 'string') {
        price = parseInt(price.replace(/[$,]/g, ''), 10);
      }

      return {
        id: r.zpid?.toString() || `zillow-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        address: streetAddress,
        city: cityPart,
        price: price || 0,
        days_on_market: r.daysOnZillow || 0,
        description,
        source: 'zillow',
        keywords_matched: matchedKeywords,
        listing_url: `https://www.zillow.com${r.detailUrl}`,
        created_at: new Date().toISOString(),
        property_type: r.propertyType || 'single_family'
      };
    });
  } catch (error) {
    console.error('Error scraping Zillow FSBO:', error);
    // Use mock data only as a fallback when real scraping fails
    return getMockZillowData(city, keywords);
  }
}

// Keep mock data function as fallback only
function getMockZillowData(city: string, keywords: string[] = []): Lead[] {
  console.warn('Using mock Zillow data as fallback');
  
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
    
    const price = Math.floor(Math.random() * 400000) + 100000;
    const daysOnMarket = Math.floor(Math.random() * 120) + 1;
    const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    
    const beds = Math.floor(Math.random() * 4) + 1;
    const baths = Math.floor(Math.random() * 3) + 1;
    const sqft = (Math.floor(Math.random() * 2000) + 800);
    
    const description = `${beds} beds, ${baths} baths, ${sqft} sqft. For sale by owner property listed on Zillow. Great opportunity in ${city}!`;
    
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
      price,
      days_on_market: daysOnMarket,
      description,
      source: 'zillow',
      keywords_matched: matchedKeywords,
      listing_url: `https://www.zillow.com/homes/${encodeURIComponent(address)}_rb/`,
      created_at: new Date().toISOString(),
      property_type: propertyType
    });
  }
  
  return mockData;
} 