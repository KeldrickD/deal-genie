import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import type { Lead } from './zillow';

export async function scrapeCraigslist(city: string, keywords: string[] = []): Promise<Lead[]> {
  try {
    // Convert city name to a format Craigslist likely uses
    let citySubdomain = city.toLowerCase().replace(/\s+/g, '');
    
    // Common replacements for major cities
    const cityMappings: Record<string, string> = {
      'newyork': 'newyork',
      'nyc': 'newyork',
      'losangeles': 'losangeles',
      'la': 'losangeles',
      'sanfrancisco': 'sfbay',
      'sf': 'sfbay',
      'atlanta': 'atlanta',
      'miami': 'miami',
      'chicago': 'chicago',
      'denver': 'denver',
      'houston': 'houston',
      'dallas': 'dallas',
      'austin': 'austin',
      'boston': 'boston',
      'philadelphia': 'philadelphia',
      'phoenix': 'phoenix',
      'portland': 'portland',
      'seattle': 'seattle'
    };
    
    // Use mapping if available
    citySubdomain = cityMappings[citySubdomain] || citySubdomain;
    
    const url = `https://${citySubdomain}.craigslist.org/search/rea?purveyor=owner&hasPic=1`;
    console.log(`Scraping Craigslist URL: ${url}`);
    
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error(`Failed to fetch from Craigslist: ${res.status} ${res.statusText}`);
      return [];
    }
    
    const html = await res.text();
    const $ = cheerio.load(html);

    const leads: Lead[] = [];
    
    // Try multiple selectors to account for different Craigslist layouts
    const selectors = ['.result-info', '.cl-static-search-result', '.result'];
    
    let foundResults = false;
    
    for (const selector of selectors) {
      if ($(selector).length > 0) {
        foundResults = true;
        $(selector).each((_, el) => {
          try {
            const title = $(el).find('.titlestring, .title, h3, a').text().trim();
            
            // Some Craigslist sites have different HTML structures
            const listingUrl = $(el).find('a').attr('href') || '';
            const priceEl = $(el).find('.result-price, .price');
            const priceText = priceEl.length ? priceEl.first().text().replace(/[$,]/g, '') : '0';
            const price = parseInt(priceText, 10) || 0;
            
            // Get days on market from date posted
            const datePosted = $(el).find('time').attr('datetime');
            let daysOnMarket = 0;
            if (datePosted) {
              daysOnMarket = Math.floor((Date.now() - new Date(datePosted).getTime()) / (1000 * 60 * 60 * 24));
            }
            
            // Get description from various possible elements
            const neighborhoodEl = $(el).find('.result-hood, .neighborhood').text().trim();
            const metaInfo = $(el).find('.housing').text().trim();
            
            // Extract city from title or neighborhood
            const cityRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
            const neighborhoodMatch = neighborhoodEl.match(cityRegex);
            const extractedCity = neighborhoodMatch ? neighborhoodMatch[0] : city;
            
            // Create description 
            let description = `${title} ${metaInfo} ${neighborhoodEl}`.trim();
            if (description.length < 10) {
              description = "For sale by owner property listed on Craigslist.";
            }
            
            // Check if listing matches any keywords
            const lowerTitle = title.toLowerCase();
            const lowerDesc = description.toLowerCase();
            
            const matchedKeywords = keywords.filter(kw => 
              lowerTitle.includes(kw.toLowerCase()) || 
              lowerDesc.includes(kw.toLowerCase())
            );
            
            // If keywords are provided but none match, skip this listing
            if (keywords.length > 0 && matchedKeywords.length === 0) {
              return;
            }
            
            leads.push({
              id: `craigslist-${uuidv4()}`,
              address: title,
              city: extractedCity,
              price,
              days_on_market: daysOnMarket,
              description,
              source: 'craigslist',
              keywords_matched: matchedKeywords,
              listing_url: listingUrl.startsWith('http') ? listingUrl : `https://${citySubdomain}.craigslist.org${listingUrl}`,
              created_at: new Date().toISOString(),
              property_type: 'unknown'
            });
          } catch (err) {
            // Skip this listing if there's an error parsing it
            console.error('Error parsing Craigslist listing:', err);
          }
        });
        
        // If we found results with this selector, no need to try others
        break;
      }
    }
    
    console.log(`Found ${leads.length} leads from Craigslist`);
    return leads;
  } catch (error) {
    console.error('Error scraping Craigslist:', error);
    return [];
  }
} 