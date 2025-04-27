import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { CrmLeads } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth();
    const leadId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if the lead exists and belongs to the user
    const existingLead = await db.query.CrmLeads.findFirst({
      where: (lead, { and, eq }) => and(
        eq(lead.id, leadId),
        eq(lead.userId, userId)
      ),
    });

    if (!existingLead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Get update data from request body
    const updateData = await req.json();
    
    // Prepare data for update
    const validUpdates: Record<string, any> = {};
    
    if (updateData.status) {
      validUpdates.status = updateData.status;
    }
    
    if (updateData.lead_notes !== undefined) {
      validUpdates.leadNotes = updateData.lead_notes;
    }
    
    // Add updatedAt timestamp
    validUpdates.updatedAt = new Date();
    
    // Update lead
    await db.update(CrmLeads)
      .set(validUpdates)
      .where(
        and(
          eq(CrmLeads.id, leadId),
          eq(CrmLeads.userId, userId)
        )
      );

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully'
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth();
    const leadId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if the lead exists and belongs to the user
    const existingLead = await db.query.CrmLeads.findFirst({
      where: (lead, { and, eq }) => and(
        eq(lead.id, leadId),
        eq(lead.userId, userId)
      ),
    });

    if (!existingLead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Delete the lead
    await db.delete(CrmLeads)
      .where(
        and(
          eq(CrmLeads.id, leadId),
          eq(CrmLeads.userId, userId)
        )
      );

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
} 