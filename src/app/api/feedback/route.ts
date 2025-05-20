import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getServerSession } from '@/lib/session';
import { z } from 'zod';

// Validation schema for feedback submission
const feedbackSchema = z.object({
  propertyId: z.string(),
  feedback: z.enum(['up', 'down']),
  context: z.string().optional(),
});

// POST /api/feedback - Save user feedback
export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  // Get user session
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = feedbackSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid feedback data' }, { status: 400 });
    }
    
    const { propertyId, feedback, context } = validation.data;
    
    // Save feedback to database
    const { data, error } = await supabase
      .from('property_feedback')
      .insert({
        user_id: session.user.id,
        property_id: propertyId,
        feedback_type: feedback,
        context: context || null,
        created_at: new Date().toISOString(),
      })
      .select('id');
    
    if (error) {
      console.error('Error saving feedback:', error);
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      feedbackId: data[0].id 
    });
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// GET /api/feedback/top-rated - Get top-rated properties
export async function GET(request: NextRequest) {
  const supabase = createClient();
  
  // Get user session
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5');
    
    // Get top-rated properties (most upvotes)
    const { data, error } = await supabase
      .rpc('get_top_rated_properties', { limit_count: limit })
      .select();
    
    if (error) {
      console.error('Error getting top-rated properties:', error);
      return NextResponse.json({ error: 'Failed to get top-rated properties' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      properties: data 
    });
  } catch (error) {
    console.error('Error getting top-rated properties:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 