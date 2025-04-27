import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
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
    const { leadId, status, lead_notes } = await request.json();
    
    // Validate required fields
    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Only allow valid statuses if provided
    if (status) {
      const validStatuses = ['new', 'contacted', 'offer_made', 'closed', 'dead'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
    }

    // Build the update object
    const updates: Record<string, any> = {};
    if (status) updates.status = status;
    if (typeof lead_notes === 'string') updates.lead_notes = lead_notes;
    
    // Only proceed if there are fields to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update the lead
    const { data, error } = await supabase
      .from('crm_leads')
      .update(updates)
      .eq('id', leadId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating CRM lead:', error);
      return NextResponse.json(
        { error: 'Failed to update lead' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Lead not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      lead: data 
    });
  } catch (error) {
    console.error('Error updating CRM lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 