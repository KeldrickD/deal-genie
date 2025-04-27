import { Resend } from 'resend';
import { Property } from '@/types/property';
import { formatCurrency } from '@/lib/utils';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY!);

interface DailyLeadAlertsParams {
  email: string;
  searchName: string;
  leads: Property[];
  searchId: string;
}

export async function sendDailyLeadAlerts({ 
  email, 
  searchName, 
  leads, 
  searchId 
}: DailyLeadAlertsParams) {
  if (!email || leads.length === 0) {
    return { error: 'Missing required parameters' };
  }

  try {
    // Format the leads for the email
    const leadsHtml = leads.map(lead => `
      <div style="margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px;">
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${lead.address}</div>
        <div style="font-size: 18px; color: #10b981; margin-bottom: 10px;">${formatCurrency(lead.price)}</div>
        <div style="margin-bottom: 5px; color: #4b5563;">
          <span style="color: #1f2937;">${lead.bedrooms} beds</span> • 
          <span style="color: #1f2937;">${lead.bathrooms} baths</span> • 
          <span style="color: #1f2937;">${lead.sqft} sqft</span>
        </div>
        <div style="margin-bottom: 10px; color: #4b5563;">Listed: ${new Date(lead.date_listed).toLocaleDateString()}</div>
        <div style="margin-bottom: 10px; color: #4b5563;">Source: ${lead.source}</div>
        ${lead.description ? `<div style="margin-bottom: 10px; color: #4b5563;">${lead.description.substring(0, 150)}${lead.description.length > 150 ? '...' : ''}</div>` : ''}
        ${lead.url ? `<a href="${lead.url}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; font-weight: medium;">View Property</a>` : ''}
      </div>
    `).join('');

    // Build the email content
    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Property Leads</title>
        </head>
        <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #374151; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <div style="padding: 20px; background-color: #f3f4f6; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; color: #111827;">New Property Leads</h1>
            </div>
            <div style="padding: 20px;">
              <p style="margin-bottom: 16px;">We found ${leads.length} new properties matching your "${searchName}" search:</p>
              ${leadsHtml}
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
                <p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/lead-genie/saved-searches" style="color: #3b82f6; text-decoration: none;">Manage your saved searches</a>
                  &nbsp;|&nbsp;
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/lead-genie/saved-searches/${searchId}" style="color: #3b82f6; text-decoration: none;">View all leads for this search</a>
                </p>
                <p>© ${new Date().getFullYear()} Deal Genie. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'Deal Genie <alerts@dealgenie.ai>',
      to: [email],
      subject: `${leads.length} New Properties Found - "${searchName}"`,
      html: emailContent,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error('Error in sendDailyLeadAlerts:', error);
    return { error };
  }
} 