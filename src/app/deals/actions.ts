'use server'; // Mark this entire file as containing Server Actions

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import type { ActionFormState } from '@/types/forms'; // Import shared type
// Remove Zod import here if not needed elsewhere in this file
// import * as z from 'zod'; 
// Import the schema from its new location
import { dealSchema } from '@/lib/schemas'; 

// Remove schema definition from here
// const dealSchema = z.object({ ... });

// --- ADD DEAL ACTION --- 
export async function addDealAction(prevState: ActionFormState, formData: FormData): Promise<ActionFormState> {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Auth Error:', authError);
    return { error: 'User not authenticated. Please log in again.' }; 
  }

  // Validate form data using IMPORTED Zod schema
  const validatedFields = dealSchema.safeParse({
    deal_name: formData.get('deal_name'),
    status: formData.get('status'),
    address: formData.get('address') || null,
    property_type: formData.get('property_type') || null,
    purchase_price: formData.get('purchase_price') || null,
    arv: formData.get('arv') || null,
    rehab_cost: formData.get('rehab_cost') || null,
    noi: formData.get('noi') || null,
    loan_amount: formData.get('loan_amount') || null,
    interest_rate: formData.get('interest_rate') || null,
    loan_term_years: formData.get('loan_term_years') || null,
    note: formData.get('note') || null,
  });

  // If validation fails, return errors
  if (!validatedFields.success) {
    // Flatten errors into a simple message (could be more sophisticated)
    const errorMessage = Object.entries(validatedFields.error.flatten().fieldErrors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('; ');
    console.error('Zod Validation Error (Add):', validatedFields.error.flatten());
    return { error: `Invalid input: ${errorMessage}`, success: false };
  }

  // Use validated data for Supabase insert
  const dealData = { 
      ...validatedFields.data, 
      user_id: user.id // Add user_id after validation
  };

  const { error: insertError } = await supabase
    .from('deals')
    .insert([dealData]); 

  if (insertError) {
    console.error('Supabase Insert Error:', insertError); 
    return { error: `Failed to add deal: ${insertError.message}` };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard'); 
}

// --- UPDATE DEAL ACTION ---
export async function updateDealAction(prevState: ActionFormState, formData: FormData): Promise<ActionFormState> {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) { return cookieStore.get(name)?.value },
            set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }) },
            remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }) },
          },
        }
      );
    
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth Error:', authError);
        return { error: 'User not authenticated. Please log in again.', success: false }; 
      }

    // Get Deal ID from hidden input
    const dealId = formData.get('dealId') as string;
    if (!dealId) {
        return { error: 'Deal ID is missing. Cannot update.', success: false };
    }

    // Validate form data using IMPORTED Zod schema
    const validatedFields = dealSchema.safeParse({
      deal_name: formData.get('deal_name'),
      status: formData.get('status'),
      address: formData.get('address') || null,
      property_type: formData.get('property_type') || null,
      purchase_price: formData.get('purchase_price') || null,
      arv: formData.get('arv') || null,
      rehab_cost: formData.get('rehab_cost') || null,
      noi: formData.get('noi') || null,
      loan_amount: formData.get('loan_amount') || null,
      interest_rate: formData.get('interest_rate') || null,
      loan_term_years: formData.get('loan_term_years') || null,
      note: formData.get('note') || null,
    });

    // If validation fails, return errors
    if (!validatedFields.success) {
        const errorMessage = Object.entries(validatedFields.error.flatten().fieldErrors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
        console.error('Zod Validation Error (Update):', validatedFields.error.flatten());
        return { error: `Invalid input: ${errorMessage}`, success: false };
    }

    // Use validated data for update (user_id is not updated)
    const dealDataToUpdate = validatedFields.data;

    // Perform update with validated data
    const { error: updateError } = await supabase
        .from('deals')
        .update(dealDataToUpdate)
        .eq('id', dealId)
        .eq('user_id', user.id); 

    if (updateError) {
        console.error('Supabase Update Error:', updateError);
        return { error: `Failed to update deal: ${updateError.message}`, success: false };
    }

    // Revalidate paths to reflect changes
    revalidatePath('/dashboard');
    revalidatePath(`/deals/${dealId}`); // Revalidate the specific deal page

    // Return success state
    return { error: null, success: true }; 
} 