import sgMail from '@sendgrid/mail';

// Initialize the SendGrid API with the key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

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
    const msg: sgMail.MailDataRequired = {
      to,
      from: process.env.EMAIL_FROM!,
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
      from: process.env.EMAIL_FROM!,
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