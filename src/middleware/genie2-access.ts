import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';

/**
 * Middleware to check if a user has access to Genie 2.0 features
 * This can be used to protect routes and API endpoints
 */
export async function checkGenie2Access(
  req: NextRequest,
  options?: { redirectToPath?: string; apiResponse?: boolean }
) {
  const supabase = createClient();
  
  // Get user session
  const session = await getServerSession();
  if (!session || !session.user) {
    if (options?.apiResponse) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    } else {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  
  const userId = session.user.id;
  
  try {
    // Check if user has Genie 2.0 access using the database function
    // If the function doesn't exist yet, fall back to checking profile directly
    try {
      const { data: hasAccess, error } = await supabase
        .rpc('has_genie2_access', { p_user_id: userId });
      
      if (!error && hasAccess) {
        return null; // Allow access
      }
    } catch (e) {
      console.warn('has_genie2_access function not available, falling back to direct check');
    }
    
    // Direct check if the RPC function doesn't exist
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, genie2_access')
      .eq('id', userId)
      .single();
    
    // Check Pro subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('plan_id, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    const hasPro = subscription && ['pro', 'Pro', 'team', 'Team'].includes(subscription.plan_id);
    
    if (
      (profile && (profile.is_admin || profile.genie2_access)) || 
      hasPro
    ) {
      return null; // Allow access
    }
    
    // User doesn't have access
    if (options?.apiResponse) {
      return NextResponse.json({ 
        error: 'Access denied: Genie 2.0 is only available to Pro users and authorized accounts'
      }, { status: 403 });
    } else {
      const redirectTo = options?.redirectToPath || '/upgrade';
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }
  } catch (error) {
    console.error('Error checking Genie 2.0 access:', error);
    
    if (options?.apiResponse) {
      return NextResponse.json({ error: 'Failed to verify access' }, { status: 500 });
    } else {
      return NextResponse.redirect(new URL('/upgrade', req.url));
    }
  }
} 