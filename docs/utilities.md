# Lead Genie Utilities

This document describes utility components that enhance the Lead Genie system.

## Retry Utility

The retry utility (`src/lib/utils/retry.ts`) provides robust error handling for network operations, especially useful when scraping websites that may throttle or temporarily reject requests.

### Usage

```typescript
import { retry } from '@/lib/utils/retry';

// Basic usage with defaults (3 retries, 500ms initial delay)
const data = await retry(() => fetchSomeData());

// Custom configuration
const data = await retry(
  () => scrapeSomeWebsite(), 
  5,                 // 5 retries
  1000               // 1000ms initial delay (doubles each retry)
);
```

The retry function implements exponential backoff, doubling the delay after each failed attempt.

## Lead Refresh Scheduler

The lead refresh scheduler (`scripts/refresh-leads.js`) automates the process of refreshing leads from various sources based on saved searches.

### Features

- Refreshes leads daily at 5:00 AM server time
- Respects user-configured sources (Zillow, Craigslist)
- Filters leads by minimum days-on-market threshold
- Uses retry utility to handle temporary network failures
- Upserts leads to prevent duplicates

### Running the Scheduler

#### One-time refresh:

```bash
npm run refresh-leads
```

#### Start the scheduler daemon:

```bash
npm run scheduler
```

### Configuration

The scheduler reads from the `saved_searches` table in Supabase, which should have the following structure:

- `id`: Unique identifier
- `user_id`: User who created the search
- `city`: Target city for the search
- `keywords`: Comma-separated list of keywords (for Craigslist)
- `days_on_market`: Minimum days on market threshold
- `sources`: Array of sources to check (e.g., ["zillow", "craigslist"])
- `enabled`: Boolean flag to enable/disable the search

When deploying to production, ensure you've set the required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` 