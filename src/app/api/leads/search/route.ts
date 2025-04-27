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

// Wrapper for safer JSON response handling
function safeJsonResponse(data: any, status = 200) {
  try {
    return NextResponse.json(data, { status });
  } catch (error) {
    console.error("Error creating JSON response:", error);
    // Return an emergency fallback response
    return new Response(JSON.stringify({ error: "Internal server error", leads: [] }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// TEMPORARY: For debugging, allow bypassing auth in development
const BYPASS_AUTH = process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  // Global try-catch to ensure we always return a valid response
  try {
    // 1. Check authentication with detailed logging
    let authObj;
    let userId;
    
    try {
      authObj = await auth();
      userId = authObj?.userId;
      
      apiLog(`Auth check - userId: ${userId || 'none'}, sessionId: ${authObj?.sessionId ? 'present' : 'none'}`);
      apiLog(`Auth check - headers: ${JSON.stringify(Object.fromEntries(
        Array.from(request.headers.entries())
          .filter(([key]) => !key.toLowerCase().includes('authorization') && !key.toLowerCase().includes('cookie'))
      ))}`);
      
      if (!userId && !BYPASS_AUTH) {
        apiLog('Unauthorized request, no user ID found');
        return safeJsonResponse({ 
          error: 'Unauthorized', 
          leads: [],
          authDebug: {
            hasSession: !!authObj?.sessionId,
            env: process.env.NODE_ENV
          }
        }, 401);
      }
      
      // If bypassing auth in development, set a fake user ID
      if (!userId && BYPASS_AUTH) {
        apiLog('DEVELOPMENT MODE: Bypassing authentication');
        userId = 'dev-user-bypass';
      }
    } catch (authError) {
      apiLog(`Auth error: ${authError instanceof Error ? authError.message : String(authError)}`);
      
      // In development, bypass auth errors
      if (BYPASS_AUTH) {
        apiLog('DEVELOPMENT MODE: Bypassing authentication after error');
        userId = 'dev-user-error-bypass';
      } else {
        return safeJsonResponse({ 
          error: 'Authentication failed', 
          leads: [],
          message: authError instanceof Error ? authError.message : String(authError)
        }, 401);
      }
    }

    // 2. Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      apiLog(`Error parsing request body: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      return safeJsonResponse({ error: 'Invalid request format', leads: [] }, 400);
    }
    
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
      return safeJsonResponse({ error: 'City is required', leads: [] }, 400);
    }
    
    if (!state) {
      apiLog('Missing required parameter: state');
      return safeJsonResponse({ error: 'State is required', leads: [] }, 400);
    }

    // 3. Process keywords
    const keywordArray = keywords.split(',').filter((k: string) => k.trim() !== '');
    let allLeads: any[] = [];

    apiLog(`Processing ${keywordArray.length} keywords: ${keywordArray.join(', ') || 'none'}`);
    apiLog(`Searching sources: ${sources.join(', ')}`);

    // 4. Run searches with improved error handling
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

    // 5. Execute all search promises with error handling
    apiLog(`Executing ${searchPromises.length} search promises in parallel`);
    let searchResults;
    try {
      searchResults = await Promise.all(searchPromises);
    } catch (promiseError) {
      apiLog(`Error executing search promises: ${promiseError instanceof Error ? promiseError.message : String(promiseError)}`);
      // Return empty results instead of failing
      return safeJsonResponse({ 
        leads: [], 
        error: "Some search sources failed",
        partialFailure: true
      });
    }
    
    // 6. Combine and filter results
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

    // 7. Return the filtered results
    apiLog(`Returning ${allLeads.length} final leads after all filtering`);
    return safeJsonResponse({ leads: allLeads });
    
  } catch (globalError) {
    // Catch any uncaught errors and return a safe response
    console.error(`GLOBAL ERROR in search API: ${globalError instanceof Error ? globalError.stack || globalError.message : String(globalError)}`);
    return safeJsonResponse({ 
      error: 'An unexpected error occurred', 
      leads: [],
      errorType: globalError instanceof Error ? globalError.name : 'Unknown'
    }, 500);
  }
}