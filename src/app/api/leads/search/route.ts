import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { scrapeZillowFSBO } from '@/lib/scrapers/zillow';
import { scrapeCraigslist } from '@/lib/scrapers/craigslist';
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
    const { city, keywords = '', sources = ['zillow', 'craigslist'], days_on_market = 0, property_type = '' } = body;
    
    if (!city) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 });
    }
    
    // Process keywords
    const kwList = keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
    
    // Fetch leads from selected sources
    let allLeads = [];
    
    if (sources.includes('zillow')) {
      try {
        const zLeads = await retry(() => scrapeZillowFSBO(city), 3, 1000);
        allLeads.push(...zLeads);
      } catch (error) {
        console.error('Zillow scraping error:', error);
      }
    }
    
    if (sources.includes('craigslist')) {
      try {
        const cLeads = await retry(() => scrapeCraigslist(city, kwList), 3, 1000);
        allLeads.push(...cLeads);
      } catch (error) {
        console.error('Craigslist scraping error:', error);
      }
    }
    
    // Apply filters
    let filtered = allLeads;
    
    // Filter by days on market
    if (days_on_market > 0) {
      filtered = filtered.filter(lead => lead.days_on_market >= days_on_market);
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