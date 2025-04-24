import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { normalizeAddress } from '@/utils/address';

// Schema for validating deal submission
const dealSchema = z.object({
  address: z.string().min(1, "Address is required"),
  propertyType: z.string().optional(),
  purchasePrice: z.number().optional(),
  arv: z.number().optional(),
  rehabCost: z.number().optional(),
  monthlyRent: z.number().optional(),
  noi: z.number().optional(),
  notes: z.string().optional(),
});

export type DealSubmission = z.infer<typeof dealSchema>;

// GET /api/genienet/deals
export async function GET(request: NextRequest) {
  const supabase = createClient();
  
  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const zip = searchParams.get('zip');
  const state = searchParams.get('state');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  
  // Build query
  let query = supabase
    .from('genienet_deals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);
  
  // Add filters if provided
  if (zip) {
    query = query.eq('zip_code', zip);
  }
  
  if (state) {
    query = query.eq('state', state);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
  
  return NextResponse.json({ deals: data });
}

// POST /api/genienet/deals
export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  // Get user session
  const session = await getServerSession();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  try {
    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, preferences')
      .eq('email', session.user.email)
      .single();
    
    if (userError || !user) {
      console.error('User not found:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Parse and validate input
    const body = await request.json();
    const validationResult = dealSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid deal data', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const dealData = validationResult.data;
    
    // Normalize address
    const normalizedAddress = normalizeAddress(dealData.address);
    
    // Check if this address already exists
    const { data: existingDeal } = await supabase
      .from('genienet_deals')
      .select('id')
      .eq('normalized_address', normalizedAddress)
      .maybeSingle();
    
    if (existingDeal) {
      return NextResponse.json(
        { error: 'Deal with this address already exists' },
        { status: 409 }
      );
    }
    
    // Calculate basic deal score based on provided metrics
    let dealScore = 50; // Default neutral score
    
    if (dealData.purchasePrice && dealData.arv && dealData.arv > dealData.purchasePrice * 1.3) {
      dealScore += 10; // Good ARV to purchase ratio
    }
    
    if (dealData.noi && dealData.purchasePrice) {
      const capRate = (dealData.noi * 12) / dealData.purchasePrice;
      if (capRate > 0.08) dealScore += 10; // Cap rate > 8%
    }
    
    if (dealData.monthlyRent && dealData.purchasePrice) {
      const rentToPrice = dealData.monthlyRent / dealData.purchasePrice;
      if (rentToPrice > 0.01) dealScore += 10; // 1% rule or better
    }
    
    // Extract zip code and state from address (simplified approach)
    const zipMatch = dealData.address.match(/\b\d{5}\b/);
    const zipCode = zipMatch ? zipMatch[0] : null;
    
    // Get state from the normalized address (very simplified)
    // In a real implementation, you would use a geocoding service
    const stateMatch = dealData.address.match(/\b([A-Z]{2})\b/i);
    const state = stateMatch ? stateMatch[1].toUpperCase() : null;
    
    // Insert the deal
    const { data: newDeal, error: insertError } = await supabase
      .from('genienet_deals')
      .insert({
        user_id: user.id,
        address: dealData.address,
        normalized_address: normalizedAddress,
        property_type: dealData.propertyType,
        purchase_price: dealData.purchasePrice,
        arv: dealData.arv,
        rehab_cost: dealData.rehabCost,
        monthly_rent: dealData.monthlyRent,
        noi: dealData.noi,
        notes: dealData.notes,
        zip_code: zipCode,
        state: state,
        deal_score: dealScore
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error inserting deal:', insertError);
      if (insertError.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Deal with this address already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: 'Failed to save deal' }, { status: 500 });
    }
    
    return NextResponse.json({ deal: newDeal }, { status: 201 });
  } catch (error) {
    console.error('Error processing deal submission:', error);
    return NextResponse.json({ error: 'Failed to process deal submission' }, { status: 500 });
  }
} 