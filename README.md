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
