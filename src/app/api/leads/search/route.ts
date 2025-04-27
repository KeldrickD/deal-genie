import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { scrapeZillowFSBO } from '@/lib/scrapers/zillow';
import { scrapeCraigslist } from '@/lib/scrapers/craigslist';
import { scrapeFacebook } from '@/lib/scrapers/facebook';
import { scrapeRealtor } from '@/lib/scrapers/realtor';
import { retry } from '@/lib/utils/retry';
import { getSession } from '@/lib/auth';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Track usage
    await fetch('/api/usage/track', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ userId, feature: 'lead_search' })
    }).catch(err => console.error('Usage tracking error:', err));
    
    // Parse search parameters
    const body = await req.json();
    const { 
      city, 
      keywords = '', 
      sources = ['zillow', 'craigslist'], 
      days_on_market = 0, 
      days_on_market_option = 'less',
      property_type = '',
      priceMin,
      priceMax 
    } = body;
    
    if (!city) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 });
    }
    
    // Process keywords
    const kwList = keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
    
    // Fetch leads from selected sources
    let allLeads = [];
    
    // Create an array of promises for parallel scraping
    const scrapingPromises = [];
    
    if (sources.includes('zillow')) {
      scrapingPromises.push(
        retry(() => scrapeZillowFSBO(city, kwList), 3, 1000)
          .catch(error => {
            console.error('Zillow scraping error:', error);
            return [];
          })
      );
    }
    
    if (sources.includes('craigslist')) {
      scrapingPromises.push(
        retry(() => scrapeCraigslist(city, kwList), 3, 1000)
          .catch(error => {
            console.error('Craigslist scraping error:', error);
            return [];
          })
      );
    }
    
    if (sources.includes('facebook')) {
      scrapingPromises.push(
        retry(() => scrapeFacebook(city, kwList), 3, 1000)
          .catch(error => {
            console.error('Facebook scraping error:', error);
            return [];
          })
      );
    }
    
    if (sources.includes('realtor')) {
      scrapingPromises.push(
        retry(() => scrapeRealtor(city, kwList), 3, 1000)
          .catch(error => {
            console.error('Realtor scraping error:', error);
            return [];
          })
      );
    }
    
    // Wait for all scraping to complete
    const results = await Promise.all(scrapingPromises);
    
    // Combine all results
    allLeads = results.flat();
    
    // Apply filters
    let filtered = allLeads;
    
    // Filter by days on market
    if (days_on_market > 0) {
      if (days_on_market_option === 'less') {
        filtered = filtered.filter(lead => lead.days_on_market <= days_on_market);
      } else if (days_on_market_option === 'more') {
        filtered = filtered.filter(lead => lead.days_on_market >= days_on_market);
      }
    }
    
    // Filter by price range
    if (priceMin !== undefined) {
      filtered = filtered.filter(lead => lead.price >= priceMin);
    }
    
    if (priceMax !== undefined) {
      filtered = filtered.filter(lead => lead.price <= priceMax);
    }
    
    // Filter by property type if specified
    if (property_type) {
      filtered = filtered.filter(lead => 
        lead.property_type?.toLowerCase().includes(property_type.toLowerCase())
      );
    }
    
    return NextResponse.json({ 
      leads: filtered,
      total: filtered.length,
      sources: sources
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to search leads' }, { status: 500 });
  }
}