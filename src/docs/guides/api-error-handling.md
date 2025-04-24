# Property Analysis API: Error Handling Guide

This document outlines the various error states that can occur when using the Property Analysis API and how to handle them in your application.

## API Response Structure

All responses from the `/api/analyze` endpoint have the following structure:

```typescript
interface AnalysisResponse {
  rentalData: {
    rent: number;
    dom?: number;
    trends?: {
      '6m'?: string;
      '12m'?: string;
    };
    error?: string;
    errorType?: 'NOT_FOUND' | 'API_ERROR' | 'RATE_LIMIT' | 'NETWORK_ERROR';
  };
  comps: string;
  analysis: string;
  cached?: boolean;
  errors?: {
    rental?: string;
    comps?: string;
    analysis?: string;
  };
}
```

## Possible Error States

### 1. RentCast API Errors

RentCast errors are categorized into the following types:

- **NOT_FOUND**: Address could not be found in the RentCast database
- **RATE_LIMIT**: RentCast API rate limit exceeded
- **NETWORK_ERROR**: Network connectivity issues when calling RentCast
- **API_ERROR**: Generic RentCast API errors

When a RentCast error occurs:
- `rentalData.error` will contain a human-readable error message
- `rentalData.errorType` will contain one of the error types listed above
- `errors.rental` will also contain the error message for easier access

### 2. Comparable Sales Errors

Comparable sales data is fetched using OpenAI's web search functionality, which may fail in various ways:

- No comparable sales found for the address
- OpenAI web search unavailable
- API rate limits exceeded

When a comps error occurs:
- `errors.comps` will contain a descriptive error message
- `comps` might contain either an error message or empty results

### 3. Analysis Generation Errors

The final analysis generation may fail if:

- OpenAI API is unavailable
- Rate limits are exceeded
- Not enough data to generate a meaningful analysis

When an analysis error occurs:
- `errors.analysis` will contain the error message
- `analysis` may be empty or contain a partial analysis

## Graceful Degradation

The API implements graceful degradation:

1. If RentCast data is unavailable but comps are available, the analysis will be generated with comps only
2. If comps are unavailable but RentCast data is available, the analysis will be generated with rental data only
3. If both are unavailable, the API will attempt to provide a best-effort analysis with limited confidence

## Frontend Error Handling Best Practices

When implementing the frontend:

1. Always check for the existence of `errors` object and display appropriate messages
2. For cached results, give users a way to refresh the analysis
3. When displaying the analysis, clearly indicate any limitations (e.g., "Analysis based on limited data")
4. For complete failures, provide clear guidance on how to try again with a different address

## API Status Codes

- **200 OK**: Request succeeded (may still have partial data failures)
- **400 Bad Request**: Missing or invalid parameters (e.g., no address)
- **401 Unauthorized**: Authentication required (if API auth is implemented)
- **500 Internal Server Error**: Server-side error during processing

## Troubleshooting

### RentCast 404 Errors

If you frequently encounter "Address not found" errors from RentCast:

1. Ensure addresses are properly formatted with street, city, state, and ZIP
2. Use address validation/autocomplete to get standardized addresses
3. Try popular or well-known addresses first to verify API functionality

### OpenAI Web Search Issues

If web search fails to find comparable properties:

1. Ensure the address is for a residential property
2. Verify the OpenAI API key has access to the web search tool
3. Check if web search is enabled for your OpenAI account

### Caching Issues

If you're getting stale data:

1. The default cache TTL is 24 hours
2. Check your cache implementation (memory cache in development, Redis/Supabase in production)
3. Add a forced refresh option to bypass cache when needed 