import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const { priceId, plan } = await request.json();

    // Validate inputs
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
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
    // Get host from request headers
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const origin = `${protocol}://${host}`;

    // Create Stripe Checkout Session
    let checkoutOptions: Stripe.Checkout.SessionCreateParams = {
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
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
        },
      },
    };

    // Add trial period for Pro plan only
    if (plan === 'Pro') {
      checkoutOptions.subscription_data = {
        ...checkoutOptions.subscription_data,
        trial_period_days: 14, // Add 14-day free trial
      };
    }

    // Create the checkout session
    const checkoutSession = await stripe.checkout.sessions.create(checkoutOptions);

    // Return the session URL for redirect
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 