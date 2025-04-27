import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendDailyLeadAlerts } from '@/lib/emails/alerts';
import { searchLeads } from '@/lib/lead-hunter/searchLeads';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// This route is called by a Vercel cron job daily
export async function GET(req: NextRequest) {
  // Verify the cron job secret if set
  const authHeader = req.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`)
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    console.log('Starting daily lead alert job');
    
    // Get all enabled saved searches with email alerts enabled
    const { data: savedSearches, error } = await supabase
      .from('saved_searches')
      .select('*, user:user_id(*)')
      .eq('enabled', true)
      .eq('email_alert', true);
    
    if (error) {
      throw new Error(`Failed to fetch saved searches: ${error.message}`);
    }
    
    if (!savedSearches || savedSearches.length === 0) {
      console.log('No active saved searches found with email alerts enabled');
      return NextResponse.json({ message: 'No active saved searches found' });
    }
    
    console.log(`Found ${savedSearches.length} saved searches with alerts enabled`);
    
    // Process each saved search
    const results = await Promise.allSettled(
      savedSearches.map(async (search) => {
        try {
          // Extract user email from the joined user record
          const userEmail = search.user?.email;
          
          if (!userEmail) {
            throw new Error(`User email not found for search ${search.id}`);
          }
          
          // Get the search parameters
          const searchParams = {
            city: search.city,
            sources: search.sources,
            keywords: search.keywords || undefined,
            daysOnMarket: search.days_on_market || undefined,
            priceMin: search.price_min || undefined,
            priceMax: search.price_max || undefined,
          };
          
          // Search for new leads based on saved search criteria
          const leads = await searchLeads(searchParams);
          
          if (leads.length === 0) {
            console.log(`No new leads found for search ${search.id}`);
            return { search, sent: false, leadCount: 0 };
          }
          
          // Get the last 24 hours of leads only
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);
          
          const newLeads = leads.filter(lead => {
            const listingDate = new Date(lead.date_listed);
            return listingDate >= oneDayAgo;
          });
          
          if (newLeads.length === 0) {
            console.log(`No new leads in the last 24 hours for search ${search.id}`);
            return { search, sent: false, leadCount: 0 };
          }
          
          // Send email alert with new leads
          await sendDailyLeadAlerts({
            email: userEmail,
            searchName: search.name,
            leads: newLeads,
            searchId: search.id,
          });
          
          console.log(`Sent alert email for search ${search.id} with ${newLeads.length} leads`);
          
          // Log the usage
          await supabase.from('usage_logs').insert({
            user_id: search.user_id,
            feature: 'lead_alert_email',
            count: 1,
            metadata: { search_id: search.id, lead_count: newLeads.length }
          });
          
          return { search, sent: true, leadCount: newLeads.length };
        } catch (error: any) {
          console.error(`Error processing search ${search.id}:`, error);
          return { search, error: error.message, sent: false };
        }
      })
    );
    
    // Compile stats
    const stats = {
      total: savedSearches.length,
      processed: results.length,
      successful: results.filter(r => r.status === 'fulfilled' && (r.value as any).sent).length,
      failed: results.filter(r => r.status === 'rejected' || ((r.status === 'fulfilled') && (r.value as any).error)).length,
      leadsSent: results.reduce((sum, r) => {
        if (r.status === 'fulfilled' && (r.value as any).sent) {
          return sum + (r.value as any).leadCount;
        }
        return sum;
      }, 0)
    };
    
    console.log('Daily lead alert job completed', stats);
    
    return NextResponse.json({ 
      message: 'Daily lead alert job completed', 
      stats
    });
  } catch (error: any) {
    console.error('Error in daily lead alert job:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process daily lead alerts' },
      { status: 500 }
    );
  }
} 