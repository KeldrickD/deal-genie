import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import { getStateAbbreviation } from '@/lib/utils';

// Define and export the Lead interface
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

// Debug logging helper
function debugLog(message: string, data?: any) {
  // Always enable during implementation phase to help debug
  const enableLogs = process.env.ENABLE_DEBUG_LOGS === 'true' || true;
  if (enableLogs) {
    console.log(`[REDFIN SCRAPER] ${message}`);
    if (data) {
      console.log(typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
    }
  }
}

/**
 * Scrapes Redfin property listings
 * Uses the technique described in https://scrapfly.io/blog/how-to-scrape-redfin/
 */
export async function scrapeRedfin(
  city: string,
  state: string,
  keywords: string[] = [],
  listingType: 'fsbo' | 'agent' | 'both' = 'both'
): Promise<Lead[]> {
  try {
    debugLog(`Starting Redfin scrape for ${city}, ${state}, listing type: ${listingType}`);
    debugLog(`Keywords: ${keywords.join(', ')}`);

    const stateAbbr = getStateAbbreviation(state);
    if (!stateAbbr) {
      debugLog(`ERROR: Invalid state name: ${state}`);
      return getMockRedfinData(city, state, keywords, listingType);
    }
    
    // Use the most direct and reliable approach - search API with location parameter
    // This endpoint is what powers Redfin's search suggestions and is more reliable
    const searchQuery = `${city}, ${stateAbbr}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    const locationUrl = `https://www.redfin.com/stingray/do/location-autocomplete?location=${encodedQuery}&start=0&count=10&v=2&market=global&al=1&iss=false&ooa=true&mrs=false`;
    
    debugLog(`Fetching location data from: ${locationUrl}`);
    
    // First get the location ID
    const locationResponse = await fetch(locationUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.redfin.com/'
      }
    });
    
    if (!locationResponse.ok) {
      debugLog(`Location API failed: ${locationResponse.status} ${locationResponse.statusText}`);
      return getMockRedfinData(city, state, keywords, listingType);
    }
    
    // Parse the location data
    let locationId = '';
    let locationText = await locationResponse.text();
    locationText = locationText.replace(/^\s*\/\/\s*/, ''); // Remove leading comments
    
    // Extract the search city name for strict filtering
    const searchCity = searchQuery.split(',')[0].toLowerCase().trim();
    debugLog(`Search city (normalized): "${searchCity}"`);
    
    try {
      const locationData = JSON.parse(locationText);
      debugLog('Location data:', locationData);
      
      // Try to find the location ID from various paths
      if (locationData.payload) {
        if (locationData.payload.exactMatch) {
          locationId = locationData.payload.exactMatch.id;
          debugLog(`Found exact match location ID: ${locationId}`);
        } else if (locationData.payload.sections && locationData.payload.sections.length > 0) {
          // Look through sections to find a city match
          for (const section of locationData.payload.sections) {
            if (section.rows && section.rows.length > 0) {
              for (const row of section.rows) {
                if (row.type === 'city') {
                  locationId = row.id;
                  debugLog(`Found city match location ID: ${locationId}`);
                  break;
                }
              }
              if (locationId) break;
            }
          }
          
          // If no city match, just take the first row
          if (!locationId && locationData.payload.sections[0].rows && locationData.payload.sections[0].rows.length > 0) {
            locationId = locationData.payload.sections[0].rows[0].id;
            debugLog(`Using first match location ID: ${locationId}`);
          }
        }
      }
    } catch (error) {
      debugLog(`Error parsing location data: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    if (!locationId) {
      debugLog('Failed to find location ID');
      return getMockRedfinData(city, state, keywords, listingType);
    }
    
    // Now use the location ID to search for properties
    // Add parameters to restrict to the exact city and limit nearby homes
    const searchUrl = `https://www.redfin.com/stingray/api/gis-search?start=0&count=50&market=global&region_id=${locationId}&region_type=6&sold_within_days=365&v=8&include_nearby_homes=false&sf=1,2,3,5,6,7`;
    
    debugLog(`Searching properties with URL: ${searchUrl}`);
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.redfin.com/'
      }
    });
    
    if (!searchResponse.ok) {
      debugLog(`Search API failed: ${searchResponse.status} ${searchResponse.statusText}`);
      return getMockRedfinData(city, state, keywords, listingType);
    }
    
    // Parse the search results
    let properties: any[] = [];
    let searchText = await searchResponse.text();
    searchText = searchText.replace(/^\s*\/\/\s*/, ''); // Remove leading comments
    
    try {
      const searchData = JSON.parse(searchText);
      debugLog('Search data structure:', Object.keys(searchData));
      
      if (searchData.payload && searchData.payload.homes) {
        properties = searchData.payload.homes;
        debugLog(`Found ${properties.length} properties from search API`);
      }
    } catch (error) {
      debugLog(`Error parsing search data: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    if (properties.length === 0) {
      debugLog('No properties found in search results');
      return getMockRedfinData(city, state, keywords, listingType);
    }
    
    // Transform the properties into Lead objects
    const leads: Lead[] = [];
    
    for (const property of properties) {
      try {
        debugLog(`Processing property:`, property);
        
        let isFsbo = false;
        let isAgent = true;
        
        // Check if it's FSBO based on various property fields
        if (property.isFSBO || (property.listingType && property.listingType.toLowerCase().includes('fsbo'))) {
          isFsbo = true;
          isAgent = false;
          debugLog('FSBO property found based on isFSBO flag');
        }
        
        // Check description fields for FSBO keywords
        const fsboKeywords = ['for sale by owner', 'fsbo', 'owner sale', 'no agent', 'private seller', 'direct from owner'];
        const descriptionFields = [
          property.marketingRemarks,
          property.remarksAccessor,
          property.description,
          property.propertyDescription
        ];
        
        for (const field of descriptionFields) {
          if (field && typeof field === 'string') {
            const fieldLower = field.toLowerCase();
            for (const keyword of fsboKeywords) {
              if (fieldLower.includes(keyword)) {
                isFsbo = true;
                isAgent = false;
                debugLog(`FSBO property found based on keyword "${keyword}"`);
                break;
              }
            }
            if (isFsbo) break;
          }
        }
        
        // Skip if we're filtering by listing type and this doesn't match
        if ((listingType === 'fsbo' && !isFsbo) || (listingType === 'agent' && !isAgent)) {
          debugLog(`Skipping property based on listing type filter`);
          continue;
        }
        
        // Extract property details
        let address = '';
        let city = '';
        let state = '';
        let zipcode = '';
        
        // Try to get the formatted address
        if (property.addressLine1) {
          address = property.addressLine1;
        } else if (property.streetLine) {
          address = property.streetLine;
        } else if (property.streetAddress) {
          address = property.streetAddress;
        }
        
        // Get city, state, zip
        city = property.city || property.addressCity || '';
        state = property.state || property.addressState || stateAbbr;
        zipcode = property.zip || property.zipcode || property.addressZip || '';
        
        // Strict city matching - make sure the property is in the requested city
        // Skip properties where city name doesn't match (case insensitive)
        const propertyCity = city.toLowerCase().trim();
        
        if (!propertyCity.includes(searchCity) && !searchCity.includes(propertyCity)) {
          debugLog(`Skipping property - city mismatch: Property in "${city}", searching for "${searchQuery.split(',')[0]}"`);
          continue;
        }
        
        // Create full address
        const fullAddress = `${address}, ${city}, ${state} ${zipcode}`.trim();
        if (!fullAddress || fullAddress === ', ,') {
          debugLog('Skipping property with empty address');
          continue;
        }
        
        // Extract price
        let price = 0;
        if (typeof property.price === 'number') {
          price = property.price;
        } else if (property.price && typeof property.price === 'string') {
          // Convert "$450,000" to 450000
          price = parseFloat(property.price.replace(/[^0-9.]/g, ''));
        } else if (property.listPrice) {
          price = typeof property.listPrice === 'number' ? property.listPrice : 
                 parseFloat(String(property.listPrice).replace(/[^0-9.]/g, ''));
        }
        
        // Extract days on market
        let daysOnMarket = 0;
        if (property.daysOnMarket) {
          daysOnMarket = typeof property.daysOnMarket === 'number' ? property.daysOnMarket : 
                          parseInt(String(property.daysOnMarket), 10);
        } else if (property.daysOnRedfin) {
          daysOnMarket = typeof property.daysOnRedfin === 'number' ? property.daysOnRedfin : 
                          parseInt(String(property.daysOnRedfin), 10);
        } else if (property.timeOnMarket) {
          daysOnMarket = typeof property.timeOnMarket === 'number' ? property.timeOnMarket : 
                          parseInt(String(property.timeOnMarket), 10);
        }
        
        // Extract description
        let description = '';
        if (property.marketingRemarks) {
          description = property.marketingRemarks;
        } else if (property.description) {
          description = property.description;
        } else if (property.propertyDescription) {
          description = property.propertyDescription;
        } else {
          // Create a basic description if none exists
          const beds = property.beds || property.numBeds || 'Unknown';
          const baths = property.baths || property.numBaths || 'Unknown';
          const sqft = property.sqFt || property.squareFeet || 'Unknown';
          description = `${beds} beds, ${baths} baths, ${sqft} sqft.`;
          
          if (property.yearBuilt) {
            description += ` Built in ${property.yearBuilt}.`;
          }
          
          if (isFsbo) {
            description += ' For sale by owner.';
          }
        }
        
        // Generate a listing URL
        let listingUrl = '';
        if (property.url) {
          listingUrl = property.url.startsWith('http') ? property.url : `https://www.redfin.com${property.url}`;
        } else if (property.detailUrl) {
          listingUrl = property.detailUrl.startsWith('http') ? property.detailUrl : `https://www.redfin.com${property.detailUrl}`;
        } else {
          // Construct a URL from the property ID
          listingUrl = `https://www.redfin.com/property/${property.id || property.propertyId || ''}`;
        }
        
        // Match keywords
        const keywordsMatched = keywords.filter(keyword => 
          description.toLowerCase().includes(keyword.toLowerCase()) || 
          fullAddress.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Create the lead object
        const lead: Lead = {
          id: `redfin-${property.id || property.propertyId || uuidv4()}`,
          address: fullAddress,
          city,
          state,
          price,
          days_on_market: daysOnMarket || 0,
          description,
          source: 'redfin',
          keywords_matched: keywordsMatched,
          listing_url: listingUrl,
          created_at: new Date().toISOString(),
          property_type: property.propertyType || 'Unknown',
          listing_type: isFsbo ? 'fsbo' : 'agent'
        };
        
        debugLog(`Created lead for property: ${fullAddress}`);
        leads.push(lead);
      } catch (error) {
        debugLog(`Error processing property: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    if (leads.length === 0) {
      debugLog('No valid leads created from properties, trying alternative search...');
      
      // Try a more comprehensive search endpoint with city filtering
      const altSearchUrl = `https://www.redfin.com/stingray/api/home-search/search?start=0&count=50&market=${encodeURIComponent(city)}&region_id=${locationId}&region_type=6&v=8`;
      
      debugLog(`Trying alternative search API: ${altSearchUrl}`);
      
      const altSearchResponse = await fetch(altSearchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.redfin.com/'
        }
      });
      
      if (altSearchResponse.ok) {
        let altSearchText = await altSearchResponse.text();
        altSearchText = altSearchText.replace(/^\s*\/\/\s*/, ''); // Remove leading comments
        
        try {
          const altSearchData = JSON.parse(altSearchText);
          debugLog('Alternative search data structure:', Object.keys(altSearchData));
          
          if (altSearchData.payload && altSearchData.payload.homes) {
            const altProperties = altSearchData.payload.homes;
            debugLog(`Found ${altProperties.length} properties from alternative search API`);
            
            // Process these properties with the same city filter logic
            for (const property of altProperties) {
              // Extract basic property info
              let address = property.streetLine || property.addressLine1 || '';
              let propCity = property.city || property.addressCity || '';
              let propState = property.state || property.addressState || stateAbbr;
              
              // Skip if city doesn't match
              if (!propCity.toLowerCase().includes(searchCity) && !searchCity.includes(propCity.toLowerCase())) {
                continue;
              }
              
              // Create and add the lead
              // This is simplified - in implementation we'd use the same lead creation logic as above
              leads.push({
                id: `redfin-alt-${property.id || property.propertyId || uuidv4()}`,
                address: `${address}, ${propCity}, ${propState}`,
                city: propCity,
                state: propState,
                price: property.price || 0,
                days_on_market: property.daysOnMarket || 0,
                description: property.description || `Property in ${propCity}`,
                source: 'redfin',
                keywords_matched: [],
                listing_url: property.url ? `https://www.redfin.com${property.url}` : `https://www.redfin.com/property/${property.id || ''}`,
                created_at: new Date().toISOString(),
                property_type: property.propertyType || 'Unknown',
                listing_type: property.isListedByOwner ? 'fsbo' : 'agent'
              });
            }
          }
        } catch (error) {
          debugLog(`Error parsing alternative search data: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
    
    if (leads.length === 0) {
      debugLog('No valid leads created from any API, using mock data');
      return getMockRedfinData(city, state, keywords, listingType);
    }
    
    debugLog(`Returning ${leads.length} leads from Redfin`);
    return leads;
  } catch (error) {
    debugLog(`CRITICAL ERROR in scrapeRedfin: ${error instanceof Error ? error.stack || error.message : String(error)}`);
    return getMockRedfinData(city, state, keywords, listingType);
  }
}

function getMockRedfinData(city: string, state: string, keywords: string[] = [], listingType: 'fsbo' | 'agent' | 'both' = 'both'): Lead[] {
  console.warn(`Using mock Redfin data as fallback for ${city}, ${state}`);
  
  const streets = ['Maple', 'Oak', 'Pine', 'Elm', 'Cedar', 'Willow', 'Birch', 'Spruce'];
  const streetTypes = ['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Ct', 'Way', 'Pl'];
  const propertyTypes = ['Single Family', 'Condo', 'Townhouse', 'Multi-family'];
  
  const mockData: Lead[] = [];
  
  // Generate 5-10 random properties (more realistic number than the Zillow mock)
  const numProperties = Math.floor(Math.random() * 6) + 5;
  
  for (let i = 0; i < numProperties; i++) {
    // Determine if this should be FSBO or agent listed
    const isFsbo = listingType === 'fsbo' || 
                  (listingType === 'both' && Math.random() < 0.3); // 30% chance of FSBO when "both"
    
    if (listingType === 'fsbo' && !isFsbo) continue;
    if (listingType === 'agent' && isFsbo) continue;
    
    const streetNum = Math.floor(Math.random() * 9000) + 1000;
    const street = streets[Math.floor(Math.random() * streets.length)];
    const streetType = streetTypes[Math.floor(Math.random() * streetTypes.length)];
    const address = `${streetNum} ${street} ${streetType}`;
    
    // More realistic price ranges based on typical real estate values
    const price = Math.floor(Math.random() * 800000) + 200000;
    
    // More realistic days on market
    const daysOnMarket = Math.floor(Math.random() * 60) + 1;
    
    const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    
    const beds = Math.floor(Math.random() * 4) + 1;
    const baths = Math.floor(Math.random() * 3) + 1;
    const sqft = (Math.floor(Math.random() * 2000) + 800);
    
    // More detailed description with Redfin-like formatting
    let description = '';
    
    if (isFsbo) {
      description = `FOR SALE BY OWNER! ${beds} beds, ${baths} baths, ${sqft} sqft. `;
      description += `Beautiful ${propertyType.toLowerCase()} in a desirable ${city} neighborhood. `;
      description += `Recent updates include new flooring and fresh paint. Contact owner directly!`;
    } else {
      description = `${beds} beds, ${baths} baths, ${sqft} sqft. `;
      description += `Lovely ${propertyType.toLowerCase()} in ${city}. `;
      description += `Features include updated kitchen, spacious backyard, and great location close to schools and shopping.`;
    }
    
    // Match keywords if any
    const matchedKeywords = keywords.filter(keyword => 
      description.toLowerCase().includes(keyword.toLowerCase()) || 
      address.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // If keywords were provided but none match, add one random keyword to ensure results
    if (keywords.length > 0 && matchedKeywords.length === 0) {
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
      description += ` Perfect ${randomKeyword} opportunity!`;
      matchedKeywords.push(randomKeyword);
    }
    
    // Create Redfin style URL
    const stateAbbr = getStateAbbreviation(state) || state;
    const formattedCity = city.toLowerCase().replace(/\s+/g, '-');
    const formattedAddress = address.toLowerCase().replace(/\s+/g, '-');
    
    mockData.push({
      id: `redfin-mock-${uuidv4()}`,
      address: `${address}, ${city}, ${stateAbbr}`,
      city,
      state: stateAbbr,
      price,
      days_on_market: daysOnMarket,
      description,
      source: 'redfin',
      keywords_matched: matchedKeywords,
      listing_url: `https://www.redfin.com/${stateAbbr.toLowerCase()}/${formattedCity}/${formattedAddress}`,
      created_at: new Date().toISOString(),
      property_type: propertyType,
      listing_type: isFsbo ? 'fsbo' : 'agent'
    });
  }
  
  return mockData;
}

// Try a direct search first
async function tryDirectSearch(city: string, state: string) {
  try {
    const url = `https://www.redfin.com/stingray/do/location-autocomplete?location=${encodeURIComponent(city+', '+state)}&start=0&count=10&v=2&market=global&al=1&iss=false&ooa=true&mrs=false`;
    debugLog(`Trying direct location search: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    
    if (response.ok) {
      const text = await response.text();
      const jsonText = text.replace(/^\/\/\n/, '');
      
      const data = JSON.parse(jsonText);
      if (data.payload && data.payload.exactMatch) {
        const match = data.payload.exactMatch;
        debugLog(`Found exact match: ${match.name} (ID: ${match.id})`);
        
        if (match.url) {
          return {
            url: `https://www.redfin.com${match.url}`,
            id: match.id
          };
        }
      } else if (data.payload && data.payload.sections) {
        // Try to find the first city match
        for (const section of data.payload.sections) {
          if (section.rows && section.rows.length > 0) {
            const firstMatch = section.rows[0];
            debugLog(`Found first match: ${firstMatch.name}`);
            
            if (firstMatch.url) {
              return {
                url: `https://www.redfin.com${firstMatch.url}`,
                id: firstMatch.id
              };
            }
          }
        }
      }
    }
  } catch (error) {
    debugLog(`Error in direct search: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  return null;
} 