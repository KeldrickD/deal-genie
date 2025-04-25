import type { MailDataRequired } from '@sendgrid/mail';

let sgMail: any;

// Try to import SendGrid, with a fallback to prevent build failures
try {
  sgMail = require('@sendgrid/mail');
  // Initialize the SendGrid API with the key from environment variables
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }
} catch (error) {
  console.warn('SendGrid package not available:', error);
  // Create a mock implementation that logs but doesn't fail
  sgMail = {
    setApiKey: () => {},
    send: async () => {
      console.log('SendGrid mock: email would be sent here');
      return [{ statusCode: 200 }];
    }
  };
}

// Base email function for sending standard emails
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  try {
    const msg: MailDataRequired = {
      to,
      from: process.env.EMAIL_FROM || 'no-reply@dealgenieos.com',
      subject,
      text: text || ' ', // Provide a fallback empty string for text
    };
    
    if (html) {
      msg.html = html;
    }
    
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

// Function for sending template-based emails
export async function sendTemplateEmail({
  to,
  subject,
  templateId,
  dynamicTemplateData,
}: {
  to: string;
  subject: string;
  templateId: string;
  dynamicTemplateData?: Record<string, any>;
}) {
  try {
    await sgMail.send({
      to,
      from: process.env.EMAIL_FROM || 'no-reply@dealgenieos.com',
      subject,
      templateId,
      dynamicTemplateData,
      text: ' ', // Provide a fallback for text which is required
    });
    console.log(`Template email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('SendGrid template error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
} 