import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSession } from '@/lib/auth';
import type { Database } from '@/types/supabase';

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
    
    // Create Supabase client using SSR approach
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            try {
              cookieStore.set(name, value, options);
            } catch (error) {
              console.error('Failed to set cookie:', error);
            }
          },
          remove(name, options) {
            try {
              cookieStore.set(name, '', { ...options, maxAge: 0 });
            } catch (error) {
              console.error('Failed to remove cookie:', error);
            }
          },
        },
      }
    );
    
    // In a real implementation, fetch from database or external API
    // For now, use mock data and filter by zip codes if provided
    let filteredMarkets = [...MOCK_MARKET_DATA];
    let filteredProperties = [...MOCK_PROPERTIES];
    
    if (zipCodes.length > 0) {
      filteredMarkets = filteredMarkets.filter(market => 
        zipCodes.includes(market.zipCode)
      );
      
      filteredProperties = filteredProperties.filter(property => 
        zipCodes.includes(property.zipCode)
      );
    }
    
    // Fetch user preferences to apply personalized filtering
    const { data: profileData } = await supabase
      .from('profiles')
      .select('smart_scout_prefs')
      .eq('id', session.user.id)
      .single();
      
    const userPrefs = profileData?.smart_scout_prefs;
    
    // Apply user preferences if available
    if (userPrefs) {
      // Filter properties based on user preferences
      if (userPrefs.minDealScore) {
        filteredProperties = filteredProperties.filter(
          property => property.dealScore >= userPrefs.minDealScore
        );
      }
      
      if (userPrefs.minROI) {
        filteredProperties = filteredProperties.filter(
          property => property.potentialROI >= userPrefs.minROI
        );
      }
      
      if (userPrefs.maxDaysOnMarket) {
        filteredProperties = filteredProperties.filter(
          property => property.daysOnMarket <= userPrefs.maxDaysOnMarket
        );
      }
      
      if (userPrefs.minPriceDrop) {
        filteredProperties = filteredProperties.filter(
          property => property.priceDropPercent >= userPrefs.minPriceDrop
        );
      }
    }

    return NextResponse.json({ 
      markets: filteredMarkets,
      properties: filteredProperties,
      preferences: userPrefs || null
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
    
    // Create Supabase client using SSR approach
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            try {
              cookieStore.set(name, value, options);
            } catch (error) {
              console.error('Failed to set cookie:', error);
            }
          },
          remove(name, options) {
            try {
              cookieStore.set(name, '', { ...options, maxAge: 0 });
            } catch (error) {
              console.error('Failed to remove cookie:', error);
            }
          },
        },
      }
    );
    
    // Save user preferences
    const { error } = await supabase
      .from('profiles')
      .update({
        smart_scout_prefs: preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id);
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Smart Scout preferences saved successfully'
    });
  } catch (error: any) {
    console.error('Error saving Smart Scout preferences:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 