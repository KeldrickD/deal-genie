# Lead Genie Documentation

## Overview

Lead Genie is a powerful feature of Deal Genie that helps real estate investors find For Sale By Owner (FSBO) properties and other off-market deals across multiple sources. The system automatically scrapes, filters, and delivers high-quality leads to users based on their preferences.

## Key Features

- **Multi-source Search**: Search across Zillow, Craigslist, and other platforms with a single query
- **Customizable Filters**: Filter properties by price, days on market, keywords, and more
- **Saved Searches**: Save your search criteria for quick access and daily updates
- **Email Alerts**: Receive daily email notifications for new properties matching your criteria
- **Usage Tracking**: Monitor your search quotas and usage

## Using Lead Genie

### Searching for Properties

1. Navigate to **Lead Genie > Search**
2. Enter your search criteria:
   - **City**: Required. The city where you want to find properties
   - **Price Range**: Optional. Minimum and maximum price
   - **Days on Market**: Optional. Filter by how recently properties were listed
   - **Sources**: Select which platforms to search (Zillow, Craigslist, etc.)
   - **Keywords**: Optional. Specific terms to look for like "motivated seller" or "fixer-upper"

3. Click **Search For Leads**
4. Review the results displayed on the right side of the screen
5. Click **Save to CRM** on any property you want to add to your pipeline

### Managing Saved Searches

1. Navigate to **Lead Genie > Saved Searches**
2. From here you can:
   - View all your saved searches
   - Edit search parameters
   - Enable/disable searches
   - Toggle email alerts
   - Delete searches

### Email Alerts

When you enable email alerts for a saved search, you'll receive daily notifications (at 5 AM) with any new properties that match your criteria from the last 24 hours.

## Technical Implementation

### Architecture

- **Frontend**: Next.js components in `/src/app/lead-genie/`
- **Backend**: API routes in `/src/app/api/leads/` and `/src/app/api/saved-searches/`
- **Scheduler**: Daily cron job at `/src/app/api/cron/daily-lead-alerts`
- **Database**: Supabase tables for `properties`, `saved_searches`, and `usage_logs`
- **Utilities**: Retry and error handling in `/src/lib/utils/retry.ts`

### Database Tables

#### saved_searches

```sql
CREATE TABLE saved_searches (
  id             uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid      NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           text      NOT NULL,
  city           text      NOT NULL,
  keywords       text,
  days_on_market int       NOT NULL DEFAULT 0,
  sources        text[]    NOT NULL,
  price_min      int,
  price_max      int,
  property_type  text      NOT NULL DEFAULT '',
  email_alert    boolean   NOT NULL DEFAULT false,
  enabled        boolean   NOT NULL DEFAULT true,
  created_at     timestamp NOT NULL DEFAULT now(),
  updated_at     timestamp NOT NULL DEFAULT now()
);
```

### Usage Limits

Usage limits are based on the user's subscription tier:

- **Free**: 2 saved searches, 25 daily search queries
- **Professional**: 10 saved searches, 100 daily search queries
- **Enterprise**: 50 saved searches, unlimited daily search queries

### Error Monitoring

All errors are captured using Sentry and can be monitored in the Sentry dashboard. Critical errors in the scraping system will trigger alerts to the development team.

## Extending Lead Genie

### Adding New Scrapers

To add a new property source:

1. Create a new scraper in `/src/lib/scrapers/`
2. Add the source to the sources list in the search UI
3. Update the scheduler to include the new source

### Adding New Filters

To add new property filters:

1. Update the `Property` interface in `/src/types/property.ts`
2. Add the filter UI in the search form
3. Modify the search query in `/src/lib/lead-hunter/searchLeads.ts`

## Troubleshooting

### Common Issues

- **No results found**: Try broadening your search criteria or check another source
- **Slow searches**: This can happen when searching in major metro areas with many results
- **Missing email alerts**: Check your spam folder or verify that email alerts are enabled 