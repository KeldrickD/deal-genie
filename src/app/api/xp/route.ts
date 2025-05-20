import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getServerSession } from '@/lib/session';

// GET /api/xp - Get user's XP data
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get user session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get user's XP data
    const { data, error } = await supabase
      .rpc('get_user_level_info', { p_user_id: userId });
    
    if (error) {
      console.error('Error fetching user XP data:', error);
      return NextResponse.json({ error: 'Failed to fetch XP data' }, { status: 500 });
    }
    
    // Get recent activity
    const { data: activityData, error: activityError } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (activityError) {
      console.error('Error fetching activity data:', activityError);
    }
    
    return NextResponse.json({
      success: true,
      xp_data: data,
      recent_activity: activityData || []
    });
  } catch (error) {
    console.error('Error in XP API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/xp - Record user activity and award XP
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get user session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get activity data from request body
    const { activity_type, xp_earned, property_id, details } = await request.json();
    
    // Validate required fields
    if (!activity_type || typeof xp_earned !== 'number') {
      return NextResponse.json({ 
        error: 'Missing required fields: activity_type and xp_earned are required' 
      }, { status: 400 });
    }
    
    // Insert activity
    const { data, error } = await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        activity_type,
        xp_earned,
        property_id,
        details
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error recording activity:', error);
      return NextResponse.json({ error: 'Failed to record activity' }, { status: 500 });
    }
    
    // Get updated XP data
    const { data: xpData, error: xpError } = await supabase
      .rpc('get_user_level_info', { p_user_id: userId });
    
    if (xpError) {
      console.error('Error fetching updated XP data:', xpError);
    }
    
    return NextResponse.json({
      success: true,
      activity: data,
      xp_data: xpData || null
    });
  } catch (error) {
    console.error('Error in XP API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 