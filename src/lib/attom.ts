import fetch from 'node-fetch';

const API_KEY = process.env.ATTOM_API_KEY as string;

if (!API_KEY) {
  throw new Error('ATTOM_API_KEY is not defined in environment variables');
}

/**
 * Generic Attom API fetcher
 * @param endpoint - The Attom API endpoint (e.g. '/property/detail')
 * @param params - Query parameters as an object
 */
export async function attomApiFetch(endpoint: string, params: Record<string, string | number>) {
  const baseUrl = 'https://api.attomdata.com/propertyapi/v1.0.0';
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const url = `${baseUrl}${endpoint}?${query}`;

  const response = await fetch(url, {
    headers: { 'apikey': API_KEY }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Attom API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Fetch property details by address, including zoning, ownership, and equity calculation
 * @param address - Full address string
 */
export async function getPropertyDetails(address: string) {
  const detail = await attomApiFetch('/property/detail', { address });
  let zoning = null;
  let ownership = null;
  let lastMortgageAmount = null;
  let estimatedValue = null;
  let equity = null;

  // Extract extra fields if present
  const property = detail?.property || detail;
  if (property) {
    zoning = property.zoning || property.zoningcode || null;
    ownership = property.ownername || property.ownership || null;
    estimatedValue = property.estimatedValue || property.avmValue || property.marketValue || null;
    lastMortgageAmount = property.lastMortgageAmount || property.mortgageAmount || null;
    if (estimatedValue && lastMortgageAmount) {
      equity = Number(estimatedValue) - Number(lastMortgageAmount);
    }
  }

  return {
    ...detail,
    property: {
      ...property,
      zoning,
      ownership,
      equity,
    },
  };
}

/**
 * Fetch property sales and mortgage history for timeline
 * @param address - Full address string
 */
export async function getPropertyHistory(address: string) {
  // Sales history
  const sales = await attomApiFetch('/saleshistory/detail', { address });
  // Mortgage history
  const mortgage = await attomApiFetch('/mortgagehistory/detail', { address });
  return { sales, mortgage };
} 