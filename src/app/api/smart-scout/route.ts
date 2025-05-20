import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSession } from '@/lib/auth';
import type { Database } from '@/types/supabase';
import { getPropertyDetails } from '@/lib/attom';

// Mock market data for development
const MOCK_MARKET_DATA = [
  {
    id: '1',
    zipCode: '32789',
    city: 'Winter Park',
    state: 'FL',
    medianPrice: 485000,
    priceChange: 5.2,
    avgDOM: 22,
    dealCount: 15,
    roiPotential: 18.5,
    hotScore: 89,
    trend: 'up',
  },
  {
    id: '2',
    zipCode: '32801',
    city: 'Orlando',
    state: 'FL',
    medianPrice: 420000,
    priceChange: 3.8,
    avgDOM: 28,
    dealCount: 23,
    roiPotential: 16.2,
    hotScore: 76,
    trend: 'up',
  },
  {
    id: '3',
    zipCode: '32806',
    city: 'Orlando',
    state: 'FL',
    medianPrice: 395000,
    priceChange: -1.2,
    avgDOM: 35,
    dealCount: 18,
    roiPotential: 21.3,
    hotScore: 82,
    trend: 'down',
  },
  {
    id: '4',
    zipCode: '32803',
    city: 'Orlando',
    state: 'FL',
    medianPrice: 510000,
    priceChange: 2.5,
    avgDOM: 19,
    dealCount: 11,
    roiPotential: 14.7,
    hotScore: 72,
    trend: 'up',
  },
  {
    id: '5',
    zipCode: '32819',
    city: 'Orlando',
    state: 'FL',
    medianPrice: 625000,
    priceChange: 4.8,
    avgDOM: 31,
    dealCount: 9,
    roiPotential: 12.9,
    hotScore: 65,
    trend: 'up',
  },
];

// Mock property data for development
const MOCK_PROPERTIES = [
  {
    id: '101',
    address: '1234 Park Ave',
    zipCode: '32789',
    city: 'Winter Park',
    state: 'FL',
    price: 375000,
    originalPrice: 399000,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1850,
    yearBuilt: 1998,
    daysOnMarket: 15,
    pricePerSqFt: 203,
    priceDropPercent: 6.0,
    estimatedARV: 465000,
    estimatedRepair: 35000,
    potentialROI: 22.8,
    dealScore: 87,
    imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
  },
  {
    id: '102',
    address: '567 Lake Dr',
    zipCode: '32789',
    city: 'Winter Park',
    state: 'FL',
    price: 412000,
    originalPrice: 425000,
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2100,
    yearBuilt: 2002,
    daysOnMarket: 22,
    pricePerSqFt: 196,
    priceDropPercent: 3.1,
    estimatedARV: 510000,
    estimatedRepair: 45000,
    potentialROI: 17.2,
    dealScore: 79,
    imageUrl: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6',
  },
  {
    id: '103',
    address: '890 Central Blvd',
    zipCode: '32801',
    city: 'Orlando',
    state: 'FL',
    price: 299000,
    originalPrice: 329000,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1450,
    yearBuilt: 1985,
    daysOnMarket: 38,
    pricePerSqFt: 206,
    priceDropPercent: 9.1,
    estimatedARV: 389000,
    estimatedRepair: 42000,
    potentialROI: 24.1,
    dealScore: 91,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
  },
  {
    id: '104',
    address: '123 Highland St',
    zipCode: '32806',
    city: 'Orlando',
    state: 'FL',
    price: 352000,
    originalPrice: 375000,
    bedrooms: 3,
    bathrooms: 2.5,
    squareFeet: 1780,
    yearBuilt: 1992,
    daysOnMarket: 27,
    pricePerSqFt: 198,
    priceDropPercent: 6.1,
    estimatedARV: 445000,
    estimatedRepair: 38000,
    potentialROI: 20.5,
    dealScore: 85,
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
  },
];

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const zipCodes = searchParams.get('zipCodes')?.split(',') || [];

    // Fetch properties from Attom API for each zip code
    let attomProperties: any[] = [];
    if (zipCodes.length > 0) {
      for (const zip of zipCodes) {
        try {
          const attomResult = await getPropertyDetails(zip);
          if (attomResult?.property) {
            attomProperties.push(attomResult.property);
          } else if (Array.isArray(attomResult?.properties)) {
            attomProperties.push(...attomResult.properties);
          }
        } catch (err) {
          console.error('Attom API error for zip', zip, err);
        }
      }
    } else {
      try {
        const attomResult = await getPropertyDetails('32789');
        if (attomResult?.property) {
          attomProperties.push(attomResult.property);
        } else if (Array.isArray(attomResult?.properties)) {
          attomProperties.push(...attomResult.properties);
        }
      } catch (err) {
        console.error('Attom API error for default zip', err);
      }
    }

    // Skipping user preferences filtering for now (no Supabase)
    // If you want to add user preferences, fetch from another API or pass in request

    return NextResponse.json({ 
      markets: MOCK_MARKET_DATA, // Optionally update with Attom market data
      properties: attomProperties,
      preferences: null
    });
  } catch (error: any) {
    console.error('Error in Smart Scout API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Get the request body (updated preferences)
    const body = await request.json();
    const { preferences } = body;
    
    if (!preferences) {
      return NextResponse.json({ error: 'Preferences data is required' }, { status: 400 });
    }
    // Skipping Supabase and cookie logic
    // In a real implementation, save preferences to a database or user profile
    return NextResponse.json({ 
      success: true,
      message: 'Smart Scout preferences saved successfully (not persisted in this demo)'
    });
  } catch (error: any) {
    console.error('Error saving Smart Scout preferences:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 