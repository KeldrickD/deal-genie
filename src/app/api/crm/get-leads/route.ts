import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type StatusCount = {
  status: string;
  count: string;
};

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    
    // Get filters from query parameters
    const status = searchParams.get('status');
    const city = searchParams.get('city');
    const propertyType = searchParams.get('property_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') === 'asc' ? 'asc' : 'desc';
    
    // Build the query
    let query = supabase
      .from('crm_leads')
      .select('*')
      .eq('user_id', userId);
    
    // Apply filters if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    
    if (propertyType) {
      query = query.eq('property_type', propertyType);
    }
    
    // Apply sorting and pagination
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);
    
    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching CRM leads:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    // Get status counts using a separate query for each status
    const statuses = ['new', 'contacted', 'offer_made', 'closed', 'dead'];
    const statusCounts: Record<string, number> = {};
    
    // Fetch count for each status
    await Promise.all(statuses.map(async (statusValue) => {
      const { count, error } = await supabase
        .from('crm_leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', statusValue);
      
      if (!error && count !== null) {
        statusCounts[statusValue] = count;
      }
    }));

    // Get total count
    const { count: totalCount } = await supabase
      .from('crm_leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    statusCounts.total = totalCount || 0;

    return NextResponse.json({ 
      leads: data || [],
      statusCounts: statusCounts
    });
  } catch (error) {
    console.error('Error fetching CRM leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 