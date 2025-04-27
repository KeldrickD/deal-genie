import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface Params {
  params: {
    id: string;
  };
}

// Get a single saved lead
export async function GET(request: Request, { params }: Params) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const leadId = params.id;
    
    const { data, error } = await supabase
      .from('saved_leads')
      .select('*')
      .eq('id', leadId)
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching lead:', error);
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ lead: data });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update a saved lead
export async function PATCH(request: Request, { params }: Params) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const leadId = params.id;
    const updates = await request.json();
    
    // Only allow updating specific fields
    const allowedFields = ['notes', 'status'];
    const filteredUpdates: Record<string, any> = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }
    
    // Check if the lead exists and belongs to the user
    const { data: existingLead, error: fetchError } = await supabase
      .from('saved_leads')
      .select('id')
      .eq('id', leadId)
      .eq('user_id', session.user.id)
      .single();
    
    if (fetchError) {
      return NextResponse.json(
        { error: 'Lead not found or access denied' },
        { status: 404 }
      );
    }
    
    // Update the lead
    const { data, error } = await supabase
      .from('saved_leads')
      .update(filteredUpdates)
      .eq('id', leadId)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead:', error);
      return NextResponse.json(
        { error: 'Failed to update lead' },
        { status: 500 }
      );
    }

    return NextResponse.json({ lead: data });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a saved lead
export async function DELETE(request: Request, { params }: Params) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const leadId = params.id;
    
    // Check if the lead exists and belongs to the user
    const { data: existingLead, error: fetchError } = await supabase
      .from('saved_leads')
      .select('id')
      .eq('id', leadId)
      .eq('user_id', session.user.id)
      .single();
    
    if (fetchError) {
      return NextResponse.json(
        { error: 'Lead not found or access denied' },
        { status: 404 }
      );
    }
    
    // Delete the lead
    const { error } = await supabase
      .from('saved_leads')
      .delete()
      .eq('id', leadId)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting lead:', error);
      return NextResponse.json(
        { error: 'Failed to delete lead' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 