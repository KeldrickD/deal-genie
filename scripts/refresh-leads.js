// scripts/refresh-leads.js
import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';
import { scrapeZillowFSBO } from '../src/lib/scrapers/zillow.js';
import { scrapeCraigslist } from '../src/lib/scrapers/craigslist.js';
import { retry } from '../src/lib/utils/retry.js';

// Supabase service-role key for full access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 1. Load all enabled saved searches
async function refreshAllSavedSearches() {
  const { data: searches, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('enabled', true);
  if (error) throw error;

  for (const s of searches) {
    const { id: searchId, user_id, city, keywords, days_on_market, sources } = s;
    const kwList = (keywords || '').split(',').map((k) => k.trim()).filter(Boolean);
    let allLeads = [];

    if (sources.includes('zillow')) {
      const zLeads = await retry(() => scrapeZillowFSBO(city), 3, 1000);
      allLeads.push(...zLeads);
    }
    if (sources.includes('craigslist')) {
      const cLeads = await retry(() => scrapeCraigslist(city, kwList), 3, 1000);
      allLeads.push(...cLeads);
    }

    // Filter by DOM threshold
    const filtered = allLeads.filter((l) => l.days_on_market >= days_on_market);

    // Upsert leads into your `leads` table
    for (const lead of filtered) {
      await supabase.from('leads').upsert(
        {
          user_id,
          source_lead_id: lead.id,
          city,
          address: lead.address,
          price: lead.price,
          days_on_market: lead.days_on_market,
          source: lead.source,
          listing_url: lead.listing_url,
        },
        { onConflict: ['user_id', 'source_lead_id'] }
      );
    }
  }
}

// 2. Schedule: every day at 5:00 AM server time
cron.schedule('0 5 * * *', () => {
  console.log('▶️ Running daily lead refresh:', new Date().toISOString());
  refreshAllSavedSearches()
    .then(() => console.log('✅ Lead refresh complete'))
    .catch((err) => console.error('❌ Lead refresh error:', err));
});

// 3. If you want to run once immediately:
if (process.argv.includes('--once')) {
  refreshAllSavedSearches()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
} 