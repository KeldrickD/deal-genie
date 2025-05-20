import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

// Types for tracking data
type TrackingEvent = 'view' | 'save' | 'offer' | 'feedback' | 'analysis';

interface TrackingRequest {
  propertyId: string;
  eventType: TrackingEvent;
  metadata?: Record<string, any>;
}

// XP rewards for different actions
const XP_REWARDS = {
  view: 1,       // Viewing a property
  save: 5,       // Saving a property to list
  offer: 25,     // Making an offer
  feedback: 3,   // Giving feedback on a property
  analysis: 10,  // Running an analysis
};

export async function POST(request: Request) {
  try {
    // Parse request body
    const body: TrackingRequest = await request.json();
    const { propertyId, eventType, metadata = {} } = body;
    
    if (!propertyId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: propertyId or eventType' },
        { status: 400 }
      );
    }
    
    // Validate event type
    if (!Object.keys(XP_REWARDS).includes(eventType)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }
    
    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Record tracking event with XP
    const { data, error } = await supabase
      .from('user_activity')
      .insert({
        user_id: user.id,
        property_id: propertyId,
        activity_type: eventType,
        xp_earned: XP_REWARDS[eventType],
        details: metadata
      })
      .select('id');
    
    if (error) {
      console.error('Error recording activity:', error);
      return NextResponse.json(
        { error: 'Failed to record activity' },
        { status: 500 }
      );
    }
    
    // Get user's current stats after XP update
    const { data: userData, error: statsError } = await supabase
      .rpc('get_user_level_info', { p_user_id: user.id });
      
    if (statsError) {
      console.error('Error fetching user stats:', statsError);
    }
    
    // Calculate conversion metrics
    const { data: conversionData, error: conversionError } = await supabase
      .rpc('get_user_conversion_metrics', { p_user_id: user.id });
    
    if (conversionError) {
      console.error('Error fetching conversion metrics:', conversionError);
    }
    
    return NextResponse.json({
      success: true,
      activityId: data?.[0]?.id,
      xpEarned: XP_REWARDS[eventType],
      userStats: userData || null,
      conversionMetrics: conversionData || null,
    });
  } catch (error) {
    console.error('Unexpected error in tracking API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get conversion stats 
export async function GET(request: Request) {
  const url = new URL(request.url);
  const timeRange = url.searchParams.get('timeRange') || '30d'; // Default 30 days
  
  // Initialize Supabase client
  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Get time period for stats
  let interval: string;
  switch (timeRange) {
    case '7d':
      interval = '7 days';
      break;
    case '90d':
      interval = '90 days';
      break;
    case 'all':
      interval = '10 years'; // Effectively all time
      break;
    case '30d':
    default:
      interval = '30 days';
  }
  
  try {
    // Get detailed conversion metrics
    const { data: conversionData, error: conversionError } = await supabase
      .rpc('get_conversion_stats', { 
        p_user_id: user.id,
        p_interval: interval
      });
    
    if (conversionError) {
      console.error('Error fetching conversion stats:', conversionError);
      return NextResponse.json(
        { error: 'Failed to fetch conversion stats' },
        { status: 500 }
      );
    }
    
    // Get trending properties (most viewed & saved)
    const { data: trendingData, error: trendingError } = await supabase
      .rpc('get_trending_properties', { limit_count: 5 });
    
    if (trendingError) {
      console.error('Error fetching trending properties:', trendingError);
    }
    
    return NextResponse.json({
      timeRange,
      conversionStats: conversionData || null,
      trendingProperties: trendingData || [],
    });
  } catch (error) {
    console.error('Unexpected error in conversion stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 