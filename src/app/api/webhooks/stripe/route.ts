import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

// Webhook secret for signature verification
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Helper function to format date
const formatDate = (timestamp: number | null): string | null => {
  if (!timestamp) return null;
  return new Date(timestamp * 1000).toISOString();
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Initialize supabase client
    const supabase = createClient();

    // Handle specific Stripe events
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        
        // Extract user ID from client_reference_id
        const userId = checkoutSession.client_reference_id;
        
        if (!userId) {
          console.error('No user ID found in checkout session');
          return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
        }

        // Get subscription details
        if (checkoutSession.subscription && typeof checkoutSession.subscription === 'string') {
          const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription);
          
          // Access the fields we need using type assertion to bypass TypeScript restrictions
          const stripeSubscription = subscription as unknown as {
            id: string;
            status: string;
            items: { data: [{ price: { id: string } }] };
            trial_end: number | null;
            current_period_end: number;
            cancel_at_period_end: boolean;
          };
          
          // Format dates for database
          const trialEndDate = formatDate(stripeSubscription.trial_end);
          const periodEndDate = formatDate(stripeSubscription.current_period_end);
          
          // Ensure period end date is never null
          if (!periodEndDate) {
            console.error('Missing required current_period_end');
            return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
          }
          
          // Store subscription in database
          const { error } = await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: checkoutSession.customer as string,
              stripe_subscription_id: stripeSubscription.id,
              plan_id: stripeSubscription.items.data[0].price.id,
              status: stripeSubscription.status,
              trial_end: trialEndDate,
              current_period_end: periodEndDate,
              cancel_at_period_end: stripeSubscription.cancel_at_period_end,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (error) {
            console.error('Error storing subscription in database:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
          }
          
          console.log('New subscription created and stored', {
            userId,
            stripeSubscriptionId: stripeSubscription.id,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as unknown as {
          id: string;
          status: string;
          trial_end: number | null;
          current_period_end: number;
          cancel_at_period_end: boolean;
        };
        
        // Format dates for database
        const trialEndDate = formatDate(subscription.trial_end);
        const periodEndDate = formatDate(subscription.current_period_end);
        
        // Ensure period end date is never null
        if (!periodEndDate) {
          console.error('Missing required current_period_end');
          return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
        }
        
        // Update subscription information in database
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            status: subscription.status,
            trial_end: trialEndDate,
            current_period_end: periodEndDate,
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription in database:', error);
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }
        
        console.log('Subscription updated in database', {
          stripeSubscriptionId: subscription.id,
          status: subscription.status,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status to canceled in database
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription in database:', error);
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }
        
        console.log('Subscription marked as canceled in database', {
          stripeSubscriptionId: subscription.id,
        });
        break;
      }

      // Handle payment failures
      case 'invoice.payment_failed': {
        const invoice = event.data.object as unknown as { subscription: string | null };
        
        if (invoice.subscription) {
          // Find the user subscription by subscription ID
          const { data: subscriptionData } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', invoice.subscription)
            .single();
          
          if (subscriptionData?.user_id) {
            console.log('Payment failed for subscription', {
              stripeSubscriptionId: invoice.subscription,
              userId: subscriptionData.user_id,
            });
            
            // Here you could send notification email to user, etc.
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 