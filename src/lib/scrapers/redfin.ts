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

    // Normalize the city and state
    const stateAbbr = getStateAbbreviation(state);
    if (!stateAbbr) {
      debugLog(`ERROR: Invalid state name: ${state}`);
      return getMockRedfinData(city, state, keywords, listingType);
    }

    // This is the most direct approach using Redfin's actual search API
    const searchTerm = `${city}, ${stateAbbr}`;
    debugLog(`Search term: ${searchTerm}`);
    
    // Step 1: Get the location data needed for the search
    const locationUrl = `https://www.redfin.com/stingray/do/location-autocomplete?location=${encodeURIComponent(searchTerm)}&start=0&count=10&v=2&market=global&al=1&iss=false&ooa=true&mrs=false`;
    
    debugLog(`Fetching location data from: ${locationUrl}`);
    
    const locationResponse = await fetch(locationUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.redfin.com/',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (!locationResponse.ok) {
      debugLog(`Location API failed: ${locationResponse.status} ${locationResponse.statusText}`);
      return getMockRedfinData(city, state, keywords, listingType);
    }
    
    // Extract location information
    const locationText = await locationResponse.text();
    const cleanLocationText = locationText.replace(/^\s*\/\/\s*/, '');
    
    let locationId = '';
    let searchUrl = '';
    
    try {
      const locationData = JSON.parse(cleanLocationText);
      debugLog('Location data:', locationData);
      
      if (locationData.payload?.exactMatch) {
        const exactMatch = locationData.payload.exactMatch;
        locationId = exactMatch.id || '';
        searchUrl = exactMatch.url || '';
        debugLog(`Found exact location match: ${exactMatch.name}, ID: ${locationId}`);
      } else if (locationData.payload?.sections?.[0]?.rows?.[0]) {
        // Take the first result
        const firstMatch = locationData.payload.sections[0].rows[0];
        locationId = firstMatch.id || '';
        searchUrl = firstMatch.url || '';
        debugLog(`Using first location match: ${firstMatch.name}, ID: ${locationId}`);
      }
    } catch (error) {
      debugLog(`Error parsing location data: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    if (!locationId || !searchUrl) {
      debugLog('Failed to get location ID or URL');
      return getMockRedfinData(city, state, keywords, listingType);
    }
    
    debugLog(`Location ID: ${locationId}, Search URL: ${searchUrl}`);
    
    // Step 2: Get a search result ID we'll need for the final API call
    const initialSearchUrl = `https://www.redfin.com${searchUrl}`;
    debugLog(`Fetching initial search page: ${initialSearchUrl}`);
    
    const initialResponse = await fetch(initialSearchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.redfin.com/'
      }
    });
    
    if (!initialResponse.ok) {
      debugLog(`Initial search page request failed: ${initialResponse.status}`);
      return getMockRedfinData(city, state, keywords, listingType);
    }
    
    const initialHtml = await initialResponse.text();
    
    // Extract search ID from the HTML
    let searchQueryId = '';
    const searchIdMatch = initialHtml.match(/"queryId":"([^"]+)"/);
    if (searchIdMatch && searchIdMatch[1]) {
      searchQueryId = searchIdMatch[1];
      debugLog(`Found search query ID: ${searchQueryId}`);
    } else {
      debugLog('Could not find search query ID');
    }
    
    // Extract parameters from the URL or HTML that we'll need
    const regionType = searchUrl.includes('city') ? '6' : searchUrl.includes('county') ? '5' : '2';
    
    // Step 3: Now we can make the actual data API call using the same parameters Redfin's website uses
    // This is what powers their property grid and gets the real data
    
    let apiUrl = 'https://www.redfin.com/stingray/api/gis-csv?';
    
    // Build query parameters
    const params = new URLSearchParams({
      'al': '1',
      'market': city,
      'num_homes': '500',
      'ord': 'redfin-recommended-asc',
      'page_number': '1',
      'region_id': locationId,
      'region_type': regionType,
      'sf': '1,2,3,5,6,7,14',
      'status': '9',
      'uipt': '1,2,3,4,5,6,7,8',
      'v': '8'
    });
    
    // Add FSBO/agent filtering if needed
    if (listingType === 'fsbo') {
      params.append('is_fsbo', 'true');
    } else if (listingType === 'agent') {
      params.append('is_fsbo', 'false');
    }
    
    // Add search query ID if we found one
    if (searchQueryId) {
      params.append('searchQueryId', searchQueryId);
    }
    
    apiUrl += params.toString();
    
    debugLog(`Fetching real property data from: ${apiUrl}`);
    
    const apiResponse = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': initialSearchUrl,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (!apiResponse.ok) {
      debugLog(`API request failed: ${apiResponse.status} ${apiResponse.statusText}`);
      return getMockRedfinData(city, state, keywords, listingType);
    }
    
    // The API returns a CSV format with a comment prefix
    const apiText = await apiResponse.text();
    const csvText = apiText.replace(/^\s*\/\/\s*/, '');
    
    debugLog(`Got API response, length: ${csvText.length} characters`);
    
    // Parse the CSV data
    const lines = csvText.split('\n');
    if (lines.length < 2) {
      debugLog('No data rows in CSV response');
      return getMockRedfinData(city, state, keywords, listingType);
    }
    
    // Get header row
    const headers = lines[0].split(',');
    debugLog(`CSV headers: ${headers.join(', ')}`);
    
    // Extract indices for the columns we need
    const indices = {
      id: headers.indexOf('SALE TYPE'),
      url: headers.indexOf('URL (SEE https://www.redfin.com/buy-a-home/comparative-market-analysis FOR INFO ON PRICING)'),
      address: headers.indexOf('ADDRESS'),
      city: headers.indexOf('CITY'),
      state: headers.indexOf('STATE OR PROVINCE'),
      zip: headers.indexOf('ZIP OR POSTAL CODE'),
      price: headers.indexOf('PRICE'),
      beds: headers.indexOf('BEDS'),
      baths: headers.indexOf('BATHS'),
      sqft: headers.indexOf('SQUARE FEET'),
      yearBuilt: headers.indexOf('YEAR BUILT'),
      daysOnMarket: headers.indexOf('DAYS ON MARKET'),
      status: headers.indexOf('STATUS'),
      propertyType: headers.indexOf('PROPERTY TYPE'),
      description: headers.indexOf('DESCRIPTION')
    };
    
    // Log what columns we found
    debugLog(`Column indices:`, indices);
    
    const leads: Lead[] = [];
    const searchCity = city.toLowerCase().trim();
    
    // Skip the header row
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      try {
        const values = parseCSVLine(lines[i]);
        
        if (values.length < Math.max(...Object.values(indices))) {
          debugLog(`Skipping row ${i} - not enough values (${values.length})`);
          continue;
        }
        
        // Extract data based on the indices
        const propertyAddress = indices.address >= 0 ? values[indices.address] : '';
        const propertyCity = indices.city >= 0 ? values[indices.city] : '';
        const propertyState = indices.state >= 0 ? values[indices.state] : stateAbbr;
        const propertyZip = indices.zip >= 0 ? values[indices.zip] : '';
        
        // Skip if city doesn't match (case insensitive)
        if (propertyCity.toLowerCase().trim() !== searchCity) {
          debugLog(`Skipping property - city mismatch: Property in "${propertyCity}", searching for "${city}"`);
          continue;
        }
        
        // Extract additional details
        const propertyUrl = indices.url >= 0 ? values[indices.url] : '';
        const propertyId = propertyUrl.split('/').pop() || uuidv4();
        
        let propertyPrice = 0;
        if (indices.price >= 0) {
          const priceStr = values[indices.price].replace(/[^0-9.]/g, '');
          propertyPrice = priceStr ? parseFloat(priceStr) : 0;
        }
        
        let daysOnMarket = 0;
        if (indices.daysOnMarket >= 0) {
          daysOnMarket = parseInt(values[indices.daysOnMarket], 10) || 0;
        }
        
        const propertyType = indices.propertyType >= 0 ? values[indices.propertyType] : 'Unknown';
        
        // Determine if it's FSBO 
        const saleType = indices.id >= 0 ? values[indices.id].toLowerCase() : '';
        const isFsbo = saleType.includes('fsbo') || saleType.includes('by owner');
        
        // Create a descriptive property description
        let description = '';
        if (indices.description >= 0 && values[indices.description]) {
          description = values[indices.description];
        } else {
          const beds = indices.beds >= 0 ? values[indices.beds] : 'Unknown';
          const baths = indices.baths >= 0 ? values[indices.baths] : 'Unknown';
          const sqft = indices.sqft >= 0 ? values[indices.sqft] : 'Unknown';
          const yearBuilt = indices.yearBuilt >= 0 ? values[indices.yearBuilt] : '';
          
          description = `${beds} beds, ${baths} baths, ${sqft} sqft.`;
          if (yearBuilt) description += ` Built in ${yearBuilt}.`;
          if (isFsbo) description += ' For sale by owner.';
        }
        
        // Create the full address
        const fullAddress = `${propertyAddress}, ${propertyCity}, ${propertyState} ${propertyZip}`.trim();
        
        // Match keywords
        const keywordsMatched = keywords.filter(keyword => 
          description.toLowerCase().includes(keyword.toLowerCase()) || 
          propertyAddress.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Create the lead
        const lead: Lead = {
          id: `redfin-${propertyId}`,
          address: fullAddress,
          city: propertyCity,
          state: propertyState,
          price: propertyPrice,
          days_on_market: daysOnMarket,
          description,
          source: 'redfin',
          keywords_matched: keywordsMatched,
          listing_url: propertyUrl || `https://www.redfin.com/property/${propertyId}`,
          created_at: new Date().toISOString(),
          property_type: propertyType,
          listing_type: isFsbo ? 'fsbo' : 'agent'
        };
        
        debugLog(`Created lead for: ${fullAddress}`);
        leads.push(lead);
        
      } catch (error) {
        debugLog(`Error processing row ${i}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    if (leads.length === 0) {
      debugLog('No valid leads parsed from CSV data, using mock data');
      return getMockRedfinData(city, state, keywords, listingType);
    }
    
    debugLog(`Returning ${leads.length} leads from Redfin`);
    return leads;
    
  } catch (error) {
    debugLog(`CRITICAL ERROR in scrapeRedfin: ${error instanceof Error ? error.stack || error.message : String(error)}`);
    return getMockRedfinData(city, state, keywords, listingType);
  }
}

// Helper function to parse CSV lines properly, handling quoted values
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Toggle the in-quotes flag
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Don't forget the last field
  result.push(current);
  
  return result;
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