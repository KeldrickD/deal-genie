import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

    const user_id = session.user.id;
    
    // Get the search parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Start building the query
    let query = supabase
      .from('saved_leads')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);
    
    // Add filters if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    
    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching saved leads:', error);
      return NextResponse.json(
        { error: 'Failed to fetch saved leads' },
        { status: 500 }
      );
    }

    return NextResponse.json({ leads: data || [] });
  } catch (error) {
    console.error('Error fetching saved leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 