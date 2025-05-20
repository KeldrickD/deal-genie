import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

// Map of plan names to their Stripe price IDs
const PRICE_IDS = {
  'Pro': {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID
  }
} as const;

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const { priceId, plan, billingCycle = 'monthly' } = await request.json();

    // Validate inputs
    if (!priceId && !plan) {
      return NextResponse.json(
        { error: 'Price ID or plan name is required' },
        { status: 400 }
      );
    }

    // Get the current user from session
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Set the app's URL for success and cancel redirects
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const origin = `${protocol}://${host}`;

    // Get the price ID from the plan name if not provided directly
    const finalPriceId = priceId || 
      (PRICE_IDS[plan as keyof typeof PRICE_IDS] && 
       PRICE_IDS[plan as keyof typeof PRICE_IDS][billingCycle as 'monthly' | 'yearly']);

    if (!finalPriceId) {
      return NextResponse.json(
        { error: 'Invalid plan or price ID' },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?checkout=canceled`,
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_name: plan,
          billing_cycle: billingCycle
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_creation: 'always',
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 