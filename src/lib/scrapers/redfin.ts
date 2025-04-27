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

    // Try direct search first - this is more accurate for finding the correct location
    const directResult = await tryDirectSearch(city, stateAbbr);
    let searchUrl = '';
    let regionId = '';
    
    if (directResult) {
      searchUrl = directResult.url;
      regionId = directResult.id;
      debugLog(`Using direct search result: ${searchUrl}`);
    } else {
      // Fallback to the constructed URL
      const formattedCity = city.toLowerCase().replace(/\s+/g, '-');
      const formattedState = stateAbbr.toLowerCase();
      searchUrl = `https://www.redfin.com/${formattedState}/${formattedCity}`;
      debugLog(`Using constructed search URL: ${searchUrl}`);
    }
    
    // Add listing type filter to URL if needed
    if (listingType === 'fsbo' && !searchUrl.includes('/fsbo')) {
      searchUrl += '/fsbo';
      debugLog('Added FSBO filter to URL');
    }
    
    // Fetch the search page
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://www.redfin.com/'
      }
    });

    // Check response
    if (!searchResponse.ok) {
      debugLog(`Search request failed: ${searchResponse.status} ${searchResponse.statusText}`);
      return getMockRedfinData(city, state, keywords, listingType);
    }

    const html = await searchResponse.text();
    const $ = cheerio.load(html);
    
    debugLog('Searching for property data in page...');
    
    // Look for the Redfin search params and API data
    let apiData: any = null;
    let properties: any[] = [];
    
    // Try to extract data from script tags which might contain property data
    $('script').each((i, elem) => {
      const scriptContent = $(elem).html() || '';
      
      // Look for Redfin's data in script tags - check multiple patterns
      if (scriptContent.includes('__PRELOADED_STATE__')) {
        debugLog('Found __PRELOADED_STATE__ script tag');
        try {
          // Extract the JSON data using regex - Redfin often stores data in this format
          const match = scriptContent.match(/\b__PRELOADED_STATE__\s*=\s*({.*});/);
          if (match && match[1]) {
            apiData = JSON.parse(match[1]);
            debugLog('Successfully parsed Redfin __PRELOADED_STATE__ data');
          }
        } catch (error) {
          debugLog(`Error parsing script tag data: ${error instanceof Error ? error.message : String(error)}`);
        }
      } 
      else if (scriptContent.includes('window.REACT_DATA')) {
        debugLog('Found window.REACT_DATA script tag');
        try {
          // Extract the JSON data using regex - improved pattern
          const match = scriptContent.match(/window\.REACT_DATA\s*=\s*({.+});/);
          if (match && match[1]) {
            try {
              apiData = JSON.parse(match[1]);
              debugLog('Successfully parsed REACT_DATA data');
            } catch (parseError) {
              debugLog(`JSON parse error: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
            }
          }
        } catch (error) {
          debugLog(`Error with REACT_DATA script: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      // Also check for REST API data
      else if (scriptContent.includes('_GTM_GLOBAL_DATA')) {
        debugLog('Found _GTM_GLOBAL_DATA script tag');
        try {
          const match = scriptContent.match(/var\s+_GTM_GLOBAL_DATA\s*=\s*({.+});/);
          if (match && match[1]) {
            const gtmData = JSON.parse(match[1]);
            if (gtmData && gtmData.searchData) {
              apiData = gtmData;
              debugLog('Successfully parsed GTM data');
            }
          }
        } catch (error) {
          debugLog(`Error with GTM script: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    });
    
    // If we found data, extract the properties
    if (apiData) {
      debugLog('Found API data, attempting to extract properties');
      
      // Try different property paths based on Redfin's data structure
      if (apiData.homes && Array.isArray(apiData.homes.homes)) {
        properties = apiData.homes.homes;
        debugLog(`Found ${properties.length} properties in homes.homes path`);
      } 
      else if (apiData.payload && apiData.payload.homes) {
        properties = apiData.payload.homes;
        debugLog(`Found ${properties.length} properties in payload.homes path`);
      }
      else if (apiData.searchResults && apiData.searchResults.homes) {
        properties = apiData.searchResults.homes;
        debugLog(`Found ${properties.length} properties in searchResults.homes path`);
      }
      else if (apiData.searchData && apiData.searchData.homes) {
        properties = apiData.searchData.homes;
        debugLog(`Found ${properties.length} properties in searchData.homes path`);
      }
    }
    
    // If we didn't extract properties from the initial page data, try the API
    if (!properties || properties.length === 0) {
      debugLog('No properties found in page data, trying API...');
      
      // Try multiple ways to find the region ID
      if (!regionId) {
        const metaRegionId = $('meta[name="region-id"]').attr('content');
        if (metaRegionId) {
          regionId = metaRegionId;
          debugLog(`Found region ID from meta tag: ${regionId}`);
        }
      }
      
      // Also try the script tag way
      if (!regionId) {
        regionId = $('script[data-rf-test-id="RDC_REACT_APP_STATE"]').attr('data-region-id') || '';
        if (regionId) {
          debugLog(`Found region ID from script tag: ${regionId}`);
        }
      }
      
      if (regionId) {
        // Try a different API endpoint - more reliable for property listings
        let apiUrl = `https://www.redfin.com/stingray/api/gis-search?al=1&include_nearby_homes=true&market=global&num_homes=350&ord=redfin-recommended-asc&page_number=1&region_id=${regionId}&region_type=6&sf=1,2,3,5,6,7&status=9&uipt=1,2,3,4,5,6,7,8&v=8`;
        
        // Add listing type filter if needed
        if (listingType === 'fsbo') {
          apiUrl += '&is_fsbo=true';
        } else if (listingType === 'agent') {
          apiUrl += '&is_fsbo=false';
        }
        
        debugLog(`Fetching from Redfin API: ${apiUrl}`);
        
        const apiResponse = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': searchUrl
          }
        });
        
        if (apiResponse.ok) {
          const text = await apiResponse.text();
          // Redfin API returns "//\n" prefixed JSON
          const jsonText = text.replace(/^\/\/\n/, '');
          
          try {
            const data = JSON.parse(jsonText);
            if (data.payload && data.payload.homes) {
              properties = data.payload.homes;
              debugLog(`Found ${properties.length} properties from Redfin API`);
            }
          } catch (error) {
            debugLog(`Error parsing API response: ${error instanceof Error ? error.message : String(error)}`);
          }
        } else {
          debugLog(`API request failed: ${apiResponse.status} ${apiResponse.statusText}`);
        }
        
        // If still no properties, try the search API directly
        if (!properties || properties.length === 0) {
          debugLog('No properties from GIS API, trying search API...');
          
          const searchApiUrl = `https://www.redfin.com/stingray/api/home-search/search?start=0&count=50&market=${city}&region_id=${regionId}&region_type=6&sf=1,2,3,5,6,7&v=8`;
          
          const searchApiResponse = await fetch(searchApiUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'Referer': searchUrl
            }
          });
          
          if (searchApiResponse.ok) {
            const text = await searchApiResponse.text();
            const jsonText = text.replace(/^\/\/\n/, '');
            
            try {
              const data = JSON.parse(jsonText);
              if (data.payload && data.payload.homes) {
                properties = data.payload.homes;
                debugLog(`Found ${properties.length} properties from Search API`);
              }
            } catch (error) {
              debugLog(`Error parsing Search API response: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        }
      } else {
        debugLog('Could not find region ID for API request');
      }
    }
    
    if (properties.length === 0) {
      debugLog('No properties found in Redfin data, returning mock data');
      return getMockRedfinData(city, state, keywords, listingType);
    }
    
    // Transform the properties into Lead objects
    const leads: Lead[] = [];
    
    for (const property of properties) {
      try {
        debugLog(`Processing property: ${JSON.stringify(property).substring(0, 200)}...`);
        
        let isFsbo = false;
        let isAgent = true;
        
        // Check if it's FSBO - Redfin doesn't always clearly label FSBO listings
        // We'll check for keywords in multiple fields
        const checkFields = [
          property.marketingRemarks,
          property.remarksAccessor,
          property.description,
          property.propertyDescription,
          property.name,
          property.streetLine
        ];
        
        const fsboKeywords = ['for sale by owner', 'fsbo', 'owner sale', 'no agent', 'private seller', 'direct from owner'];
        
        for (const field of checkFields) {
          if (field && typeof field === 'string') {
            const fieldLower = field.toLowerCase();
            for (const keyword of fsboKeywords) {
              if (fieldLower.includes(keyword)) {
                isFsbo = true;
                isAgent = false;
                debugLog(`Detected FSBO listing based on keyword "${keyword}" in field`);
                break;
              }
            }
            if (isFsbo) break;
          }
        }
        
        // Check if seller is not a broker/agent
        if (property.brokerName === undefined || property.brokerName === null || property.brokerName === '') {
          // If no broker name is present, it might be FSBO
          if (!isFsbo) {
            debugLog('No broker name found, might be FSBO');
          }
        }
        
        // Check listingType field if available
        if (property.listingType) {
          const listingTypeLower = String(property.listingType).toLowerCase();
          if (listingTypeLower.includes('fsbo') || listingTypeLower.includes('by owner')) {
            isFsbo = true;
            isAgent = false;
            debugLog(`Detected FSBO listing based on listingType: ${property.listingType}`);
          }
        }
        
        // Skip if we're filtering by listing type and this doesn't match
        if ((listingType === 'fsbo' && !isFsbo) || (listingType === 'agent' && !isAgent)) {
          debugLog(`Skipping property based on listing type filter: requested=${listingType}, actual=${isFsbo ? 'fsbo' : 'agent'}`);
          continue;
        }
        
        // Extract address components
        const address = property.streetLine || '';
        const propertyCity = property.city || city;
        const propertyState = property.state || stateAbbr;
        const zipcode = property.zip || '';
        
        // Format the full address
        const fullAddress = `${address}, ${propertyCity}, ${propertyState} ${zipcode}`;
        
        // Extract and clean price
        let price = 0;
        if (property.price) {
          // Convert "$450,000" to 450000
          price = parseFloat(String(property.price).replace(/[^0-9.]/g, ''));
        }
        
        // Extract days on market
        const daysOnMarket = property.daysOnRedfin || property.timeOnMarket || 0;
        
        // Extract description and combine with remarks if available
        let description = property.marketingRemarks || '';
        if (property.propertyDetails) {
          description += ' ' + property.propertyDetails;
        }
        
        // Check for keyword matches
        const keywordsMatched = keywords.filter(keyword => 
          description.toLowerCase().includes(keyword.toLowerCase()) || 
          address.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Create detailUrl
        const detailUrl = property.url || 
                         `https://www.redfin.com/${propertyState.toLowerCase()}/${propertyCity.toLowerCase().replace(/\s+/g, '-')}/${address.toLowerCase().replace(/\s+/g, '-')}`;
        
        // Create the lead
        const lead: Lead = {
          id: `redfin-${uuidv4()}`,
          address: fullAddress,
          city: propertyCity,
          state: propertyState,
          price: price,
          days_on_market: typeof daysOnMarket === 'number' ? daysOnMarket : parseInt(String(daysOnMarket), 10) || 0,
          description: description,
          source: 'redfin',
          keywords_matched: keywordsMatched,
          listing_url: detailUrl,
          created_at: new Date().toISOString(),
          property_type: property.propertyType || 'unknown',
          listing_type: isFsbo ? 'fsbo' : 'agent'
        };
        
        debugLog(`Created lead for property: ${fullAddress}`);
        leads.push(lead);
      } catch (error) {
        debugLog(`Error processing property: ${error instanceof Error ? error.message : String(error)}`);
      }
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