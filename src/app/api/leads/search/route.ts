import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { scrapeZillowFSBO, Lead } from '@/lib/scrapers/zillow';
import { scrapeCraigslist } from '@/lib/scrapers/craigslist';
import { scrapeFacebook } from '@/lib/scrapers/facebook';
import { scrapeRealtor } from '@/lib/scrapers/realtor';

// Helper function for logging
function apiLog(message: string, data?: any) {
  console.log(`[API SEARCH] ${message}`);
  if (data) {
    console.log(typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
}

export async function POST(request: NextRequest) {
  const authObj = await auth();
  const userId = authObj?.userId;
  
  apiLog(`Request received, authenticated user: ${userId ? 'yes' : 'no'}`);
  
  if (!userId) {
    apiLog('Unauthorized request, no user ID found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      city, 
      state,
      priceMin, 
      priceMax, 
      days_on_market, 
      days_on_market_option, 
      listing_type = 'both',
      sources = [], 
      keywords = '' 
    } = body;

    apiLog('Request parameters:', { 
      city, state, priceMin, priceMax, days_on_market, 
      days_on_market_option, listing_type, sources, keywords 
    });

    if (!city) {
      apiLog('Missing required parameter: city');
      return NextResponse.json({ error: 'City is required' }, { status: 400 });
    }
    
    if (!state) {
      apiLog('Missing required parameter: state');
      return NextResponse.json({ error: 'State is required' }, { status: 400 });
    }

    const keywordArray = keywords.split(',').filter((k: string) => k.trim() !== '');
    let allLeads: any[] = [];

    apiLog(`Processing ${keywordArray.length} keywords: ${keywordArray.join(', ') || 'none'}`);
    apiLog(`Searching sources: ${sources.join(', ')}`);

    // Run searches in parallel using Promise.all for better performance
    const searchPromises = [];

    if (sources.includes('zillow')) {
      apiLog(`Starting Zillow search for ${city}, ${state}`);
      const zillowPromise = async () => {
        try {
          apiLog(`Calling Zillow scraper with listing type: ${listing_type}`);
          const results = await scrapeZillowFSBO(city, state, keywordArray, listing_type as 'fsbo' | 'agent' | 'both');
          apiLog(`Zillow search completed, found ${results.length} results`);
          return results.map((result: any) => ({
            ...result,
            user_id: userId
          }));
        } catch (error) {
          apiLog(`Error scraping Zillow: ${error instanceof Error ? error.stack || error.message : String(error)}`);
          return [];
        }
      };
      searchPromises.push(zillowPromise());
    }

    if (sources.includes('craigslist')) {
      apiLog(`Starting Craigslist search for ${city}, ${state}`);
      const craigslistPromise = async () => {
        try {
          // Pass only the required parameters
          const results = await scrapeCraigslist(city, state);
          apiLog(`Craigslist search completed, found ${results.length} results`);
          return results.map(result => ({
            ...result,
            user_id: userId,
            listing_type: 'fsbo' // Craigslist typically only has FSBO listings
          }));
        } catch (error) {
          apiLog(`Error scraping Craigslist: ${error instanceof Error ? error.stack || error.message : String(error)}`);
          return [];
        }
      };
      searchPromises.push(craigslistPromise());
    }

    if (sources.includes('facebook')) {
      apiLog(`Starting Facebook search for ${city}, ${state}`);
      const facebookPromise = async () => {
        try {
          // Pass only the required parameters
          const results = await scrapeFacebook(city, state);
          apiLog(`Facebook search completed, found ${results.length} results`);
          return results.map(result => ({
            ...result,
            user_id: userId,
            listing_type: 'fsbo' // Facebook Marketplace typically has FSBO listings
          }));
        } catch (error) {
          apiLog(`Error scraping Facebook: ${error instanceof Error ? error.stack || error.message : String(error)}`);
          return [];
        }
      };
      searchPromises.push(facebookPromise());
    }

    if (sources.includes('realtor')) {
      apiLog(`Starting Realtor.com search for ${city}, ${state}`);
      const realtorPromise = async () => {
        try {
          // Pass only the required parameters
          const results = await scrapeRealtor(city, state);
          apiLog(`Realtor.com search completed, found ${results.length} results`);
          return results.map(result => ({
            ...result,
            user_id: userId,
            listing_type: 'agent' // Realtor.com typically has agent listings
          }));
        } catch (error) {
          apiLog(`Error scraping Realtor.com: ${error instanceof Error ? error.stack || error.message : String(error)}`);
          return [];
        }
      };
      searchPromises.push(realtorPromise());
    }

    // Execute all search promises in parallel
    apiLog(`Executing ${searchPromises.length} search promises in parallel`);
    const searchResults = await Promise.all(searchPromises);
    
    // Combine all results
    allLeads = searchResults.flat();
    apiLog(`Total results before filtering: ${allLeads.length}`);

    // Filter by price range
    if (priceMin || priceMax) {
      apiLog(`Filtering by price range: $${priceMin || 0} - $${priceMax || 'unlimited'}`);
      const beforeCount = allLeads.length;
      allLeads = allLeads.filter(lead => {
        const price = lead.price;
        return (!priceMin || price >= priceMin) && (!priceMax || price <= priceMax);
      });
      apiLog(`After price filtering: ${allLeads.length} leads (removed ${beforeCount - allLeads.length})`);
    }

    // Filter by days on market
    if (days_on_market) {
      apiLog(`Filtering by days on market: ${days_on_market_option} than ${days_on_market} days`);
      const beforeCount = allLeads.length;
      allLeads = allLeads.filter(lead => {
        const dom = lead.days_on_market;
        if (days_on_market_option === "less") {
          return dom <= days_on_market;
        } else {
          return dom >= days_on_market;
        }
      });
      apiLog(`After days on market filtering: ${allLeads.length} leads (removed ${beforeCount - allLeads.length})`);
    }

    // If listing_type is not 'both', filter by listing type
    if (listing_type !== 'both') {
      apiLog(`Filtering by listing type: ${listing_type}`);
      const beforeCount = allLeads.length;
      allLeads = allLeads.filter(lead => 
        lead.listing_type === listing_type
      );
      apiLog(`After listing type filtering: ${allLeads.length} leads (removed ${beforeCount - allLeads.length})`);
    }

    apiLog(`Returning ${allLeads.length} final leads after all filtering`);
    return NextResponse.json({ leads: allLeads });
  } catch (error) {
    apiLog(`ERROR in search API: ${error instanceof Error ? error.stack || error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to search for leads' }, { status: 500 });
  }
}