import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for validating waitlist submission
const waitlistSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().optional(),
});

export type WaitlistSubmission = z.infer<typeof waitlistSchema>;

// POST /api/genienet/waitlist
export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  try {
    // Parse and validate input
    const body = await request.json();
    const validationResult = waitlistSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid submission data', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { email, name } = validationResult.data;
    
    // Check if this email already exists in the waitlist
    const { data: existingEntry } = await supabase
      .from('genienet_waitlist')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (existingEntry) {
      return NextResponse.json(
        { message: 'You are already on the waitlist', alreadyJoined: true },
        { status: 200 }
      );
    }
    
    // Insert the waitlist entry
    const { data: newEntry, error: insertError } = await supabase
      .from('genienet_waitlist')
      .insert({
        email,
        name,
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error adding to waitlist:', insertError);
      if (insertError.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { message: 'You are already on the waitlist', alreadyJoined: true },
          { status: 200 }
        );
      }
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully joined the GenieNet waitlist!' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error processing waitlist submission:', error);
    return NextResponse.json({ error: 'Failed to process waitlist submission' }, { status: 500 });
  }
} 