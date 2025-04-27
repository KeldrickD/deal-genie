import { v4 as uuidv4 } from 'uuid';
import type { Lead } from './zillow';

/**
 * Generates mock property leads for development and testing
 * Useful as a fallback when scrapers are rate limited or not working
 */
export function generateMockLeads(
  city: string,
  sources: string[] = [],
  keywords: string[] = [],
  priceMin: number = 100000,
  priceMax: number = 500000,
  maxDaysOnMarket: number = 30
): Lead[] {
  const streets = [
    'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Willow', 
    'Birch', 'Walnut', 'Cherry', 'Spruce'
  ];
  
  const streetTypes = [
    'Street', 'Avenue', 'Drive', 'Lane', 'Road', 'Boulevard', 
    'Circle', 'Court', 'Place', 'Way'
  ];
  
  const descriptions = [
    'Great investment opportunity! Owner needs to sell quickly due to relocation.',
    'Fixer-upper with lots of potential in a desirable neighborhood.',
    'Selling as-is, perfect for investors looking to renovate.',
    'Estate sale, property needs some TLC but has good bones.',
    'Motivated seller! Price recently reduced for quick sale.',
    'Handyman special with great potential in an up-and-coming area.',
    'Owner financing available. Must sell soon due to job transfer.',
    'Distressed property being sold below market value.',
    'Needs work but located in a high-appreciation neighborhood.',
    'Seller very motivated, all reasonable offers considered.'
  ];

  const getRandomKeywords = () => {
    // List of available keywords to match with
    const availableKeywords = [
      'as-is', 'motivated-seller', 'must-sell', 'fixer-upper',
      'needs-work', 'handyman-special', 'distressed', 'estate-sale'
    ];
    
    // If keywords were provided, filter to only include those
    const filteredKeywords = keywords.length > 0
      ? availableKeywords.filter(k => keywords.some(kw => 
          k.toLowerCase().includes(kw.toLowerCase()) || 
          kw.toLowerCase().includes(k.toLowerCase())))
      : availableKeywords;
    
    // Get 1-3 random keywords
    const numKeywords = Math.floor(Math.random() * 3) + 1;
    const randomKeywords: string[] = [];
    
    // Add random keywords from our filtered list
    for (let i = 0; i < numKeywords; i++) {
      if (filteredKeywords.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * filteredKeywords.length);
      const keyword = filteredKeywords[randomIndex];
      
      if (!randomKeywords.includes(keyword)) {
        randomKeywords.push(keyword);
      }
    }
    
    return randomKeywords;
  };

  // Get a random source from the provided ones or default to these
  const getRandomSource = () => {
    const availableSources = sources.length > 0 
      ? sources 
      : ['zillow', 'craigslist', 'facebook', 'realtor'];
    
    return availableSources[Math.floor(Math.random() * availableSources.length)];
  };

  const getRandomListingUrl = (source: string) => {
    // Map of source to base URLs
    const baseUrls: Record<string, string> = {
      zillow: 'https://www.zillow.com/homes/',
      craigslist: 'https://craigslist.org/d/real-estate-for-sale/',
      facebook: 'https://www.facebook.com/marketplace/category/propertyrentals/',
      realtor: 'https://www.realtor.com/realestateandhomes-detail/'
    };
    
    const baseUrl = baseUrls[source.toLowerCase()] || 'https://example.com/listing/';
    const randomId = Math.floor(Math.random() * 10000000);
    
    return `${baseUrl}${randomId}`;
  };

  // Generate 5-15 random leads
  const numLeads = Math.floor(Math.random() * 11) + 5;
  const leads: Lead[] = [];

  for (let i = 0; i < numLeads; i++) {
    // Generate random address
    const streetNumber = Math.floor(Math.random() * 9000) + 1000;
    const streetName = streets[Math.floor(Math.random() * streets.length)];
    const streetType = streetTypes[Math.floor(Math.random() * streetTypes.length)];
    const address = `${streetNumber} ${streetName} ${streetType}`;
    
    // Generate other random properties
    const source = getRandomSource();
    const price = Math.floor(Math.random() * (priceMax - priceMin + 1) + priceMin);
    const daysOnMarket = Math.floor(Math.random() * maxDaysOnMarket) + 1;
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    const keywordsMatched = getRandomKeywords();
    
    leads.push({
      id: `mock-${uuidv4()}`,
      address,
      city,
      price,
      days_on_market: daysOnMarket,
      description,
      source,
      keywords_matched: keywordsMatched,
      listing_url: getRandomListingUrl(source),
      created_at: new Date().toISOString()
    });
  }

  return leads;
} 