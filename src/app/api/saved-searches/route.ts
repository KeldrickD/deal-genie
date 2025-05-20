import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET all saved searches for the current user
export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all saved searches for this user
    const { data: searches, error } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching saved searches:', error);
      return NextResponse.json({ error: 'Failed to fetch saved searches' }, { status: 500 });
    }
    
    return NextResponse.json({ searches });
  } catch (error: any) {
    console.error('Error in saved searches API:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST to create a new saved search
export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's subscription tier and admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, is_admin')
      .eq('id', session.user.id)
      .single();
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ error: 'Failed to verify user profile' }, { status: 500 });
    }
    // If admin, skip limit check
    if (profile && profile.is_admin) {
      // Parse request body
      const searchData = await req.json();
      // Validate required fields
      if (!searchData.name || !searchData.city || !searchData.sources || searchData.sources.length === 0) {
        return NextResponse.json(
          { error: 'Missing required fields (name, city, sources)' },
          { status: 400 }
        );
      }
      // Insert the new saved search
      const { data: newSearch, error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: session.user.id,
          name: searchData.name,
          city: searchData.city,
          sources: searchData.sources,
          keywords: searchData.keywords || null,
          days_on_market: searchData.daysOnMarket || null,
          price_min: searchData.priceMin || null,
          price_max: searchData.priceMax || null,
          email_alert: searchData.emailAlert || false,
          enabled: true
        })
        .select()
        .single();
      if (error) {
        console.error('Error creating saved search:', error);
        return NextResponse.json({ error: 'Failed to create saved search' }, { status: 500 });
      }
      // Log creation
      await supabase.from('usage_logs').insert({
        user_id: session.user.id,
        feature: 'saved_search_create',
        count: 1,
        metadata: { search_id: newSearch.id }
      });
      return NextResponse.json({ search: newSearch }, { status: 201 });
    }
    
    // Get user's subscription tier
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', session.user.id)
      .single();
    
    if (userError) {
      console.error('Error fetching user subscription:', userError);
      return NextResponse.json({ error: 'Failed to verify subscription' }, { status: 500 });
    }
    
    // Check if user has reached their saved search limit
    const tierLimits = {
      'free': 2,
      'professional': 10,
      'enterprise': 50
    };
    
    const userTier = user?.subscription_tier || 'free';
    const maxSearches = tierLimits[userTier as keyof typeof tierLimits];
    
    const { count, error: countError } = await supabase
      .from('saved_searches')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id);
    
    if (countError) {
      console.error('Error counting saved searches:', countError);
      return NextResponse.json({ error: 'Failed to verify usage limits' }, { status: 500 });
    }
    
    if (count !== null && count >= maxSearches) {
      return NextResponse.json(
        { error: `You have reached your limit of ${maxSearches} saved searches for your ${userTier} plan` },
        { status: 403 }
      );
    }
    
    // Parse request body
    const searchData = await req.json();
    
    // Validate required fields
    if (!searchData.name || !searchData.city || !searchData.sources || searchData.sources.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields (name, city, sources)' },
        { status: 400 }
      );
    }
    
    // Insert the new saved search
    const { data: newSearch, error } = await supabase
      .from('saved_searches')
      .insert({
        user_id: session.user.id,
        name: searchData.name,
        city: searchData.city,
        sources: searchData.sources,
        keywords: searchData.keywords || null,
        days_on_market: searchData.daysOnMarket || null,
        price_min: searchData.priceMin || null,
        price_max: searchData.priceMax || null,
        email_alert: searchData.emailAlert || false,
        enabled: true
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating saved search:', error);
      return NextResponse.json({ error: 'Failed to create saved search' }, { status: 500 });
    }
    
    // Log creation
    await supabase.from('usage_logs').insert({
      user_id: session.user.id,
      feature: 'saved_search_create',
      count: 1,
      metadata: { search_id: newSearch.id }
    });
    
    return NextResponse.json({ search: newSearch }, { status: 201 });
  } catch (error: any) {
    console.error('Error in saved searches API:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 