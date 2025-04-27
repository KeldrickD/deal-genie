import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { searchLeads } from '@/lib/lead-hunter/searchLeads';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET a specific saved search and its leads
export async function GET(req: NextRequest, { params }: RouteParams) {
  const supabase = createRouteHandlerClient({ cookies });
  const searchId = params.id;
  
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the saved search
    const { data: search, error } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('id', searchId)
      .eq('user_id', session.user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Saved search not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch saved search' }, { status: 500 });
    }
    
    // If the query parameter 'include_leads' is not set to 'true', just return the search
    const includeLeads = req.nextUrl.searchParams.get('include_leads') === 'true';
    
    if (!includeLeads) {
      return NextResponse.json({ search });
    }
    
    // Get leads for this saved search
    const searchParams = {
      city: search.city,
      sources: search.sources,
      keywords: search.keywords || undefined,
      daysOnMarket: search.days_on_market || undefined,
      priceMin: search.price_min || undefined,
      priceMax: search.price_max || undefined,
    };
    
    const leads = await searchLeads(searchParams);
    
    // Log usage
    await supabase.from('usage_logs').insert({
      user_id: session.user.id,
      feature: 'saved_search_view',
      count: 1,
      metadata: { search_id: searchId, lead_count: leads.length }
    });
    
    return NextResponse.json({ search, leads });
  } catch (error: any) {
    console.error('Error in saved search API:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PATCH to update a saved search
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const supabase = createRouteHandlerClient({ cookies });
  const searchId = params.id;
  
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const updates = await req.json();
    
    // Verify ownership
    const { data: existingSearch, error: fetchError } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('id', searchId)
      .eq('user_id', session.user.id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Saved search not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch saved search' }, { status: 500 });
    }
    
    // Update saved search
    const { data: updatedSearch, error } = await supabase
      .from('saved_searches')
      .update({
        name: updates.name !== undefined ? updates.name : existingSearch.name,
        city: updates.city !== undefined ? updates.city : existingSearch.city,
        sources: updates.sources !== undefined ? updates.sources : existingSearch.sources,
        keywords: updates.keywords !== undefined ? updates.keywords : existingSearch.keywords,
        days_on_market: updates.daysOnMarket !== undefined ? updates.daysOnMarket : existingSearch.days_on_market,
        price_min: updates.priceMin !== undefined ? updates.priceMin : existingSearch.price_min,
        price_max: updates.priceMax !== undefined ? updates.priceMax : existingSearch.price_max,
        email_alert: updates.emailAlert !== undefined ? updates.emailAlert : existingSearch.email_alert,
        enabled: updates.enabled !== undefined ? updates.enabled : existingSearch.enabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', searchId)
      .eq('user_id', session.user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating saved search:', error);
      return NextResponse.json({ error: 'Failed to update saved search' }, { status: 500 });
    }
    
    return NextResponse.json({ search: updatedSearch });
  } catch (error: any) {
    console.error('Error in saved search API:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE a saved search
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const supabase = createRouteHandlerClient({ cookies });
  const searchId = params.id;
  
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify ownership before deletion
    const { data: existingSearch, error: fetchError } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('id', searchId)
      .eq('user_id', session.user.id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Saved search not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch saved search' }, { status: 500 });
    }
    
    // Delete the saved search
    const { error } = await supabase
      .from('saved_searches')
      .delete()
      .eq('id', searchId)
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error('Error deleting saved search:', error);
      return NextResponse.json({ error: 'Failed to delete saved search' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Saved search deleted successfully' });
  } catch (error: any) {
    console.error('Error in saved search API:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 