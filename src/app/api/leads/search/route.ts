import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { scrapeZillowFSBO } from '@/lib/scrapers/zillow';
import { scrapeCraigslist } from '@/lib/scrapers/craigslist';
import { scrapeFacebook } from '@/lib/scrapers/facebook';
import { scrapeRealtor } from '@/lib/scrapers/realtor';
import { Lead } from '@/types/lead';
import { filterLeadsByPrice } from '@/lib/leads';

export async function POST(request: NextRequest) {
  const { userId } = auth();
  
  if (!userId) {
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

    if (!city) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 });
    }
    
    if (!state) {
      return NextResponse.json({ error: 'State is required' }, { status: 400 });
    }

    const keywordArray = keywords.split(',').filter((k: string) => k.trim() !== '');
    let allLeads: any[] = [];

    // Run searches in parallel using Promise.all for better performance
    const searchPromises = [];

    if (sources.includes('zillow')) {
      const zillowPromise = async () => {
        try {
          const results = await scrapeZillowFSBO(city, state, keywordArray, listing_type as 'fsbo' | 'agent' | 'both');
          return results.map((result: any) => ({
            ...result,
            user_id: userId
          }));
        } catch (error) {
          console.error('Error scraping Zillow:', error);
          return [];
        }
      };
      searchPromises.push(zillowPromise());
    }

    if (sources.includes('craigslist')) {
      const craigslistPromise = async () => {
        try {
          const results = await scrapeCraigslist(city, state, keywordArray);
          return results.map(result => ({
            ...result,
            user_id: userId,
            listing_type: 'fsbo' // Craigslist typically only has FSBO listings
          }));
        } catch (error) {
          console.error('Error scraping Craigslist:', error);
          return [];
        }
      };
      searchPromises.push(craigslistPromise());
    }

    if (sources.includes('facebook')) {
      const facebookPromise = async () => {
        try {
          const results = await scrapeFacebook(city, state, keywordArray);
          return results.map(result => ({
            ...result,
            user_id: userId,
            listing_type: 'fsbo' // Facebook Marketplace typically has FSBO listings
          }));
        } catch (error) {
          console.error('Error scraping Facebook:', error);
          return [];
        }
      };
      searchPromises.push(facebookPromise());
    }

    if (sources.includes('realtor')) {
      const realtorPromise = async () => {
        try {
          const results = await scrapeRealtor(city, state, keywordArray);
          return results.map(result => ({
            ...result,
            user_id: userId,
            listing_type: 'agent' // Realtor.com typically has agent listings
          }));
        } catch (error) {
          console.error('Error scraping Realtor.com:', error);
          return [];
        }
      };
      searchPromises.push(realtorPromise());
    }

    // Execute all search promises in parallel
    const searchResults = await Promise.all(searchPromises);
    
    // Combine all results
    allLeads = searchResults.flat();

    // Filter by price range
    if (priceMin || priceMax) {
      allLeads = allLeads.filter(lead => {
        const price = lead.price;
        return (!priceMin || price >= priceMin) && (!priceMax || price <= priceMax);
      });
    }

    // Filter by days on market
    if (days_on_market) {
      allLeads = allLeads.filter(lead => {
        const dom = lead.days_on_market;
        if (days_on_market_option === "less") {
          return dom <= days_on_market;
        } else {
          return dom >= days_on_market;
        }
      });
    }

    // If listing_type is not 'both', filter by listing type
    if (listing_type !== 'both') {
      allLeads = allLeads.filter(lead => 
        lead.listing_type === listing_type
      );
    }

    return NextResponse.json({ leads: allLeads });
  } catch (error) {
    console.error('Error searching for leads:', error);
    return NextResponse.json({ error: 'Failed to search for leads' }, { status: 500 });
  }
}