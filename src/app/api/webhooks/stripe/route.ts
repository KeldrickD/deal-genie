import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';
import { sendEmail } from '@/lib/sendgrid';

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

// Helper function to format date in a human-readable format
const formatReadableDate = (timestamp: number | null): string => {
  if (!timestamp) return 'Unknown date';
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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

      // Handle trial ending soon
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Fetch the user info from the subscription metadata
        const { data: subscriptionData } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();
          
        if (subscriptionData?.user_id) {
          // Get user's email
          const { data: userData } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', subscriptionData.user_id)
            .single();
            
          if (userData?.email) {
            // Format trial end date for display
            const trialEndDate = formatReadableDate(subscription.trial_end);
            
            // Send trial ending reminder email
            await sendEmail({
              to: userData.email,
              subject: 'Your 14-Day Trial is Ending Soon!',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #4F46E5;">Your Deal Genie Trial is Ending Soon</h2>
                  <p>Hi there,</p>
                  <p>Your 14-day free trial for Deal Genie Pro ends on <strong>${trialEndDate}</strong>.</p>
                  <p>No action is needed—you'll keep full access and billing will begin automatically unless you cancel.</p>
                  <p>During your trial, we hope you've had the chance to:</p>
                  <ul>
                    <li>Analyze multiple properties with our advanced AI</li>
                    <li>Generate competitive offers automatically</li>
                    <li>Track your deal pipeline and manage your investments</li>
                  </ul>
                  <p>If you'd like to continue using Deal Genie Pro with all its features, no action is required. Your subscription will automatically begin when your trial ends.</p>
                  <p>If you have any questions or need assistance, please reply to this email or visit our help center.</p>
                  <p>Thanks for trying Deal Genie!</p>
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
                    <p>Deal Genie - AI-Powered Real Estate Investment Platform</p>
                    <p>This email was sent to ${userData.email}</p>
                  </div>
                </div>
              `,
            });
            
            console.log('Trial ending reminder email sent', {
              userId: subscriptionData.user_id,
              email: userData.email,
              trialEndDate
            });
          }
        }
        break;
      }

      // Handle payment failures
      case 'invoice.payment_failed': {
        const invoice = event.data.object as unknown as { 
          subscription: string | null;
          customer_email: string | null;
        };
        
        if (invoice.subscription) {
          // Find the user subscription by subscription ID
          const { data: subscriptionData } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', invoice.subscription)
            .single();
          
          if (subscriptionData?.user_id) {
            // Get user's email
            const { data: userData } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', subscriptionData.user_id)
              .single();
              
            if (userData?.email) {
              // Send payment failure notification email
              await sendEmail({
                to: userData.email,
                subject: 'Payment Failed for Your Deal Genie Subscription',
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #E53E3E;">Payment Failed for Your Subscription</h2>
                    <p>Hi there,</p>
                    <p>We tried to bill your card for your Deal Genie subscription but the payment failed.</p>
                    <p>Please update your payment details to avoid interruption to your service:</p>
                    <p style="margin: 25px 0;">
                      <a href="https://dealgenieos.com/settings/billing" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Update Payment Method</a>
                    </p>
                    <p>If you don't update your payment information, your subscription may be canceled and you'll lose access to premium features.</p>
                    <p>If you have any questions or need assistance, please reply to this email.</p>
                    <p>Thank you for being a Deal Genie customer!</p>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
                      <p>Deal Genie - AI-Powered Real Estate Investment Platform</p>
                      <p>This email was sent to ${userData.email}</p>
                    </div>
                  </div>
                `,
              });
              
              console.log('Payment failure notification email sent', {
                userId: subscriptionData.user_id,
                email: userData.email
              });
            }
          }
        }
        break;
      }

      // Track successful payment for trial conversion
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as unknown as { 
          subscription: string | null;
        };
        
        if (invoice.subscription) {
          // Fetch the subscription record
          const { data: subscriptionData } = await supabase
            .from('user_subscriptions')
            .select('user_id, status, trial_end')
            .eq('stripe_subscription_id', invoice.subscription)
            .single();
          
          // If it was trialing, mark conversion
          if (subscriptionData?.status === 'trialing') {
            await supabase
              .from('user_subscriptions')
              .update({ 
                status: 'active', 
                converted_at: new Date().toISOString() 
              })
              .eq('stripe_subscription_id', invoice.subscription);
            
            console.log('Trial converted to paid subscription', {
              userId: subscriptionData.user_id,
              subscriptionId: invoice.subscription
            });
            
            // You could also send a "welcome to pro" email here
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