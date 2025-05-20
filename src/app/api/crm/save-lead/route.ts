import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { CrmLeads } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { getPropertyDetails } from '@/lib/attom';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const leadData = await req.json();
    
    // Validate required fields
    if (!leadData.address || !leadData.city) {
      return NextResponse.json(
        { error: 'Address and city are required' },
        { status: 400 }
      );
    }

    // Check if property already exists in CRM for this user
    if (leadData.property_id) {
      const existingLead = await db.query.CrmLeads.findFirst({
        where: (lead, { and, eq }) => and(
          eq(lead.userId, userId),
          eq(lead.propertyId, leadData.property_id)
        )
      });

      if (existingLead) {
        return NextResponse.json(
          { 
            error: 'Lead already exists in your CRM',
            leadId: existingLead.id 
          },
          { status: 409 }
        );
      }
    }

    // Fetch Attom property details for enrichment
    let attomData = null;
    try {
      attomData = await getPropertyDetails(leadData.address);
    } catch (err) {
      attomData = null;
    }

    // Prepare lead data for insertion
    const newLeadData = {
      id: uuidv4(),
      userId: userId,
      propertyId: leadData.property_id || null,
      address: leadData.address,
      city: leadData.city,
      state: leadData.state || attomData?.property?.state || null,
      zipcode: leadData.zipcode || attomData?.property?.postalcode || null,
      price: leadData.price || attomData?.property?.lastSaleAmount || null,
      propertyType: leadData.property_type || attomData?.property?.type || null,
      daysOnMarket: leadData.days_on_market || null,
      source: leadData.source || 'lead-genie',
      status: leadData.status || 'new',
      leadNotes: leadData.lead_notes || null,
      listingUrl: leadData.listing_url || null,
      keywordsMatched: leadData.keywords_matched ? JSON.stringify(leadData.keywords_matched) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      attomData: attomData?.property || attomData || null
    };

    // Insert the new lead
    await db.insert(CrmLeads).values(newLeadData);

    return NextResponse.json({
      success: true,
      leadId: newLeadData.id,
      message: 'Lead saved successfully'
    });
  } catch (error) {
    console.error('Error saving lead to CRM:', error);
    return NextResponse.json(
      { error: 'Failed to save lead' },
      { status: 500 }
    );
  }
} 