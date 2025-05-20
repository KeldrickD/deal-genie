import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

export async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const supabase = createClient();
  
  try {
    // Skip if no user ID is provided
    if (!session.client_reference_id) {
      console.warn('No client_reference_id in checkout session');
      return { success: false, error: 'No client reference ID' };
    }
    
    const userId = session.client_reference_id;
    
    // Get subscription details from session
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;
    
    // If there's no subscription (free plan or other product), skip
    if (!subscriptionId) {
      console.log('No subscription in checkout session, skipping');
      return { success: true };
    }
    
    // Retrieve the subscription to get more details
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
    });
    
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Extract metadata from the subscription
    const planName = subscription.metadata.plan_name || 'Pro';
    const billingCycle = subscription.metadata.billing_cycle || 'monthly';
    
    // Determine the plan ID from the first subscription item
    const planId = subscription.items.data[0]?.price.id || '';
    
    // Format the period end date - use the unixTimestamp property
    const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000).toISOString();
    
    // Record the subscription in the database
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: customerId,
        plan_id: planId,
        status: subscription.status,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: subscription.cancel_at_period_end,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (subscriptionError) {
      console.error('Error recording subscription:', subscriptionError);
      return { success: false, error: 'Failed to record subscription' };
    }
    
    // Award XP for subscribing
    const xpAmount = billingCycle === 'yearly' ? 250 : 100;
    
    const { error: activityError } = await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        activity_type: 'subscription',
        xp_earned: xpAmount,
        details: {
          plan: planName,
          billing_cycle: billingCycle,
          checkout_session_id: session.id
        }
      });
    
    if (activityError) {
      console.error('Error awarding XP for subscription:', activityError);
    }
    
    // Update user metadata in auth
    const { error: userUpdateError } = await supabase.auth.updateUser({
      data: { 
        is_subscribed: true, 
        plan: planName
      }
    });
    
    if (userUpdateError) {
      console.error('Error updating user metadata:', userUpdateError);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    return { success: false, error: 'Internal server error' };
  }
} 