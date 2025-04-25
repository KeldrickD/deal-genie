import { NextRequest, NextResponse } from 'next/server';
import { enforceUsageLimit } from '@/lib/usageLimit';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { feature, metadata = {} } = body;

    if (!feature) {
      return NextResponse.json(
        { success: false, message: 'Feature parameter is required' },
        { status: 400 }
      );
    }

    // Get the current user from the session
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Enforce the usage limit
    const result = await enforceUsageLimit(
      session.user.id, 
      feature,
      metadata
    );

    return NextResponse.json({
      success: result.success,
      message: result.message,
      currentUsage: result.currentUsage,
      limit: result.limit
    }, { status: result.statusCode });
  } catch (error) {
    console.error('Error enforcing usage limit:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to enforce usage limit' },
      { status: 500 }
    );
  }
} 