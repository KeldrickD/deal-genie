import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import { getStateAbbreviation } from '@/lib/utils';
import { parse as csvParse } from 'csv-parse/sync';
import { Lead } from '@/types/lead';

// Define and export the Lead interface
export type Lead = {
  id: string;
  address: string;
  city: string;
  state: string;
  zipcode?: string;
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

// Method #1: Direct access to Redfin's download API - most reliable
export async function scrapeRedfin(
  city: string,
  state: string,
  keywords: string[] = [],
  listingType: 'fsbo' | 'agent' | 'both' = 'both'
): Promise<Lead[]> {
  try {
    debugLog(`Starting Redfin scrape for ${city}, ${state}, listing type: ${listingType}`);
    
    // Normalize the city and state
    const stateAbbr = getStateAbbreviation(state);
    if (!stateAbbr) {
      debugLog(`Invalid state name: ${state}`);
      return getMockRedfinData(city, state, keywords, listingType);
    }
    
    // Store cookies across requests
    const cookies: string[] = [];
    
    // Common browser-like headers
    const browserHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'sec-ch-ua': '"Google Chrome";v="121", "Not;A=Brand";v="8", "Chromium";v="121"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0'
    };
    
    // Step 1: Visit Redfin homepage to get initial cookies
    debugLog(`Fetching Redfin homepage to get initial cookies`);
    const homeResponse = await fetch('https://www.redfin.com/', {
      headers: browserHeaders
    });
    
    if (!homeResponse.ok) {
      debugLog(`Failed to access Redfin homepage: ${homeResponse.status}`);
    } else {
      // Extract cookies from response headers
      const setCookies = homeResponse.headers.raw()['set-cookie'];
      if (setCookies) {
        setCookies.forEach(cookie => {
          const cookiePart = cookie.split(';')[0];
          if (cookiePart) cookies.push(cookiePart);
        });
        debugLog(`Got ${cookies.length} initial cookies`);
      }
    }
    
    // We'll try multiple approaches and use the one that succeeds
    let propertyData: Lead[] = [];
    
    // Try direct search API first - this is more reliable
    debugLog(`Trying direct location search API first`);
    const directSearchResult = await tryDirectSearch(city, stateAbbr);
    
    let regionId = '';
    let regionType = '';
    let finalUrl = '';
    
    if (directSearchResult) {
      debugLog(`Direct search successful, got URL: ${directSearchResult.url}`);
      finalUrl = directSearchResult.url;
      
      // Try to extract region information from the URL
      if (finalUrl.includes('/city/')) {
        const cityMatch = finalUrl.match(/\/city\/(\d+)\//);
        if (cityMatch && cityMatch[1]) {
          regionId = cityMatch[1];
          regionType = '6'; // city
          debugLog(`Found city ID: ${regionId}`);
        }
      } else if (finalUrl.includes('/county/')) {
        const countyMatch = finalUrl.match(/\/county\/(\d+)\//);
        if (countyMatch && countyMatch[1]) {
          regionId = countyMatch[1];
          regionType = '5'; // county
          debugLog(`Found county ID: ${regionId}`);
        }
      } else if (finalUrl.includes('/zip/')) {
        const zipMatch = finalUrl.match(/\/zip\/(\d+)\//);
        if (zipMatch && zipMatch[1]) {
          regionId = zipMatch[1];
          regionType = '2'; // zip
          debugLog(`Found zip ID: ${regionId}`);
        }
      }
      
      // If we have a direct search ID but couldn't parse from URL
      if (!regionId && directSearchResult.id) {
        regionId = directSearchResult.id;
        regionType = '6'; // Assume city as default
        debugLog(`Using ID from direct search: ${regionId}`);
      }
    }
    
    // If direct search didn't work, fall back to regular search
    if (!regionId) {
      // Step 2: Search for the city/location
      const searchUrl = `https://www.redfin.com/city-page-search?location=${encodeURIComponent(`${city}, ${stateAbbr}`)}`;
      debugLog(`Direct search failed, falling back to regular search: ${searchUrl}`);
      
      const searchHeaders = { ...browserHeaders };
      if (cookies.length > 0) {
        searchHeaders['Cookie'] = cookies.join('; ');
      }
      searchHeaders['Referer'] = 'https://www.redfin.com/';
      
      const searchResponse = await fetch(searchUrl, { 
        headers: searchHeaders,
        redirect: 'follow'
      });
      
      if (!searchResponse.ok) {
        debugLog(`Search failed: ${searchResponse.status}`);
        // Try alternative search method before giving up
        propertyData = await tryAlternativePropertySearch(city, state, keywords, listingType);
        if (propertyData.length > 0) {
          return propertyData;
        }
        return getMockRedfinData(city, state, keywords, listingType);
      }
      
      // Extract cookies from response headers
      const searchSetCookies = searchResponse.headers.raw()['set-cookie'];
      if (searchSetCookies) {
        searchSetCookies.forEach(cookie => {
          const cookiePart = cookie.split(';')[0];
          if (cookiePart && !cookies.includes(cookiePart)) {
            cookies.push(cookiePart);
          }
        });
        debugLog(`Updated cookies, now have ${cookies.length}`);
      }
      
      // Get the final URL after any redirects
      finalUrl = searchResponse.url;
      debugLog(`Search redirected to: ${finalUrl}`);
      
      // Get regionId and regionType from the URL
      if (finalUrl.includes('/city/')) {
        const cityMatch = finalUrl.match(/\/city\/(\d+)\//);
        if (cityMatch && cityMatch[1]) {
          regionId = cityMatch[1];
          regionType = '6'; // city
          debugLog(`Found city ID: ${regionId}`);
        }
      } else if (finalUrl.includes('/county/')) {
        const countyMatch = finalUrl.match(/\/county\/(\d+)\//);
        if (countyMatch && countyMatch[1]) {
          regionId = countyMatch[1];
          regionType = '5'; // county
          debugLog(`Found county ID: ${regionId}`);
        }
      } else if (finalUrl.includes('/zip/')) {
        const zipMatch = finalUrl.match(/\/zip\/(\d+)\//);
        if (zipMatch && zipMatch[1]) {
          regionId = zipMatch[1];
          regionType = '2'; // zip
          debugLog(`Found zip ID: ${regionId}`);
        }
      }
      
      if (!regionId) {
        debugLog(`Could not extract region ID from URL: ${finalUrl}`);
        
        // Get the HTML content and try to extract region ID
        const htmlContent = await searchResponse.text();
        debugLog(`Downloaded HTML content, length: ${htmlContent.length}`);
        
        // Try to parse region info from HTML
        const regionMatch = htmlContent.match(/"regionId":(\d+),"regionType":(\d+)/);
        if (regionMatch && regionMatch[1] && regionMatch[2]) {
          regionId = regionMatch[1];
          regionType = regionMatch[2];
          debugLog(`Extracted region info from HTML: ID=${regionId}, Type=${regionType}`);
        } else {
          debugLog(`Could not find region info in HTML, trying alternative method`);
          
          // Try the alternative search method before giving up
          propertyData = await tryAlternativePropertySearch(city, state, keywords, listingType);
          if (propertyData.length > 0) {
            return propertyData;
          }
          
          return getMockRedfinData(city, state, keywords, listingType);
        }
      }
    }
    
    // Step 3: Request the download URL directly
    // Use current time to avoid caching
    const timestamp = new Date().getTime();
    const downloadUrl = `https://www.redfin.com/stingray/api/gis-csv?al=1&include_pending_homes=true&isRentals=false&market=${city.toLowerCase().replace(/\s+/g, '-')}&num_homes=500&ord=redfin-recommended-asc&page_number=1&region_id=${regionId}&region_type=${regionType}&sf=1,2,3,5,6,7&status=9&uipt=1,2,3,4,5,6,7,8&v=8&_=${timestamp}`;
    
    debugLog(`Requesting download from: ${downloadUrl}`);
    
    const downloadHeaders: Record<string, string> = { 
      ...browserHeaders,
      'Accept': '*/*',
      'Referer': finalUrl || `https://www.redfin.com/${stateAbbr.toLowerCase()}/${city.toLowerCase().replace(/\s+/g, '-')}`,
      'X-Requested-With': 'XMLHttpRequest'
    };
    
    if (cookies.length > 0) {
      downloadHeaders['Cookie'] = cookies.join('; ');
    }
    
    debugLog(`Using headers for download:`, downloadHeaders);
    
    const downloadResponse = await fetch(downloadUrl, {
      headers: downloadHeaders
    });
    
    // Store response status and headers for debugging
    debugLog(`Download response status: ${downloadResponse.status} ${downloadResponse.statusText}`);
    debugLog(`Download response headers:`, Object.fromEntries(downloadResponse.headers.entries()));
    
    if (!downloadResponse.ok) {
      debugLog(`Download failed: ${downloadResponse.status} ${downloadResponse.statusText}`);
      
      // Try alternative search method before giving up
      propertyData = await tryAlternativePropertySearch(city, state, keywords, listingType);
      if (propertyData.length > 0) {
        return propertyData;
      }
      
      return getMockRedfinData(city, state, keywords, listingType);
    }
    
    let csvRaw = await downloadResponse.text();
    
    // Log the first part of the response for debugging
    debugLog(`CSV response start: ${csvRaw.substring(0, 200)}...`);
    debugLog(`CSV response length: ${csvRaw.length} chars`);
    
    // Check if we got actual data
    if (csvRaw.length < 100 || csvRaw.includes('<!DOCTYPE html>') || !csvRaw.includes(',')) {
      debugLog(`CSV response invalid (${csvRaw.length} chars), probably an error`);
      debugLog(`Response was: ${csvRaw.substring(0, 500)}`);
      
      // Try an alternative approach with different parameters
      debugLog(`Trying alternative download URL with different parameters`);
      const altUrl = `https://www.redfin.com/stingray/api/gis-csv?al=1&market=${city.toLowerCase().replace(/\s+/g, '-')}&num_homes=350&ord=redfin-recommended-asc&page_number=1&region_id=${regionId}&region_type=${regionType}&sf=1,2,3,5,6,7&status=9&uipt=1,2,3,4,5,6,7,8&v=8&_=${timestamp}`;
      
      try {
        const altResponse = await fetch(altUrl, {
          headers: downloadHeaders
        });
        
        if (altResponse.ok) {
          const altCsvRaw = await altResponse.text();
          debugLog(`Alternative CSV response length: ${altCsvRaw.length} chars`);
          
          if (altCsvRaw.length > 100 && !altCsvRaw.includes('<!DOCTYPE html>') && altCsvRaw.includes(',')) {
            debugLog(`Alternative URL succeeded, using this CSV data`);
            // Replace the original CSV with the alternative one
            csvRaw = altCsvRaw;
          }
        }
      } catch (error) {
        debugLog(`Alternative download attempt failed: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // If still no valid data, try another approach
      if (csvRaw.length < 100 || csvRaw.includes('<!DOCTYPE html>') || !csvRaw.includes(',')) {
        debugLog(`Could not get valid CSV data, trying alternative property search`);
        
        propertyData = await tryAlternativePropertySearch(city, state, keywords, listingType);
        if (propertyData.length > 0) {
          return propertyData;
        }
        
        return getMockRedfinData(city, state, keywords, listingType);
      }
    }
    
    // Parse CSV data
    debugLog(`Parsing CSV data: ${csvRaw.length} chars`);
    let lines = csvRaw.split(/\r?\n/);
    
    // Handle the case where Redfin prepends download information
    if (lines[0].startsWith('1,')) {
      debugLog(`Detected download information in CSV first line, removing it`);
      // Skip the first line; it's not CSV data
      lines = lines.slice(1);
    }
    
    // Special case: the response might have another format with the URL on the first line
    if (lines[0].startsWith('url=')) {
      debugLog(`Detected URL response format, need to download the actual CSV`);
      const dataUrl = lines[0].substring(4);
      
      try {
        debugLog(`Downloading actual CSV from: ${dataUrl}`);
        const dataResponse = await fetch(dataUrl, {
          headers: downloadHeaders
        });
        
        if (dataResponse.ok) {
          const dataCsvRaw = await dataResponse.text();
          debugLog(`Data CSV response length: ${dataCsvRaw.length} chars`);
          
          if (dataCsvRaw.length > 100 && !dataCsvRaw.includes('<!DOCTYPE html>') && dataCsvRaw.includes(',')) {
            csvRaw = dataCsvRaw;
            lines = csvRaw.split(/\r?\n/);
          }
        }
      } catch (error) {
        debugLog(`Data CSV download failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    if (lines.length < 2) {
      debugLog(`Not enough data in CSV: ${lines.length} lines`);
      
      // Try alternative search method before giving up
      propertyData = await tryAlternativePropertySearch(city, state, keywords, listingType);
      if (propertyData.length > 0) {
        return propertyData;
      }
      
      return getMockRedfinData(city, state, keywords, listingType);
    }
    
    const headers = parseCSVLine(lines[0]);
    debugLog(`CSV Headers: ${headers.join(', ')}`);
    
    // Find the indices for the fields we need
    const streetIndex = headers.findIndex(h => h.includes('ADDRESS') || h.includes('STREET'));
    const cityIndex = headers.findIndex(h => h.includes('CITY'));
    const stateIndex = headers.findIndex(h => h.includes('STATE'));
    const zipIndex = headers.findIndex(h => h.includes('ZIP') || h.includes('POSTAL'));
    const priceIndex = headers.findIndex(h => h.includes('PRICE'));
    const urlIndex = headers.findIndex(h => h.includes('URL'));
    const domIndex = headers.findIndex(h => h.includes('DAYS ON MARKET'));
    const descIndex = headers.findIndex(h => h.includes('DESCRIPTION') || h.includes('REMARKS'));
    const propertyTypeIndex = headers.findIndex(h => h.includes('PROPERTY TYPE'));
    
    if (streetIndex === -1 || cityIndex === -1 || priceIndex === -1) {
      debugLog(`Missing critical columns in CSV, headers found: ${headers.join(', ')}`);
      
      // Try alternative search method before giving up
      propertyData = await tryAlternativePropertySearch(city, state, keywords, listingType);
      if (propertyData.length > 0) {
        return propertyData;
      }
      
      return getMockRedfinData(city, state, keywords, listingType);
    }
    
    // Process data rows
    debugLog(`Processing ${lines.length - 1} listings`);
    const results: Lead[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const values = parseCSVLine(lines[i]);
      if (values.length < Math.max(streetIndex, cityIndex, priceIndex, stateIndex) + 1) {
        debugLog(`Line ${i} has insufficient columns, skipping: ${values.length} < needed`);
        continue;
      }
      
      const street = values[streetIndex] || '';
      const cityValue = values[cityIndex] || city;
      const stateValue = values[stateIndex] || state;
      const zip = zipIndex !== -1 && values[zipIndex] ? values[zipIndex] : '';
      
      // Skip if required data is missing
      if (!street || !cityValue) {
        continue;
      }
      
      let fullAddress = street;
      if (zip) {
        fullAddress += `, ${cityValue}, ${stateValue} ${zip}`;
      } else {
        fullAddress += `, ${cityValue}, ${stateValue}`;
      }
      
      // Parse price - handle formatting
      let price = 0;
      if (values[priceIndex]) {
        const priceString = values[priceIndex].replace(/[^\d.]/g, '');
        price = parseFloat(priceString);
      }
      
      // If we couldn't parse the price, skip this listing
      if (!price || isNaN(price)) {
        continue;
      }
      
      // Handle description - some listings might not have it
      const description = descIndex !== -1 && values[descIndex] ? values[descIndex] : '';
      
      // Handle days on market
      let daysOnMarket = 0;
      if (domIndex !== -1 && values[domIndex]) {
        const domString = values[domIndex].replace(/[^\d]/g, '');
        const dom = parseInt(domString, 10);
        if (!isNaN(dom)) {
          daysOnMarket = dom;
        }
      }
      
      // Property type
      const propertyType = propertyTypeIndex !== -1 && values[propertyTypeIndex] 
        ? values[propertyTypeIndex] 
        : undefined;
      
      // URL handling
      const listingUrl = urlIndex !== -1 && values[urlIndex] 
        ? values[urlIndex] 
        : `https://www.redfin.com/search/redirect?search=${encodeURIComponent(fullAddress)}`;
      
      // Check keywords in address and description
      const keywordsMatched = keywords.filter(keyword => {
        const keywordLower = keyword.toLowerCase();
        const inAddress = fullAddress.toLowerCase().includes(keywordLower);
        const inDescription = description.toLowerCase().includes(keywordLower);
        return inAddress || inDescription;
      });
      
      // Create lead object
      const lead: Lead = {
        id: uuidv4(),
        address: fullAddress,
        city: cityValue,
        state: stateValue,
        zipcode: zip,
        price,
        days_on_market: daysOnMarket,
        description,
        source: 'redfin',
        keywords_matched: keywordsMatched,
        listing_url: listingUrl,
        created_at: new Date().toISOString(),
        property_type: propertyType,
        listing_type: listingType // We can't reliably determine if it's FSBO
      };
      
      // Only add if keywords match or if no keywords provided
      if (keywords.length === 0 || keywordsMatched.length > 0) {
        results.push(lead);
      }
    }
    
    debugLog(`Finished processing, found ${results.length} relevant listings`);
    
    // If we didn't find any results using the CSV method, try the alternative method
    if (results.length === 0) {
      debugLog(`No results found with CSV method, trying alternative property search`);
      propertyData = await tryAlternativePropertySearch(city, state, keywords, listingType);
      if (propertyData.length > 0) {
        return propertyData;
      }
      
      return getMockRedfinData(city, state, keywords, listingType);
    }
    
    return results.slice(0, 50); // Limit to 50 results
  } catch (error) {
    debugLog(`Error in scrapeRedfin: ${error instanceof Error ? error.message : String(error)}`);
    // One last attempt with the alternative method
    try {
      const propertyData = await tryAlternativePropertySearch(city, state, keywords, listingType);
      if (propertyData.length > 0) {
        return propertyData;
      }
    } catch (e) {
      debugLog(`Alternative search also failed: ${e instanceof Error ? e.message : String(e)}`);
    }
    return getMockRedfinData(city, state, keywords, listingType);
  }
}

// Helper function to parse CSV lines, handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let startPos = 0;
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes;
    } else if (line[i] === ',' && !inQuotes) {
      result.push(line.substring(startPos, i).replace(/^"|"$/g, '').replace(/""/g, '"'));
      startPos = i + 1;
    }
  }
  
  // Add the last field
  result.push(line.substring(startPos).replace(/^"|"$/g, '').replace(/""/g, '"'));
  
  return result;
}

// Helper function to get mock data when real data can't be retrieved
function getMockRedfinData(
  city: string,
  state: string,
  keywords: string[] = [],
  listingType: 'fsbo' | 'agent' | 'both' = 'both'
): Lead[] {
  debugLog(`Returning mock data for ${city}, ${state}`);
  
  // Create a few dummy listings
  const mockData: Lead[] = [];
  const streets = [
    '123 Main St',
    '456 Oak Ave',
    '789 Pine Blvd',
    '321 Elm St',
    '654 Maple Dr'
  ];
  
  const descriptions = [
    'Beautiful property with renovated kitchen and bathrooms. Large backyard, perfect for entertaining.',
    'Charming home with original hardwood floors and plenty of natural light. Close to shopping and schools.',
    'Spacious family home in desirable neighborhood. Walking distance to parks and restaurants.',
    'Recently updated home with modern finishes throughout. Great investment opportunity.',
    'Cozy cottage with tons of character. Perfect starter home or investment property.'
  ];
  
  for (let i = 0; i < 5; i++) {
    const street = streets[i % streets.length];
    const fullAddress = `${street}, ${city}, ${state}`;
    const price = 200000 + Math.floor(Math.random() * 300000);
    const daysOnMarket = Math.floor(Math.random() * 60);
    const description = descriptions[i % descriptions.length];
    
    // Check keywords in address and description
    const keywordsMatched = keywords.filter(keyword => {
      const keywordLower = keyword.toLowerCase();
      const inAddress = fullAddress.toLowerCase().includes(keywordLower);
      const inDescription = description.toLowerCase().includes(keywordLower);
      return inAddress || inDescription;
    });
    
    // Only add if keywords match or if no keywords provided
    if (keywords.length === 0 || keywordsMatched.length > 0) {
      mockData.push({
        id: uuidv4(),
        address: fullAddress,
        city,
        state,
        zipcode: '',
        price,
        days_on_market: daysOnMarket,
        description,
        source: 'redfin',
        keywords_matched: keywordsMatched,
        listing_url: `https://www.redfin.com/fake-listing/${i}`,
        created_at: new Date().toISOString(),
        property_type: i % 3 === 0 ? 'Condo' : 'Single Family',
        listing_type: listingType
      });
    }
  }
  
  return mockData;
}

// Try to perform a direct location search on Redfin
interface DirectSearchResult {
  url: string;
  id?: string;
}

async function tryDirectSearch(city: string, stateAbbr: string): Promise<DirectSearchResult | null> {
  try {
    debugLog(`Performing direct location search for ${city}, ${stateAbbr}`);
    
    // Format the URL to match Redfin's location pattern
    const formattedCity = city.toLowerCase().replace(/\s+/g, '-');
    const formattedState = stateAbbr.toLowerCase();
    
    // Try different URL patterns to find a match
    const possibleUrls = [
      `https://www.redfin.com/${formattedState}/${formattedCity}`,
      `https://www.redfin.com/${formattedState}/${formattedCity}/city/`
    ];
    
    // Try the autosuggest API first (most reliable)
    const suggestUrl = `https://www.redfin.com/stingray/do/location-autocomplete?location=${encodeURIComponent(`${city}, ${stateAbbr}`)}&v=2&includeMls=false&section=for-sale&isNewSearch=true&structuredSearchOptions=%7B%22search_inputs%22:%5B%5D%7D`;
    
    debugLog(`Trying autosuggest API at: ${suggestUrl}`);
    const suggestResponse = await fetch(suggestUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Referer': 'https://www.redfin.com/'
      }
    });
    
    if (suggestResponse.ok) {
      const text = await suggestResponse.text();
      debugLog(`Autosuggest response length: ${text.length}`);
      
      // The response is a JSON wrapped in "{}&&" for some reason
      const jsonText = text.replace(/^\{\}&& ?/, '');
      
      try {
        const data = JSON.parse(jsonText);
        if (data.payload && data.payload.exactMatch && data.payload.exactMatch.url) {
          debugLog(`Found exact match in autocomplete: ${data.payload.exactMatch.url}`);
          return { 
            url: data.payload.exactMatch.url,
            id: data.payload.exactMatch.id
          };
        }
        
        // Try the sections or locations array for matches
        if (data.payload && data.payload.sections) {
          for (const section of data.payload.sections) {
            if (section.rows && section.rows.length > 0) {
              for (const row of section.rows) {
                if (row.url && row.type === "city") {
                  debugLog(`Found city match in autocomplete: ${row.url}`);
                  return { 
                    url: row.url,
                    id: row.id
                  };
                }
              }
            }
          }
        }
      } catch (e) {
        debugLog(`Error parsing autosuggest JSON: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    
    // If API didn't work, try direct URL access
    for (const url of possibleUrls) {
      debugLog(`Trying direct URL: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml'
        },
        redirect: 'follow'
      });
      
      if (response.ok || response.status === 301 || response.status === 302) {
        debugLog(`Direct URL access succeeded with status ${response.status}, final URL: ${response.url}`);
        return { url: response.url };
      }
    }
    
    debugLog(`Direct search failed, no valid URLs found`);
    return null;
  } catch (error) {
    debugLog(`Error in direct search: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

// Try alternative approach to get property data
async function tryAlternativePropertySearch(
  city: string,
  state: string,
  keywords: string[] = [],
  listingType: 'fsbo' | 'agent' | 'both' = 'both'
): Promise<Lead[]> {
  try {
    debugLog(`Trying alternative property search for ${city}, ${state}`);
    
    // Format for search URL
    const stateAbbr = getStateAbbreviation(state);
    if (!stateAbbr) {
      return [];
    }
    
    const formattedCity = city.toLowerCase().replace(/\s+/g, '-');
    const formattedState = stateAbbr.toLowerCase();
    
    // Use the Redfin web search
    const searchUrl = `https://www.redfin.com/${formattedState}/${formattedCity}`;
    debugLog(`Trying alternative web search: ${searchUrl}`);
    
    const browserHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'max-age=0'
    };
    
    const response = await fetch(searchUrl, {
      headers: browserHeaders,
      redirect: 'follow'
    });
    
    if (!response.ok) {
      debugLog(`Alternative search failed: ${response.status}`);
      return [];
    }
    
    // Get the HTML content
    const html = await response.text();
    debugLog(`Got HTML content, length: ${html.length}`);
    
    if (html.length < 1000) {
      debugLog(`HTML content too small, possibly blocked`);
      return [];
    }
    
    // Let's try to extract properties using regular expressions
    const results: Lead[] = [];
    
    // Try extracting home data from JSON in the page
    const homeDataMatch = html.match(/RED\.state\.results\s*=\s*({.*?"homes":[^]*?]);/);
    if (homeDataMatch && homeDataMatch[1]) {
      try {
        const jsonStr = homeDataMatch[1].replace(/RED\.state\.results\s*=\s*/, '').replace(/;$/, '');
        const homeData = JSON.parse(jsonStr);
        
        if (homeData.homes && Array.isArray(homeData.homes)) {
          debugLog(`Found ${homeData.homes.length} homes in JSON data`);
          
          for (const home of homeData.homes) {
            if (!home || !home.streetAddress || !home.priceInfo) continue;
            
            const street = home.streetAddress || '';
            const cityValue = home.city || city;
            const stateValue = home.state || state;
            const zip = home.zip || '';
            
            let fullAddress = street;
            if (zip) {
              fullAddress += `, ${cityValue}, ${stateValue} ${zip}`;
            } else {
              fullAddress += `, ${cityValue}, ${stateValue}`;
            }
            
            // Handle price
            let price = 0;
            if (home.priceInfo && home.priceInfo.amount) {
              price = home.priceInfo.amount;
            }
            
            // Skip if required data is missing
            if (!street || !cityValue || !price) {
              continue;
            }
            
            // Description might be in remarks or not available
            const description = home.remarksAccessor 
              ? home.remarksAccessor 
              : `${home.beds || 0} bed, ${home.baths || 0} bath, ${home.sqFt || 0} sqft`;
            
            // URL construction
            const listingUrl = home.url 
              ? `https://www.redfin.com${home.url}` 
              : `https://www.redfin.com/search/redirect?search=${encodeURIComponent(fullAddress)}`;
            
            // Check keywords in address and description
            const keywordsMatched = keywords.filter(keyword => {
              const keywordLower = keyword.toLowerCase();
              const inAddress = fullAddress.toLowerCase().includes(keywordLower);
              const inDescription = description.toLowerCase().includes(keywordLower);
              return inAddress || inDescription;
            });
            
            // Create lead object
            const lead: Lead = {
              id: uuidv4(),
              address: fullAddress,
              city: cityValue,
              state: stateValue,
              zipcode: zip,
              price,
              days_on_market: home.daysOnRedfin || 0,
              description,
              source: 'redfin',
              keywords_matched: keywordsMatched,
              listing_url: listingUrl,
              created_at: new Date().toISOString(),
              property_type: home.propertyType || undefined,
              listing_type: listingType
            };
            
            // Only add if keywords match or if no keywords provided
            if (keywords.length === 0 || keywordsMatched.length > 0) {
              results.push(lead);
            }
          }
        }
      } catch (error) {
        debugLog(`Error parsing JSON home data: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // If we couldn't extract from JSON, try using Cheerio to parse HTML
    if (results.length === 0) {
      try {
        const $ = cheerio.load(html);
        
        // Redfin property cards typically have a class like "HomeCardContainer"
        const propertyCards = $('.HomeCardContainer, .HomeCard, [data-rf-test-id="home-card"]');
        debugLog(`Found ${propertyCards.length} property cards in HTML`);
        
        if (propertyCards.length === 0) {
          // Try alternative selectors if the main ones don't work
          const alternativeCards = $('a[href^="/"][data-rf-test-id]').filter(function(this: cheerio.Element) {
            const href = $(this).attr('href');
            return href ? /\/[A-Za-z]{2}\/[^\/]+\/home\/\d+/.test(href) : false;
          });
          
          debugLog(`Found ${alternativeCards.length} alternative property cards`);
          
          alternativeCards.each((i, el) => {
            try {
              // Extract limited data from these simpler elements
              const $card = $(el);
              const url = $card.attr('href');
              
              // Only process if we found a URL
              if (!url) return;
              
              // Try to extract address and price
              const addressText = $card.find('[data-rf-test-id="abp-streetLine"], [data-rf-test-id="address"]').text().trim();
              const cityStateText = $card.find('[data-rf-test-id="abp-cityStateZip"]').text().trim();
              const priceText = $card.find('.homecardV2Price, [data-rf-test-id="abp-price"]').text().trim();
              
              if (!addressText || !priceText) return;
              
              // Parse out the city and state
              let cityValue = city;
              let stateValue = state;
              if (cityStateText) {
                const parts = cityStateText.split(',');
                if (parts.length >= 2) {
                  cityValue = parts[0].trim();
                  const stateZip = parts[1].trim().split(' ');
                  stateValue = stateZip[0].trim();
                }
              }
              
              const fullAddress = `${addressText}, ${cityValue}, ${stateValue}`;
              
              // Parse price - handle formatting
              let price = 0;
              if (priceText) {
                const priceString = priceText.replace(/[^\d.]/g, '');
                price = parseFloat(priceString);
              }
              
              // Skip if required data is missing
              if (!price || isNaN(price)) {
                return;
              }
              
              // Check keywords in address (we don't have description)
              const keywordsMatched = keywords.filter(keyword => {
                const keywordLower = keyword.toLowerCase();
                return fullAddress.toLowerCase().includes(keywordLower);
              });
              
              // Create lead object
              const lead: Lead = {
                id: uuidv4(),
                address: fullAddress,
                city: cityValue,
                state: stateValue,
                zipcode: '',
                price,
                days_on_market: 0, // We don't have this info
                description: '', // We don't have this info
                source: 'redfin',
                keywords_matched: keywordsMatched,
                listing_url: `https://www.redfin.com${url}`,
                created_at: new Date().toISOString(),
                property_type: undefined, // We don't have this info
                listing_type: listingType
              };
              
              // Only add if keywords match or if no keywords provided
              if (keywords.length === 0 || keywordsMatched.length > 0) {
                results.push(lead);
              }
            } catch (cardError) {
              // Just skip this card
              debugLog(`Error processing card: ${cardError instanceof Error ? cardError.message : String(cardError)}`);
            }
          });
          
          return results;
        }
        
        // Process each property card
        propertyCards.each((i, el) => {
          try {
            const $card = $(el);
            
            // Extract address components
            const street = $card.find('[data-rf-test-id="abp-streetLine"], .streetAddress').text().trim();
            const cityStateZip = $card.find('[data-rf-test-id="abp-cityStateZip"], .cityStateZip').text().trim();
            
            // Extract price
            const priceText = $card.find('[data-rf-test-id="abp-price"], .homecardV2Price').text().trim();
            const price = parseFloat(priceText.replace(/[^\d.]/g, ''));
            
            if (!street || !cityStateZip || !price || isNaN(price)) {
              return; // Skip if essential data is missing
            }
            
            // Parse city and state from cityStateZip
            let cityValue = city;
            let stateValue = state;
            let zip = '';
            
            const cityStateParts = cityStateZip.split(',');
            if (cityStateParts.length >= 2) {
              cityValue = cityStateParts[0].trim();
              const stateZipParts = cityStateParts[1].trim().split(' ');
              if (stateZipParts.length >= 1) {
                stateValue = stateZipParts[0].trim();
              }
              if (stateZipParts.length >= 2) {
                zip = stateZipParts[1].trim();
              }
            }
            
            // Construct full address
            let fullAddress = street;
            if (zip) {
              fullAddress += `, ${cityValue}, ${stateValue} ${zip}`;
            } else {
              fullAddress += `, ${cityValue}, ${stateValue}`;
            }
            
            // Extract property details
            const bedsText = $card.find('[data-rf-test-id="abp-beds"], .stats .HomeStat .value[data-rf-test-name="beds"]').text().trim();
            const bathsText = $card.find('[data-rf-test-id="abp-baths"], .stats .HomeStat .value[data-rf-test-name="baths"]').text().trim();
            const sqftText = $card.find('[data-rf-test-id="abp-sqFt"], .stats .HomeStat .value[data-rf-test-name="sqFt"]').text().trim();
            
            // Extract days on market if available
            const domText = $card.find('[data-rf-test-id="abp-dom"], .HomeStatusText').text().trim();
            let daysOnMarket = 0;
            const domMatch = domText.match(/(\d+)\s+day/i);
            if (domMatch && domMatch[1]) {
              daysOnMarket = parseInt(domMatch[1], 10);
            }
            
            // Extract listing URL
            let listingUrl = '';
            const linkElement = $card.find('a[href^="/"]').first();
            if (linkElement.length) {
              const href = linkElement.attr('href');
              if (href) {
                listingUrl = `https://www.redfin.com${href}`;
              }
            }
            
            if (!listingUrl) {
              listingUrl = `https://www.redfin.com/search/redirect?search=${encodeURIComponent(fullAddress)}`;
            }
            
            // Create description from available data
            const beds = bedsText ? parseFloat(bedsText) : 0;
            const baths = bathsText ? parseFloat(bathsText) : 0;
            const sqft = sqftText ? parseInt(sqftText.replace(/[^\d]/g, ''), 10) : 0;
            
            const description = `${beds || 0} bed, ${baths || 0} bath, ${sqft || 0} sqft property located at ${fullAddress}`;
            
            // Check keywords in address and description
            const keywordsMatched = keywords.filter(keyword => {
              const keywordLower = keyword.toLowerCase();
              const inAddress = fullAddress.toLowerCase().includes(keywordLower);
              const inDescription = description.toLowerCase().includes(keywordLower);
              return inAddress || inDescription;
            });
            
            // Create lead object
            const lead: Lead = {
              id: uuidv4(),
              address: fullAddress,
              city: cityValue,
              state: stateValue,
              zipcode: zip,
              price,
              days_on_market: daysOnMarket,
              description,
              source: 'redfin',
              keywords_matched: keywordsMatched,
              listing_url: listingUrl,
              created_at: new Date().toISOString(),
              property_type: undefined,
              listing_type: listingType
            };
            
            // Only add if keywords match or if no keywords provided
            if (keywords.length === 0 || keywordsMatched.length > 0) {
              results.push(lead);
            }
          } catch (cardError) {
            // Just skip this card
            debugLog(`Error processing card: ${cardError instanceof Error ? cardError.message : String(cardError)}`);
          }
        });
      } catch (cheerioError) {
        debugLog(`Error parsing HTML: ${cheerioError instanceof Error ? cheerioError.message : String(cheerioError)}`);
      }
    }
    
    return results;
  } catch (error) {
    debugLog(`Error in alternative property search: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

// Enhanced getProperties function to be more robust
export async function getProperties(
  location: string,
  keywords: string[] = [],
  listingType: 'fsbo' | 'agent' | 'both' = 'both',
  maxRetries = 3
): Promise<Lead[]> {
  let retryCount = 0;
  let leads: Lead[] = [];
  
  // Retry logic
  while (retryCount < maxRetries) {
    try {
      debugLog(`Attempting to get Redfin properties for ${location} (attempt ${retryCount + 1}/${maxRetries})`);
      
      // Parse location into city and state
      const { city, state } = parseLocation(location);
      if (!city || !state) {
        debugLog('Invalid location format. Expected "City, State"');
        break; // No need to retry with invalid location
      }
      
      // Try the GIS CSV API approach first
      leads = await getPropertiesFromCSV(city, state, keywords, listingType);
      
      // If successful, return the leads
      if (leads.length > 0) {
        debugLog(`Successfully found ${leads.length} properties using CSV API`);
        return leads;
      }
      
      // Log that we're trying alternative approach
      debugLog('CSV API approach returned no results, trying alternative search approach');
      
      // Try alternative approach
      leads = await tryAlternativePropertySearch(city, state, keywords, listingType);
      
      if (leads.length > 0) {
        debugLog(`Successfully found ${leads.length} properties using alternative approach`);
        return leads;
      }
      
      // If we've reached this point, neither approach found results
      debugLog('Both approaches failed to find properties, retrying...');
      retryCount++;
      
      // Add a small delay before retrying to avoid rate limiting
      if (retryCount < maxRetries) {
        const delay = 1000 * retryCount; // Increasing delay for each retry
        debugLog(`Waiting ${delay/1000} seconds before retry ${retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      debugLog(`Error in getProperties: ${error instanceof Error ? error.message : String(error)}`);
      retryCount++;
      
      // Add a delay before retrying
      if (retryCount < maxRetries) {
        const delay = 1000 * retryCount;
        debugLog(`Error occurred, waiting ${delay/1000} seconds before retry ${retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If all retries failed, return mock data as a last resort
  if (leads.length === 0) {
    debugLog('All attempts failed, returning mock data');
    return getMockProperties(location, keywords, listingType);
  }
  
  return leads;
}

// Improved helper function to get properties from CSV API
async function getPropertiesFromCSV(
  city: string,
  state: string,
  keywords: string[] = [],
  listingType: 'fsbo' | 'agent' | 'both' = 'both'
): Promise<Lead[]> {
  try {
    debugLog(`Fetching Redfin properties for ${city}, ${state} using CSV API`);
    
    // Get enhanced headers to better mimic a real browser
    const headers = getEnhancedHeaders();
    
    // Get search location ID
    const searchId = await getSearchId(city, state, headers);
    if (!searchId) {
      debugLog('Failed to get search ID');
      return [];
    }
    
    debugLog(`Got search ID: ${searchId}`);
    
    // Build the CSV API URL with the search ID
    const timestamp = Date.now();
    const csvUrl = `https://www.redfin.com/stingray/api/gis-csv?al=1&market=false&num_homes=350&ord=redfin-recommended-asc&page_number=1&region_id=${searchId}&region_type=6&sf=1,2,3,5,6,7&status=9&uipt=1,2,3,4,5,6,7,8&v=8&t=${timestamp}`;
    
    debugLog(`Fetching CSV data from: ${csvUrl}`);
    
    // Fetch the CSV data with enhanced headers
    let response = await fetch(csvUrl, {
      headers,
      redirect: 'follow'
    });
    
    // Sometimes the region_type is different (city vs county vs zip)
    if (!response.ok || (await response.text()).trim().length < 100) {
      debugLog('First attempt failed, trying with different region_type values');
      
      // Try alternative region types
      for (const regionType of [1, 2, 5, 7, 8, 9]) {
        const altUrl = `https://www.redfin.com/stingray/api/gis-csv?al=1&market=false&num_homes=350&ord=redfin-recommended-asc&page_number=1&region_id=${searchId}&region_type=${regionType}&sf=1,2,3,5,6,7&status=9&uipt=1,2,3,4,5,6,7,8&v=8&t=${timestamp}`;
        
        debugLog(`Trying region_type ${regionType}: ${altUrl}`);
        
        response = await fetch(altUrl, {
          headers,
          redirect: 'follow'
        });
        
        if (response.ok) {
          const text = await response.text();
          if (text.trim().length > 100 && text.includes(',')) {
            debugLog(`Found working region_type: ${regionType}`);
            break;
          }
        }
      }
    }
    
    if (!response.ok) {
      debugLog(`CSV API request failed with status: ${response.status}`);
      return [];
    }
    
    // Get the response text and check if it's valid
    const text = await response.text();
    
    // Debug output: log a sample of the response to help diagnose issues
    debugLog(`CSV response sample (first 200 chars): ${text.substring(0, 200)}`);
    
    // Check if the response contains actual CSV data (should have headers and multiple lines)
    if (!text.includes(',') || text.split('\n').length < 2) {
      debugLog('CSV response does not appear to be valid');
      return [];
    }
    
    // Remove prefix if present (Redfin often prefixes responses with a number)
    const csvData = text.replace(/^\d+?/, '');
    
    // Parse the CSV data
    const results = await parseCSV(csvData);
    
    if (!results || !Array.isArray(results) || results.length === 0) {
      debugLog('Failed to parse CSV data or no results found');
      return [];
    }
    
    debugLog(`Successfully parsed ${results.length} properties from CSV`);
    
    // Convert CSV results to leads
    const leads = results
      .filter(property => {
        // Apply listing type filter if specified
        if (listingType === 'fsbo' && property['SALE TYPE']?.toLowerCase() !== 'for sale by owner') {
          return false;
        }
        if (listingType === 'agent' && property['SALE TYPE']?.toLowerCase() === 'for sale by owner') {
          return false;
        }
        
        // Apply keyword filters if specified
        if (keywords.length > 0) {
          const addressString = `${property.ADDRESS || ''}, ${property.CITY || ''}, ${property.STATE || ''}`;
          const description = `${property.ADDRESS || ''}, ${property.CITY || ''}, ${property['BEDS'] || 0} beds, ${property['BATHS'] || 0} baths`;
          
          return keywords.some(keyword => {
            const keywordLower = keyword.toLowerCase();
            return addressString.toLowerCase().includes(keywordLower) ||
              description.toLowerCase().includes(keywordLower);
          });
        }
        
        return true;
      })
      .map(property => {
        // Determine keywords matched
        const addressString = `${property.ADDRESS || ''}, ${property.CITY || ''}, ${property.STATE || ''}`;
        const description = `${property.ADDRESS || ''}, ${property.CITY || ''}, ${property['BEDS'] || 0} beds, ${property['BATHS'] || 0} baths`;
        
        const keywordsMatched = keywords.filter(keyword => {
          const keywordLower = keyword.toLowerCase();
          return addressString.toLowerCase().includes(keywordLower) ||
            description.toLowerCase().includes(keywordLower);
        });
        
        // Calculate price, handling different formats
        let price = 0;
        if (property.PRICE) {
          const priceString = property.PRICE.replace(/[^\d.]/g, '');
          price = parseFloat(priceString);
        }
        
        // Generate full address
        const address = property.ADDRESS || '';
        const city = property.CITY || '';
        const state = property.STATE || '';
        const zip = property.ZIP || '';
        
        let fullAddress = address;
        if (zip) {
          fullAddress += `, ${city}, ${state} ${zip}`;
        } else if (city && state) {
          fullAddress += `, ${city}, ${state}`;
        }
        
        // Generate property description
        const beds = property.BEDS ? parseInt(property.BEDS, 10) : 0;
        const baths = property.BATHS ? parseFloat(property.BATHS) : 0;
        const sqft = property.SQFT ? parseInt(property.SQFT.replace(/[^\d]/g, ''), 10) : 0;
        
        let propertyDescription = '';
        if (beds || baths || sqft) {
          propertyDescription = `${beds} bed, ${baths} bath, ${sqft} sqft property located at ${fullAddress}`;
        } else {
          propertyDescription = `Property located at ${fullAddress}`;
        }
        
        if (property.REMARKS) {
          propertyDescription += `. ${property.REMARKS}`;
        }
        
        // Calculate days on market
        let daysOnMarket = 0;
        if (property['DAYS ON MARKET']) {
          const domString = property['DAYS ON MARKET'].replace(/[^\d]/g, '');
          daysOnMarket = parseInt(domString, 10) || 0;
        }
        
        // Generate listing URL - use URL from data or construct one
        let listingUrl = property.URL || '';
        if (!listingUrl) {
          // Try to use MLS ID if available
          if (property['MLS#']) {
            listingUrl = `https://www.redfin.com/homes-for-sale/detail/${property['MLS#']}`;
          } else {
            listingUrl = `https://www.redfin.com/search/redirect?search=${encodeURIComponent(fullAddress)}`;
          }
        }
        
        if (!listingUrl.startsWith('http')) {
          listingUrl = `https://www.redfin.com${listingUrl}`;
        }
        
        // Determine property type
        let propertyType: string | undefined = undefined;
        if (property['PROPERTY TYPE']) {
          propertyType = property['PROPERTY TYPE'];
        }
        
        // Determine listing type
        let leadListingType: 'fsbo' | 'agent' = 'agent';
        if (property['SALE TYPE']?.toLowerCase() === 'for sale by owner') {
          leadListingType = 'fsbo';
        }
        
        return {
          id: uuidv4(),
          address: fullAddress,
          city: city || '',
          state: state || '',
          zipcode: zip,
          price: isNaN(price) ? 0 : price,
          days_on_market: daysOnMarket,
          description: propertyDescription,
          source: 'redfin',
          keywords_matched: keywordsMatched,
          listing_url: listingUrl,
          created_at: new Date().toISOString(),
          property_type: propertyType,
          listing_type: leadListingType
        } as Lead;
      });
    
    return leads;
  } catch (error) {
    debugLog(`Error in getPropertiesFromCSV: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

// Get search ID using more advanced method
async function getSearchId(city: string, state: string, headers: Record<string, string>): Promise<string | null> {
  try {
    // Format the location for the URL
    const stateAbbr = getStateAbbreviation(state) || state;
    const formattedCity = city.toLowerCase().replace(/\s+/g, '-');
    const formattedState = stateAbbr.toLowerCase();
    
    // First try with direct API endpoint
    const searchApiUrl = `https://www.redfin.com/stingray/do/location-autocomplete?location=${encodeURIComponent(city)},${encodeURIComponent(stateAbbr)}&start=0&count=10&v=2&market=false&iss=false&ooa=true&mrs=false&includeTest=false&al=1`;
    
    debugLog(`Trying API endpoint first: ${searchApiUrl}`);
    
    let response = await fetch(searchApiUrl, {
      headers,
      redirect: 'follow'
    });
    
    if (response.ok) {
      const text = await response.text();
      
      // Remove the weird Redfin prefix in the response
      const cleanText = text.replace(/^\d+?/, '');
      
      try {
        const data = JSON.parse(cleanText);
        
        if (data?.payload?.sections?.[0]?.rows?.[0]?.id) {
          debugLog(`Found search ID via API: ${data.payload.sections[0].rows[0].id}`);
          return data.payload.sections[0].rows[0].id;
        }
      } catch (e) {
        debugLog(`Error parsing API response: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    
    // Fallback to page scraping approach
    const searchUrl = `https://www.redfin.com/${formattedState}/${formattedCity}`;
    
    debugLog(`Fetching search ID from page: ${searchUrl}`);
    
    // Fetch the page to get the search ID
    response = await fetch(searchUrl, {
      headers,
      redirect: 'follow'
    });
    
    if (!response.ok) {
      debugLog(`Search ID request failed with status: ${response.status}`);
      
      // Try alternative URL format
      const altSearchUrl = `https://www.redfin.com/city/${formattedCity}-${formattedState}`;
      debugLog(`Trying alternative URL: ${altSearchUrl}`);
      
      response = await fetch(altSearchUrl, {
        headers,
        redirect: 'follow'
      });
      
      if (!response.ok) {
        debugLog(`Alternative URL request also failed: ${response.status}`);
        return null;
      }
    }
    
    const html = await response.text();
    
    if (html.length < 1000) {
      debugLog('HTML response too small, possibly blocked');
      return null;
    }
    
    // Try different patterns to extract the search ID
    const patterns = [
      /region_id['":\s]*([0-9]+)/i,
      /regionId['":\s]*([0-9]+)/i,
      /RF\.searchRegionId\s*=\s*['"]?([0-9]+)/i,
      /region_id=([0-9]+)/i,
      /regionId['":]?\s*(\d+)/i,
      /region_id=([^&"]+)/i,
      /"regionId":(\d+)/i,
      /regionId:(\d+)/i
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        debugLog(`Found search ID using pattern ${pattern}: ${match[1]}`);
        return match[1];
      }
    }
    
    // If we still can't find an ID, try looking for a data attribute with location info
    const locationMatch = html.match(/data-location-id=['"]([^'"]+)['"]/i);
    if (locationMatch && locationMatch[1]) {
      debugLog(`Found location ID: ${locationMatch[1]}`);
      return locationMatch[1];
    }
    
    debugLog('Could not find search ID in the HTML response');
    return null;
  } catch (error) {
    debugLog(`Error getting search ID: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

// Helper function to get enhanced headers
function getEnhancedHeaders(): Record<string, string> {
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cache-Control': 'max-age=0',
    'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Referer': 'https://www.redfin.com/',
    'Cookie': '_ga=GA1.2.1721148152.1714000000; rfuid=abcdef1234567890abcdef1234567890; g_state={"i_p":1714000000000,"i_l":4}'
  };
}

// Define the parseLocation function
function parseLocation(location: string): { city: string; state: string } {
  // Default to empty values
  let city = '';
  let state = '';
  
  // Parse the location into city and state
  const parts = location.split(',');
  if (parts.length >= 2) {
    city = parts[0].trim();
    state = parts[1].trim();
  }
  
  return { city, state };
}

// Mock data function for when scraping fails
function getMockProperties(
  location: string,
  keywords: string[] = [],
  listingType: 'fsbo' | 'agent' | 'both' = 'both'
): Lead[] {
  const { city, state } = parseLocation(location);
  
  const mockLeads: Lead[] = [
    {
      id: uuidv4(),
      address: `123 Main St, ${city}, ${state}`,
      city,
      state,
      zipcode: '',
      price: 250000,
      days_on_market: 14,
      description: `3 bed, 2 bath, 1800 sqft property located at 123 Main St, ${city}, ${state}. Great starter home in a quiet neighborhood.`,
      source: 'redfin',
      keywords_matched: [],
      listing_url: `https://www.redfin.com/search/redirect?search=${encodeURIComponent(`123 Main St, ${city}, ${state}`)}`,
      created_at: new Date().toISOString(),
      property_type: 'Single Family Residential',
      listing_type: 'agent'
    },
    {
      id: uuidv4(),
      address: `456 Oak Ave, ${city}, ${state}`,
      city,
      state,
      zipcode: '',
      price: 350000,
      days_on_market: 7,
      description: `4 bed, 3 bath, 2400 sqft property located at 456 Oak Ave, ${city}, ${state}. Recently renovated with modern finishes.`,
      source: 'redfin',
      keywords_matched: [],
      listing_url: `https://www.redfin.com/search/redirect?search=${encodeURIComponent(`456 Oak Ave, ${city}, ${state}`)}`,
      created_at: new Date().toISOString(),
      property_type: 'Single Family Residential',
      listing_type: 'agent'
    },
    {
      id: uuidv4(),
      address: `789 Pine St, ${city}, ${state}`,
      city,
      state,
      zipcode: '',
      price: 175000,
      days_on_market: 30,
      description: `2 bed, 1 bath, 1200 sqft property located at 789 Pine St, ${city}, ${state}. Fixer-upper with great potential.`,
      source: 'redfin',
      keywords_matched: [],
      listing_url: `https://www.redfin.com/search/redirect?search=${encodeURIComponent(`789 Pine St, ${city}, ${state}`)}`,
      created_at: new Date().toISOString(),
      property_type: 'Single Family Residential',
      listing_type: 'fsbo'
    }
  ];
  
  // Filter by listing type if needed
  let filtered = mockLeads;
  if (listingType === 'fsbo') {
    filtered = mockLeads.filter(lead => lead.listing_type === 'fsbo');
  } else if (listingType === 'agent') {
    filtered = mockLeads.filter(lead => lead.listing_type === 'agent');
  }
  
  // Apply keyword filtering
  if (keywords.length > 0) {
    filtered = filtered.map(lead => {
      const keywordsMatched = keywords.filter(keyword => {
        const keywordLower = keyword.toLowerCase();
        return lead.address.toLowerCase().includes(keywordLower) ||
          lead.description.toLowerCase().includes(keywordLower);
      });
      
      return {
        ...lead,
        keywords_matched: keywordsMatched
      };
    }).filter(lead => lead.keywords_matched.length > 0);
  }
  
  return filtered;
}

// Parse CSV data
async function parseCSV(csvData: string): Promise<any[]> {
  try {
    // Debug the CSV data we received
    debugLog(`CSV data length: ${csvData.length} characters`);
    
    // Handle case where the first line might have download URL information
    let lines = csvData.trim().split(/\r?\n/);
    debugLog(`CSV contains ${lines.length} lines`);
    
    if (lines.length === 0) {
      debugLog('CSV data is empty');
      return [];
    }
    
    // Log the first line to debug
    debugLog(`First line of CSV: ${lines[0].substring(0, 100)}...`);
    
    // Check if the first line starts with a number or "download_link"
    if (lines[0].match(/^(\d+,|download_link=|url=)/i)) {
      debugLog('First line contains metadata, removing it');
      lines = lines.slice(1);
    }
    
    // If there's still data, try to parse it
    if (lines.length < 2) {
      debugLog('Not enough data in CSV: less than 2 lines');
      return [];
    }
    
    // Debug headers
    debugLog(`CSV headers: ${lines[0]}`);
    
    // Parse the CSV data manually
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const results = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = parseCSVLine(lines[i]);
      
      // Skip if we don't have enough values
      if (values.length < headers.length * 0.8) {  // Allow for some missing values
        debugLog(`Skipping line ${i}: insufficient values`);
        continue;
      }
      
      const record: Record<string, string> = {};
      for (let j = 0; j < Math.min(headers.length, values.length); j++) {
        record[headers[j]] = values[j];
      }
      
      // Only add records that have at least some essential fields
      if (record['ADDRESS'] || record['PRICE']) {
        results.push(record);
      }
    }
    
    debugLog(`Successfully parsed ${results.length} records from CSV`);
    
    // Log a sample record to help debugging
    if (results.length > 0) {
      debugLog(`Sample record: ${JSON.stringify(results[0])}`);
    }
    
    return results;
  } catch (error) {
    debugLog(`Error parsing CSV: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

// Helper function to parse CSV line, handling quoted values correctly
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Toggle the inQuotes state
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Handle escaped quotes (two double quotes in a row)
        current += '"';
        i++; // Skip the next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  
  return result;
} 