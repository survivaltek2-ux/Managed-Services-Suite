import nodemailer from "nodemailer";

function esc(str: string | null | undefined): string {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const SMTP_HOST = process.env.SMTP_HOST || "smtp.sendgrid.net";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || "notifications@siebertservices.com";
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || "Siebert Services";
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || "sales@siebertservices.com";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!SMTP_USER || !SMTP_PASS) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.log(`[Email] SMTP not configured — skipped email to ${to.split("@")[1]}: "${subject}"`);
    return false;
  }
  try {
    await transport.sendMail({
      from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: "${subject}"`);
    return true;
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err);
    return false;
  }
}

export async function sendDealSubmittedNotification(deal: {
  title: string;
  customerName: string;
  customerEmail?: string | null;
  estimatedValue?: string | null;
  stage: string;
  products: string;
}, partner: {
  companyName: string;
  contactName: string;
  email: string;
}) {
  const products = (() => {
    try { return JSON.parse(deal.products).join(", "); } catch { return deal.products; }
  })();
  const value = deal.estimatedValue
    ? parseFloat(deal.estimatedValue).toLocaleString("en-US", { style: "currency", currency: "USD" })
    : "Not specified";

  const adminHtml = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #032d60, #0176d3); padding: 20px 24px; border-radius: 4px 4px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 18px;">New Deal Registration</h1>
      </div>
      <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 4px 4px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #706e6b; width: 140px;">Deal Title</td><td style="padding: 8px 0; font-weight: 600;">${esc(deal.title)}</td></tr>
          <tr><td style="padding: 8px 0; color: #706e6b;">Customer</td><td style="padding: 8px 0;">${esc(deal.customerName)}${deal.customerEmail ? ` (${esc(deal.customerEmail)})` : ""}</td></tr>
          <tr><td style="padding: 8px 0; color: #706e6b;">Products</td><td style="padding: 8px 0;">${esc(products)}</td></tr>
          <tr><td style="padding: 8px 0; color: #706e6b;">Estimated Value</td><td style="padding: 8px 0; font-weight: 600; color: #2e844a;">${esc(value)}</td></tr>
          <tr><td style="padding: 8px 0; color: #706e6b;">Stage</td><td style="padding: 8px 0;">${esc(deal.stage)}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 16px 0;" />
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #706e6b; width: 140px;">Partner Company</td><td style="padding: 8px 0;">${esc(partner.companyName)}</td></tr>
          <tr><td style="padding: 8px 0; color: #706e6b;">Contact</td><td style="padding: 8px 0;">${esc(partner.contactName)} (${esc(partner.email)})</td></tr>
        </table>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">This is an automated notification from the Siebert Services Partner Portal.</p>
      </div>
    </div>
  `;

  const partnerHtml = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #032d60, #0176d3); padding: 20px 24px; border-radius: 4px 4px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 18px;">Deal Registration Confirmed</h1>
      </div>
      <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 4px 4px;">
        <p style="font-size: 14px; margin: 0 0 16px;">Hi ${esc(partner.contactName)},</p>
        <p style="font-size: 14px; margin: 0 0 16px;">Your deal registration has been successfully submitted. Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; background: #f9f9f9; border-radius: 4px;">
          <tr><td style="padding: 10px 12px; color: #706e6b; width: 140px;">Deal Title</td><td style="padding: 10px 12px; font-weight: 600;">${esc(deal.title)}</td></tr>
          <tr><td style="padding: 10px 12px; color: #706e6b;">Customer</td><td style="padding: 10px 12px;">${esc(deal.customerName)}</td></tr>
          <tr><td style="padding: 10px 12px; color: #706e6b;">Products</td><td style="padding: 10px 12px;">${esc(products)}</td></tr>
          <tr><td style="padding: 10px 12px; color: #706e6b;">Estimated Value</td><td style="padding: 10px 12px; color: #2e844a; font-weight: 600;">${esc(value)}</td></tr>
        </table>
        <p style="font-size: 14px; margin: 16px 0 0;">Our team will review your deal registration and follow up shortly. You can track the status of this deal in the Partner Portal.</p>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">— Siebert Services Partner Team</p>
      </div>
    </div>
  `;

  await Promise.all([
    sendEmail(NOTIFICATION_EMAIL, `New Deal Registration: ${esc(deal.title)} — ${esc(partner.companyName)}`, adminHtml),
    sendEmail(partner.email, `Deal Registration Confirmed: ${esc(deal.title)}`, partnerHtml),
  ]);
}

export async function sendTicketSubmittedNotification(ticket: {
  subject: string;
  description: string;
  priority: string;
  category: string;
}, partner: {
  companyName: string;
  contactName: string;
  email: string;
}) {
  const priorityColors: Record<string, string> = {
    urgent: "#ea001e", high: "#fe9339", medium: "#0176d3", low: "#706e6b",
  };
  const pColor = priorityColors[ticket.priority] || "#706e6b";

  const adminHtml = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #032d60, #0176d3); padding: 20px 24px; border-radius: 4px 4px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 18px;">New Support Ticket</h1>
      </div>
      <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 4px 4px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #706e6b; width: 140px;">Subject</td><td style="padding: 8px 0; font-weight: 600;">${esc(ticket.subject)}</td></tr>
          <tr><td style="padding: 8px 0; color: #706e6b;">Priority</td><td style="padding: 8px 0;"><span style="color: ${pColor}; font-weight: 600; text-transform: uppercase;">${esc(ticket.priority)}</span></td></tr>
          <tr><td style="padding: 8px 0; color: #706e6b;">Category</td><td style="padding: 8px 0; text-transform: capitalize;">${esc(ticket.category)}</td></tr>
          <tr><td style="padding: 8px 0; color: #706e6b;">Description</td><td style="padding: 8px 0;">${esc(ticket.description)}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 16px 0;" />
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #706e6b; width: 140px;">Partner Company</td><td style="padding: 8px 0;">${esc(partner.companyName)}</td></tr>
          <tr><td style="padding: 8px 0; color: #706e6b;">Contact</td><td style="padding: 8px 0;">${esc(partner.contactName)} (${esc(partner.email)})</td></tr>
        </table>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">This is an automated notification from the Siebert Services Partner Portal.</p>
      </div>
    </div>
  `;

  const partnerHtml = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #032d60, #0176d3); padding: 20px 24px; border-radius: 4px 4px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 18px;">Support Ticket Received</h1>
      </div>
      <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 4px 4px;">
        <p style="font-size: 14px; margin: 0 0 16px;">Hi ${esc(partner.contactName)},</p>
        <p style="font-size: 14px; margin: 0 0 16px;">We've received your support ticket and our team will review it shortly.</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; background: #f9f9f9; border-radius: 4px;">
          <tr><td style="padding: 10px 12px; color: #706e6b; width: 140px;">Subject</td><td style="padding: 10px 12px; font-weight: 600;">${esc(ticket.subject)}</td></tr>
          <tr><td style="padding: 10px 12px; color: #706e6b;">Priority</td><td style="padding: 10px 12px;"><span style="color: ${pColor}; font-weight: 600; text-transform: uppercase;">${esc(ticket.priority)}</span></td></tr>
          <tr><td style="padding: 10px 12px; color: #706e6b;">Category</td><td style="padding: 10px 12px; text-transform: capitalize;">${esc(ticket.category)}</td></tr>
        </table>
        <p style="font-size: 14px; margin: 16px 0 0;">You can track the status and add updates to your ticket in the Partner Portal under Support.</p>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">— Siebert Services Support Team</p>
      </div>
    </div>
  `;

  await Promise.all([
    sendEmail(NOTIFICATION_EMAIL, `New Support Ticket: ${esc(ticket.subject)} — ${esc(partner.companyName)}`, adminHtml),
    sendEmail(partner.email, `Support Ticket Received: ${ticket.subject}`, partnerHtml),
  ]);
}
