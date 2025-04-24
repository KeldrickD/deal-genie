import fetch from 'node-fetch';

const API_KEY = process.env.RENTCAST_API_KEY;

interface RentalEstimate {
  rent: number;
  dom?: number; // days on market
  trends?: {
    '6m'?: string;
    '12m'?: string;
  };
  error?: string;
  errorType?: 'NOT_FOUND' | 'API_ERROR' | 'RATE_LIMIT' | 'NETWORK_ERROR';
}

/**
 * Retry a function with exponential backoff
 */
async function retry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delay = 500,
  backoff = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * backoff, backoff);
  }
}

export default {
  async getRentalEstimate(address: string): Promise<RentalEstimate> {
    try {
      if (!API_KEY) {
        throw new Error('RENTCAST_API_KEY is not defined in environment variables');
      }
      
      const url = `https://api.rentcast.io/v1/estimate?address=${encodeURIComponent(address)}`;
      
      const response = await retry(() => 
        fetch(url, {
          headers: { Authorization: `Bearer ${API_KEY}` },
        })
      );
      
      // Handle specific status codes
      if (response.status === 404) {
        return {
          rent: 0,
          error: "No rental data available for this address",
          errorType: "NOT_FOUND"
        };
      } else if (response.status === 429) {
        return {
          rent: 0,
          error: "Rate limit exceeded. Please try again later.",
          errorType: "RATE_LIMIT"
        };
      } else if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`RentCast API error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return {
        rent: data.rent || 0,
        dom: data.dom || 0,
        trends: {
          '6m': data.trends?.['6m'] || '0%',
          '12m': data.trends?.['12m'] || '0%',
        }
      };
    } catch (error: any) {
      console.error('RentCast API Error:', error.message);
      // Determine if it's a network error
      const isNetworkError = error.message.includes('ECONNREFUSED') || 
                            error.message.includes('ETIMEDOUT') ||
                            error.message.includes('ENOTFOUND');
      
      return {
        rent: 0,
        error: error.message,
        errorType: isNetworkError ? 'NETWORK_ERROR' : 'API_ERROR'
      };
    }
  }
}; 