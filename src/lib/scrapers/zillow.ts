import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import { getStateAbbreviation } from '@/lib/utils';
import fs from 'fs';
import path from 'path';

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

// Debug logger function
function debugLog(message: string, data?: any) {
  console.log(`[ZILLOW SCRAPER DEBUG] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

export async function scrapeZillowFSBO(
  city: string, 
  state: string, 
  keywords: string[] = [],
  listingType: 'fsbo' | 'agent' | 'both' = 'both'
): Promise<Lead[]> {
  try {
    debugLog(`Starting Zillow scrape for ${city}, ${state}, listing type: ${listingType}`);
    debugLog(`Keywords: ${keywords.join(', ')}`);

    const stateAbbr = getStateAbbreviation(state);
    if (!stateAbbr) {
      debugLog(`ERROR: Invalid state name: ${state}`);
      return [];
    }
    debugLog(`State abbreviation resolved: ${stateAbbr}`);

    const formattedCity = city.toLowerCase().replace(/\s+/g, '-');
    const formattedState = stateAbbr.toLowerCase();
    
    let url = `https://www.zillow.com/${formattedCity}-${formattedState}/`;
    
    // Apply listing type filter
    if (listingType === 'fsbo') {
      url += 'fsbo/';
    } else if (listingType === 'agent') {
      url += 'houses/';
    }
    
    debugLog(`Attempting to fetch URL: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      }
    });

    debugLog(`Fetch response status: ${response.status} ${response.statusText}`);
    debugLog(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);

    if (!response.ok) {
      debugLog(`ERROR: Failed to fetch from Zillow: ${response.status} ${response.statusText}`);
      // Try to read the response body for more error information
      const errorText = await response.text();
      debugLog(`Error response body: ${errorText.substring(0, 500)}...`);
      return [];
    }

    const html = await response.text();
    debugLog(`Received HTML response length: ${html.length} characters`);
    
    // Optionally save HTML to file for debugging
    if (process.env.NODE_ENV === 'development') {
      try {
        const debugDir = path.join(process.cwd(), 'debug');
        if (!fs.existsSync(debugDir)) {
          fs.mkdirSync(debugDir, { recursive: true });
        }
        fs.writeFileSync(path.join(debugDir, 'zillow-response.html'), html);
        debugLog(`Saved HTML response to debug/zillow-response.html`);
      } catch (error) {
        debugLog(`Could not save HTML debug file: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    const $ = cheerio.load(html);
    debugLog(`Loaded HTML with cheerio`);
    
    // Find the Zillow data in the script tag
    let jsonData: any = null;
    let scriptTags = 0;
    let preloadedStateScripts = 0;

    $('script').each((i, elem) => {
      scriptTags++;
      const scriptContent = $(elem).html() || '';
      
      if (scriptContent.includes('__PRELOADED_STATE__')) {
        preloadedStateScripts++;
        debugLog(`Found script with __PRELOADED_STATE__ (${preloadedStateScripts})`);
        
        const match = scriptContent.match(/window\['__PRELOADED_STATE__'\]\s*=\s*({.*});/);
        if (match && match[1]) {
          debugLog(`Extracted JSON data from script`);
          try {
            jsonData = JSON.parse(match[1]);
            debugLog(`Successfully parsed JSON data`);
          } catch (e) {
            debugLog(`ERROR: Failed to parse Zillow data: ${e instanceof Error ? e.message : String(e)}`);
            // Save the problematic JSON string for debugging
            if (process.env.NODE_ENV === 'development') {
              try {
                const debugDir = path.join(process.cwd(), 'debug');
                if (!fs.existsSync(debugDir)) {
                  fs.mkdirSync(debugDir, { recursive: true });
                }
                fs.writeFileSync(path.join(debugDir, 'zillow-json-error.txt'), match[1]);
                debugLog(`Saved problematic JSON to debug/zillow-json-error.txt`);
              } catch (fileError) {
                debugLog(`Could not save JSON debug file: ${fileError instanceof Error ? fileError.message : String(fileError)}`);
              }
            }
          }
        } else {
          debugLog(`ERROR: Could not extract JSON data from script using regex`);
        }
      }
    });

    debugLog(`Processed ${scriptTags} script tags, found ${preloadedStateScripts} with __PRELOADED_STATE__`);

    // Check if we found and parsed the JSON data successfully
    if (!jsonData) {
      debugLog(`ERROR: No JSON data found in any script tags`);
      return [];
    }

    // Check for required fields in the JSON structure
    if (!jsonData.searchPageState) {
      debugLog(`ERROR: Missing searchPageState in JSON data`);
      return [];
    }
    
    if (!jsonData.searchPageState.cat1) {
      debugLog(`ERROR: Missing cat1 in searchPageState`);
      return [];
    }
    
    if (!jsonData.searchPageState.cat1.searchResults) {
      debugLog(`ERROR: Missing searchResults in cat1`);
      return [];
    }

    const results = jsonData.searchPageState.cat1.searchResults.listResults || [];
    debugLog(`Found ${results.length} Zillow results in JSON data`);
    
    // If in development mode, save the first few results for debugging
    if (process.env.NODE_ENV === 'development' && results.length > 0) {
      try {
        const debugDir = path.join(process.cwd(), 'debug');
        if (!fs.existsSync(debugDir)) {
          fs.mkdirSync(debugDir, { recursive: true });
        }
        const sampleResults = results.slice(0, Math.min(3, results.length));
        fs.writeFileSync(
          path.join(debugDir, 'zillow-results-sample.json'), 
          JSON.stringify(sampleResults, null, 2)
        );
        debugLog(`Saved sample results to debug/zillow-results-sample.json`);
      } catch (error) {
        debugLog(`Could not save results debug file: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    const leads: Lead[] = [];

    for (const result of results) {
      try {
        // Extract and log all the raw data for debugging
        debugLog(`Processing result:`, {
          addressCity: result.addressCity,
          addressState: result.addressState,
          address: result.address,
          price: result.price,
          daysOnZillow: result.daysOnZillow,
          isListedByOwner: result.isListedByOwner,
          statusType: result.statusType
        });
        
        // Filter by city and state to ensure we only get properties in the requested location
        const propertyCity = result.addressCity || '';
        const propertyState = result.addressState || '';
        
        // Skip properties that don't match the requested city/state
        if (
          propertyCity.toLowerCase() !== city.toLowerCase() ||
          propertyState.toLowerCase() !== stateAbbr.toLowerCase()
        ) {
          debugLog(`Filtering out property in ${propertyCity}, ${propertyState} (requested: ${city}, ${stateAbbr})`);
          continue;
        }
        
        const price = parseFloat(result.price?.replace(/[^0-9.]/g, '') || '0');
        debugLog(`Parsed price: ${price} from ${result.price}`);
        
        const address = result.address || '';
        const propertyZip = result.addressZipcode || '';
        const fullAddress = `${address}, ${propertyCity}, ${propertyState} ${propertyZip}`;
        
        const daysOnMarket = parseInt(result.daysOnZillow || '0', 10);
        debugLog(`Parsed days on market: ${daysOnMarket} from ${result.daysOnZillow}`);
        
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
        debugLog(`Determined property type: ${propertyType}`);
        
        // Determine if the keywords match
        const keywordsMatched = keywords.filter(keyword => 
          description.toLowerCase().includes(keyword.toLowerCase()) || 
          address.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Log keyword matches
        if (keywords.length > 0) {
          debugLog(`Keywords matched: ${keywordsMatched.length > 0 ? keywordsMatched.join(', ') : 'none'}`);
        }
        
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
        
        debugLog(`Created lead for property: ${fullAddress}`);
        leads.push(lead);
      } catch (resultError) {
        debugLog(`ERROR processing result: ${resultError instanceof Error ? resultError.message : String(resultError)}`);
      }
    }

    debugLog(`Returning ${leads.length} leads after filtering`);
    return leads;
  } catch (error) {
    debugLog(`CRITICAL ERROR in scrapeZillowFSBO: ${error instanceof Error ? error.stack || error.message : String(error)}`);
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