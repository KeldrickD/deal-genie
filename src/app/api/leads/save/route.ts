import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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
    
    const lead = await request.json();
    
    // Validate required fields
    if (!lead.address || !lead.city || !lead.price || lead.source === undefined) {
      return NextResponse.json(
        { error: 'Missing required lead information' },
        { status: 400 }
      );
    }

    // Insert the lead into the saved_leads table
    const { data, error } = await supabase
      .from('saved_leads')
      .insert({
        user_id,
        address: lead.address,
        city: lead.city,
        price: lead.price,
        days_on_market: lead.days_on_market || null,
        description: lead.description || null,
        source: lead.source,
        keywords_matched: lead.keywords_matched || [],
        listing_url: lead.listing_url || null,
        notes: lead.notes || null,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving lead:', error);
      return NextResponse.json(
        { error: 'Failed to save lead' },
        { status: 500 }
      );
    }

    return NextResponse.json({ lead: data });
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 