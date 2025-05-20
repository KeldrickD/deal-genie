import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getServerSession } from '@/lib/session';

// GET /api/admin/genie2-access - Check if the current user has access to Genie 2.0
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get user session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Check if user has Genie 2.0 access
    const { data, error } = await supabase
      .rpc('has_genie2_access', { p_user_id: userId });
    
    if (error) {
      console.error('Error checking Genie 2.0 access:', error);
      return NextResponse.json({ error: 'Failed to check access' }, { status: 500 });
    }
    
    return NextResponse.json({
      hasAccess: !!data,
      userId
    });
  } catch (error) {
    console.error('Error in Genie 2.0 access API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/admin/genie2-access - Grant access to Genie 2.0 for a user (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get user session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const adminId = session.user.id;
    
    // Verify the user is an admin
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', adminId)
      .single();
    
    if (adminError || !adminData || !adminData.is_admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }
    
    // Get user ID to grant access to from request body
    const { userId, grantAdmin = false } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Update the user's profile to grant Genie 2.0 access
    const updateData: { genie2_access: boolean; is_admin?: boolean } = { 
      genie2_access: true 
    };
    
    // If also granting admin access
    if (grantAdmin) {
      updateData.is_admin = true;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select('id, genie2_access, is_admin')
      .single();
    
    if (error) {
      console.error('Error granting Genie 2.0 access:', error);
      return NextResponse.json({ error: 'Failed to grant access' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      user: data
    });
  } catch (error) {
    console.error('Error in Genie 2.0 access API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/admin/genie2-access - Revoke Genie 2.0 access for a user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get user session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const adminId = session.user.id;
    
    // Verify the user is an admin
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', adminId)
      .single();
    
    if (adminError || !adminData || !adminData.is_admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }
    
    // Get user ID to revoke access from URL
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const revokeAdmin = url.searchParams.get('revokeAdmin') === 'true';
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Update the user's profile to revoke Genie 2.0 access
    const updateData: { genie2_access: boolean; is_admin?: boolean } = { 
      genie2_access: false 
    };
    
    // If also revoking admin access
    if (revokeAdmin) {
      updateData.is_admin = false;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select('id, genie2_access, is_admin')
      .single();
    
    if (error) {
      console.error('Error revoking Genie 2.0 access:', error);
      return NextResponse.json({ error: 'Failed to revoke access' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      user: data
    });
  } catch (error) {
    console.error('Error in Genie 2.0 access API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 