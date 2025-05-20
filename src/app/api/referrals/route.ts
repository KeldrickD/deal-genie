import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getServerSession } from '@/lib/session';

// GET /api/referrals - Get user's referrals data
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get user session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get user's referral code
    const { data: referralData, error: referralError } = await supabase
      .from('user_referrals')
      .select('*')
      .eq('referrer_id', userId)
      .single();
    
    // If no referral code exists, create one
    if (referralError || !referralData) {
      // Create a unique referral code - base it on user email and a random string
      try {
        // Generate a unique referral code based on email and random chars
        const userEmail = session.user.email;
        const prefix = userEmail ? userEmail.split('@')[0].substring(0, 5).toLowerCase() : '';
        const randomPart = Math.random().toString(36).substring(2, 7);
        const newReferralCode = `${prefix}-${randomPart}`;
        
        // Insert the new referral
        const { data: insertedReferral, error: insertError } = await supabase
          .from('user_referrals')
          .insert({
            referrer_id: userId,
            referral_code: newReferralCode,
            referral_url: `${request.nextUrl.origin}/signup?ref=${newReferralCode}`
          })
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating referral entry:', insertError);
          return NextResponse.json({ error: 'Failed to create referral entry' }, { status: 500 });
        }
        
        const referralStats = await getReferralStats(supabase, userId);
        
        return NextResponse.json({
          success: true,
          referral: insertedReferral,
          stats: referralStats
        });
      } catch (error) {
        console.error('Error in referral code creation:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
      }
    }
    
    // Get referral stats
    const referralStats = await getReferralStats(supabase, userId);
    
    // Get referral signups
    const { data: signups, error: signupsError } = await supabase
      .from('referral_signups')
      .select(`
        id,
        referral_id,
        referred_user_id,
        status,
        reward_given,
        reward_details,
        created_at,
        completed_at,
        users:referred_user_id (email)
      `)
      .eq('referral_id', referralData.id)
      .order('created_at', { ascending: false });
      
    if (signupsError) {
      console.error('Error fetching referral signups:', signupsError);
    }
    
    return NextResponse.json({
      success: true,
      referral: referralData,
      stats: referralStats,
      signups: signups || []
    });
  } catch (error) {
    console.error('Error in referrals API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/referrals - Apply a referral code to a user
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get user session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get referral code from request body
    const { referral_code } = await request.json();
    
    if (!referral_code) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }
    
    // Look up the referral
    const { data: referralData, error: referralError } = await supabase
      .from('user_referrals')
      .select('*')
      .eq('referral_code', referral_code)
      .single();
      
    if (referralError || !referralData) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
    }
    
    // Prevent self-referrals
    if (referralData.referrer_id === userId) {
      return NextResponse.json({ error: 'You cannot refer yourself' }, { status: 400 });
    }
    
    // Check if this user already has a referrer
    const { data: existingReferral, error: existingError } = await supabase
      .from('referral_signups')
      .select('*')
      .eq('referred_user_id', userId)
      .single();
      
    if (existingReferral) {
      return NextResponse.json({ error: 'You already have a referrer' }, { status: 400 });
    }
    
    // Create the referral signup
    const { data: signup, error: signupError } = await supabase
      .from('referral_signups')
      .insert({
        referral_id: referralData.id,
        referred_user_id: userId,
        status: 'pending'
      })
      .select()
      .single();
      
    if (signupError) {
      console.error('Error creating referral signup:', signupError);
      return NextResponse.json({ error: 'Failed to create referral signup' }, { status: 500 });
    }
    
    // Store the referrer code in the user's metadata instead of directly updating auth.users
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        referrer_code: referral_code
      }
    });
    
    if (updateError) {
      console.error('Error updating user with referrer code:', updateError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Referral applied successfully',
      signup
    });
  } catch (error) {
    console.error('Error in referrals API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Helper function to get referral stats
async function getReferralStats(supabase: any, userId: string) {
  try {
    const [totalQuery, pendingQuery, completedQuery, xpQuery] = await Promise.all([
      // Get total referrals count
      supabase
        .from('referral_signups')
        .select('id', { count: 'exact', head: true })
        .eq('referrer_id', userId),
        
      // Get pending referrals count
      supabase
        .from('referral_signups')
        .select('id', { count: 'exact', head: true })
        .eq('referrer_id', userId)
        .eq('status', 'pending'),
        
      // Get completed referrals count
      supabase
        .from('referral_signups')
        .select('id', { count: 'exact', head: true })
        .eq('referrer_id', userId)
        .in('status', ['complete', 'rewarded']),
        
      // Get XP earned from referrals
      supabase
        .from('user_activity')
        .select('xp_earned')
        .eq('user_id', userId)
        .eq('activity_type', 'referral_signup')
    ]);
    
    // Calculate total XP earned from referrals
    const xpEarned = (xpQuery.data || []).reduce((total: number, activity: any) => {
      return total + (activity.xp_earned || 0);
    }, 0);
    
    return {
      totalReferrals: totalQuery.count || 0,
      pendingReferrals: pendingQuery.count || 0,
      completedReferrals: completedQuery.count || 0,
      xpEarned
    };
  } catch (error) {
    console.error('Error calculating referral stats:', error);
    return {
      totalReferrals: 0,
      pendingReferrals: 0,
      completedReferrals: 0,
      xpEarned: 0
    };
  }
} 