# Property Analysis API Integration

This directory contains utility libraries for integrating external APIs for property analysis:

## RentCast Integration

The RentCast API provides rental estimates for properties based on address. The integration is implemented in `rentcast.ts`.

### Setup Requirements

1. Sign up for a RentCast API key at [https://rentcast.io/](https://rentcast.io/)
2. Add your API key to your environment variables:
   ```
   RENTCAST_API_KEY=your_rentcast_api_key_here
   ```

### Usage

```typescript
import rentcast from '@/lib/rentcast';

// Get rental estimate for an address
const rentalData = await rentcast.getRentalEstimate('123 Main St, Anytown, USA');
```

## OpenAI GPT-4o Integration

The OpenAI integration uses GPT-4o with web-search capabilities to find comparable property sales and generate real estate analysis.

### Setup Requirements

1. Sign up for an OpenAI API key at [https://platform.openai.com/](https://platform.openai.com/)
2. Add your API key to your environment variables:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### API Route Implementation

The property analysis API route (`/api/analyze`) combines both RentCast data and OpenAI GPT-4o with web-search to provide:

1. Rental estimates from RentCast
2. Recent comparable sales from web search
3. Comprehensive property analysis including:
   - ARV (After Repair Value)
   - Repair cost estimates
   - MAO (Maximum Allowable Offer)
   - Cash-on-cash ROI projections
   - Investment recommendation (Go/No-Go)

### Error Handling

The implementation includes fallback mechanisms if the web-search tool is unavailable, ensuring the API can still provide analysis based on available rental data. 