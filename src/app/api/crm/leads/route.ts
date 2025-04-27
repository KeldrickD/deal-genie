import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { CrmLeads } from '@/db/schema';
import { desc } from 'drizzle-orm';

// GET /api/crm/leads - Get all leads for the current user
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get query params for filtering/sorting
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    
    // Build query with filters
    let query = db.query.CrmLeads.findMany({
      where: (lead, { and, eq }) => {
        const conditions = [eq(lead.userId, userId)];
        
        if (status && status !== 'all') {
          conditions.push(eq(lead.status, status));
        }
        
        return and(...conditions);
      },
      orderBy: [desc(CrmLeads.createdAt)],
    });

    // Execute query
    const leads = await query;

    // Transform the data if needed
    const formattedLeads = leads.map(lead => ({
      id: lead.id,
      address: lead.address,
      city: lead.city,
      state: lead.state,
      zipcode: lead.zipcode,
      price: lead.price,
      propertyType: lead.propertyType,
      daysOnMarket: lead.daysOnMarket,
      source: lead.source,
      status: lead.status,
      leadNotes: lead.leadNotes,
      listingUrl: lead.listingUrl,
      keywordsMatched: lead.keywordsMatched ? JSON.parse(lead.keywordsMatched) : null,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    }));

    return NextResponse.json({ leads: formattedLeads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
} 