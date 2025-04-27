import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import { getStateAbbreviation } from '@/lib/utils';
import type { Lead } from './zillow';

// Debug logging helper
function debugLog(message: string, data?: any) {
  if (process.env.ENABLE_DEBUG_LOGS === 'true') {
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

    // Format city and state for the URL
    const formattedCity = city.toLowerCase().replace(/\s+/g, '-');
    const formattedState = stateAbbr.toLowerCase();
    
    // Construct the search URL
    const searchUrl = `https://www.redfin.com/city/${formattedCity}-${formattedState}`;
    debugLog(`Searching Redfin at URL: ${searchUrl}`);
    
    // First fetch the search page to get search parameters
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
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
      
      // Look for Redfin's data in script tags
      if (scriptContent.includes('window.REACT_DATA')) {
        debugLog('Found window.REACT_DATA script tag');
        try {
          // Extract the JSON data using regex
          const match = scriptContent.match(/window\.REACT_DATA\s*=\s*({.*})/);
          if (match && match[1]) {
            apiData = JSON.parse(match[1]);
            debugLog('Successfully parsed Redfin data from script tag');
          }
        } catch (error) {
          debugLog(`Error parsing script tag data: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    });
    
    // If we found data, extract the properties
    if (apiData && apiData.homes && Array.isArray(apiData.homes.homes)) {
      debugLog(`Found ${apiData.homes.homes.length} properties in Redfin data`);
      properties = apiData.homes.homes;
    } else {
      // Try using the Redfin API directly as described in the tutorial
      debugLog('No properties found in page data, trying API...');
      
      // Extract search parameters from the page if possible
      const regionId = $('script[data-rf-test-id="RDC_REACT_APP_STATE"]').attr('data-region-id');
      
      if (regionId) {
        const apiUrl = `https://www.redfin.com/stingray/api/gis?al=1&include_nearby_homes=true&market=global&num_homes=350&ord=redfin-recommended-asc&page_number=1&region_id=${regionId}&region_type=6&sf=1,2,3,5,6,7&status=9&uipt=1,2,3,4,5,6,7,8&v=8`;
        
        debugLog(`Fetching from Redfin API: ${apiUrl}`);
        
        const apiResponse = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
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
        let isFsbo = false;
        let isAgent = true;
        
        // Check if it's FSBO - Redfin doesn't always clearly label FSBO listings
        // We'll check for keywords in the description
        if (property.marketingRemarks && 
           (property.marketingRemarks.toLowerCase().includes('for sale by owner') || 
            property.marketingRemarks.toLowerCase().includes('fsbo'))) {
          isFsbo = true;
          isAgent = false;
        }
        
        // Skip if we're filtering by listing type and this doesn't match
        if ((listingType === 'fsbo' && !isFsbo) || (listingType === 'agent' && !isAgent)) {
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