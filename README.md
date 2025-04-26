# Deal Genie

**The AI Operating System for Real Estate Investors**  
Make smarter, faster real estate decisions with AI-powered deal analysis, offer generation, and strategy simulation.

---

## 🔮 Features

- ✨ **AI Deal Analyzer** – ARV, rehab cost, MAO, ROI, Go/No-Go
- 📄 **Offer Generator** – Auto-creates offer emails + downloadable PDFs
- 🧠 **Genie Profile** – Learns your strategy and adapts over time
- 📍 **Smart Scout** – Hot zip code alerts based on ROI and velocity
- 🗂️ **Lead Dashboard** – Track your past deals, upload new ones
- 🧪 Streaks, XP, and "Genie says pass/buy" branding

---

## 🧰 Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Backend**: API Routes / Edge Functions (Vercel)
- **Database/Auth**: Supabase (Postgres)
- **AI**: OpenAI GPT-4 (with function calling)
- **PDF Generation**: react-pdf or server-side renderer
- **External Data APIs**: Estated, RentCast, or Zillow-like services

---

## 📦 Local Development

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/Deal Genie.git
   cd Deal Genie
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your own API keys and configuration.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📖 Documentation

- [Architecture Overview](docs/architecture.md)
- [Feature Logs](docs/features/)
- [API Reference](docs/api/)

## V1 Features

### 1. Property Analysis
- Detailed property analysis with ARV, MAO, ROI, and rehab estimates
- AI-powered evaluation of deals with confidence scores
- Automatic recommendations (buy/pass)

### 2. Exit Strategy Simulator
- Compare different investment strategies (Fix & Flip, BRRRR, Buy & Hold, Wholesale)
- Calculate ROI, profit potential, and timeframes for each strategy
- Detailed breakdown of costs, expenses, and returns
- Real-time adjustments for all variables

### 3. Genie Profile
- Personalized investment preferences and strategy selection
- Risk tolerance settings and target ROI configuration
- Track progress and investment performance

### 4. Offer Generator
- Create professional offer documents
- Automatically populate with analysis data
- Email directly to sellers or agents
- PDF export and download options

### 5. Smart Scout
- Hot zip code alerts based on market data
- Customizable alerts for investment opportunities
- Market trend analysis and predictions

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure your environment variables
4. Run the development server: `npm run dev`

## Technologies

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- OpenAI API

# Deal Genie Property Analysis Integration

## New Feature: Enhanced Property Analysis

The property analysis feature now integrates RentCast for rental data and GPT-4o's web-search for live comparable sales, providing a comprehensive real estate analysis solution.

### Key Features

- **Rental Estimates**: Get accurate rental estimates from RentCast API
- **Live Market Comps**: Pull recent comparable sales using GPT-4o's web search
- **Smart Analysis**: Automatically calculate ARV, repair costs, MAO, and ROI
- **Address Validation**: Use Google Maps Places API for address standardization
- **Graceful Degradation**: Fall back gracefully when data sources are limited
- **Performance Optimization**: Caching system to improve speed and reduce API costs

## Setup

1. **Environment Variables**

Add the following to your `.env.local` file:

```
# RentCast API for rental data
RENTCAST_API_KEY=your_rentcast_api_key_here

# OpenAI API for GPT-4o with web-search
OPENAI_API_KEY=your_openai_api_key_here

# Google Maps API for address autocomplete (frontend)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

2. **Install Dependencies**

```bash
npm install openai node-fetch@2
```

3. **Test the Integration**

Visit the demo page at `/analyze-demo` to try the full integration.

## API Usage

Send a POST request to `/api/analyze` with an address:

```javascript
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ address: '123 Main St, Anytown, USA' }),
});

const data = await response.json();
```

Response format:

```javascript
{
  rentalData: {
    rent: 1500,
    dom: 30,
    trends: { '6m': '+2%', '12m': '+5%' }
  },
  comps: "Comparable sales information...",
  analysis: "Property analysis with ARV, repair cost, MAO, ROI...",
  errors: {} // Any errors encountered during analysis
}
```

## Error Handling

The API includes robust error handling:

- RentCast API errors (NOT_FOUND, RATE_LIMIT, NETWORK_ERROR)
- OpenAI Web Search limitations
- Graceful fallbacks when data is limited

See `src/docs/guides/api-error-handling.md` for detailed error documentation.

## Components

- `AddressSearch`: Address input with Google Maps autocomplete
- `PropertyAnalysisResults`: Display analysis results with error handling

## Documentation

- API Error Handling: `src/docs/guides/api-error-handling.md`
- Setup Guide: `src/docs/setup.md`

## New Features

### GenieNet (Coming Soon)

GenieNet is our real-time investor network and market intelligence platform, providing:

- Community deal flow data (anonymized)
- Interactive market heatmaps
- Regional performance analytics
- Investor networking opportunities

### UX Improvements

Recent UX enhancements include:

- **Feature Flags**: Manage feature visibility across environments
- **Animated Loading States**: Smooth transitions with Framer Motion
- **Responsive Design**: Optimized for all devices including mobile-friendly maps and charts
- **Error Handling**: User-friendly error messages with retry options

## Development

### Feature Flags

The application uses a simple feature flag system to control feature visibility:

```typescript
// Check if a feature is enabled
import { useFeatureFlags } from '@/lib/featureFlags';

function MyComponent() {
  const { enableGenieNet } = useFeatureFlags();
  
  return (
    <div>
      {enableGenieNet ? (
        <p>Feature is enabled!</p>
      ) : (
        <p>Feature coming soon</p>
      )}
    </div>
  );
}
```

### Animation Components

Several reusable components are available for loading states and animations:

- `ComingSoonFeature`: Wrapper for unreleased features
- `AnimatedChart`: Wrapper for chart components with loading states
- `ResponsiveMapContainer`: Responsive container for map components
- `ErrorState`: Standardized error handling component
- `Skeleton`: Basic skeleton loading component

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Set the following environment variables for feature flag configuration:

```
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_ENABLE_GENIE_NET=false
```

Set `NEXT_PUBLIC_ENABLE_GENIE_NET=true` to enable GenieNet features for testing.

## Setup Instructions

### Database Setup

If you see errors related to missing database tables, follow these steps:

1. Go to your Supabase project dashboard (https://app.supabase.io)
2. Navigate to the SQL Editor
3. Run the following SQL script to create missing tables:

```sql
-- Create deal_deadlines table
CREATE TABLE IF NOT EXISTS public.deal_deadlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for better performance when querying by deal
CREATE INDEX IF NOT EXISTS idx_deal_deadlines_deal_id ON public.deal_deadlines(deal_id);

-- Table for tracking deal status history
CREATE TABLE IF NOT EXISTS public.deal_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  previous_status TEXT,
  new_status TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id)
);

-- Add index for better performance when querying by deal
CREATE INDEX IF NOT EXISTS idx_deal_history_deal_id ON public.deal_history(deal_id);

-- Add RLS policies to secure these tables
ALTER TABLE public.deal_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_history ENABLE ROW LEVEL SECURITY;

-- Deadlines can be read/modified by the deal owner
CREATE POLICY "Deal owners can CRUD their deadlines"
ON public.deal_deadlines
USING (
  deal_id IN (
    SELECT id FROM public.deals WHERE user_id = auth.uid()
  )
);

-- History can be read by the deal owner, but only inserted/updated by the system
CREATE POLICY "Deal owners can read their history"
ON public.deal_history FOR SELECT
USING (
  deal_id IN (
    SELECT id FROM public.deals WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Deal owners can insert their history"
ON public.deal_history FOR INSERT
WITH CHECK (
  deal_id IN (
    SELECT id FROM public.deals WHERE user_id = auth.uid()
  )
);
```

### Cookie Parsing Issue

If you're seeing cookie parsing errors in the browser console, make sure you're:

1. Using the latest version of the Supabase client
2. Running the application on a properly configured domain/subdomain

### React Component Unmounting Issue

This has been fixed in the codebase by:
1. Using refs to track component mounting state
2. Checking if a component is still mounted before updating state

## Development

```
npm run dev
```
