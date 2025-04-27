import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { CrmLeads } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';

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

    // Prepare lead data for insertion
    const newLeadData = {
      id: uuidv4(),
      userId: userId,
      propertyId: leadData.property_id || null,
      address: leadData.address,
      city: leadData.city,
      state: leadData.state || null,
      zipcode: leadData.zipcode || null,
      price: leadData.price || null,
      propertyType: leadData.property_type || null,
      daysOnMarket: leadData.days_on_market || null,
      source: leadData.source || 'lead-genie',
      status: leadData.status || 'new',
      leadNotes: leadData.lead_notes || null,
      listingUrl: leadData.listing_url || null,
      keywordsMatched: leadData.keywords_matched ? JSON.stringify(leadData.keywords_matched) : null,
      createdAt: new Date(),
      updatedAt: new Date()
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