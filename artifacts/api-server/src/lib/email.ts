import nodemailer from "nodemailer";

function esc(str: string | null | undefined): string {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const SMTP_HOST = process.env.SMTP_HOST || "smtp.sendgrid.net";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || "notifications@siebertrservices.com";
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || "Siebert Services";
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || "sales@siebertrservices.com";

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

export async function sendContactFormNotification(contact: {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  message: string;
}) {
  const adminHtml = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #032d60, #0176d3); padding: 20px 24px; border-radius: 4px 4px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 18px;">New Contact Form Submission</h1>
      </div>
      <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 4px 4px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #706e6b; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${esc(contact.name)}</td></tr>
          <tr><td style="padding: 8px 0; color: #706e6b;">Email</td><td style="padding: 8px 0;">${esc(contact.email)}</td></tr>
          ${contact.phone ? `<tr><td style="padding: 8px 0; color: #706e6b;">Phone</td><td style="padding: 8px 0;">${esc(contact.phone)}</td></tr>` : ""}
          ${contact.company ? `<tr><td style="padding: 8px 0; color: #706e6b;">Company</td><td style="padding: 8px 0;">${esc(contact.company)}</td></tr>` : ""}
          ${contact.service ? `<tr><td style="padding: 8px 0; color: #706e6b;">Service Interest</td><td style="padding: 8px 0;">${esc(contact.service)}</td></tr>` : ""}
        </table>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 16px 0;" />
        <p style="font-size: 13px; color: #706e6b; margin: 0 0 4px;">Message:</p>
        <p style="font-size: 14px; margin: 0; white-space: pre-wrap;">${esc(contact.message)}</p>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">This is an automated notification from the Siebert Services website.</p>
      </div>
    </div>
  `;

  const confirmHtml = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #032d60, #0176d3); padding: 20px 24px; border-radius: 4px 4px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 18px;">Thank You for Contacting Us</h1>
      </div>
      <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 4px 4px;">
        <p style="font-size: 14px; margin: 0 0 16px;">Hi ${esc(contact.name)},</p>
        <p style="font-size: 14px; margin: 0 0 16px;">Thank you for reaching out to Siebert Services. We've received your message and our team will get back to you within 1 business day.</p>
        <p style="font-size: 14px; margin: 0 0 4px;">In the meantime, you can reach us at:</p>
        <ul style="font-size: 14px; margin: 8px 0 0; padding-left: 20px;">
          <li>Phone: <a href="tel:866-484-9180" style="color: #0176d3;">866-484-9180</a></li>
          <li>Email: <a href="mailto:support@siebertrservices.com" style="color: #0176d3;">support@siebertrservices.com</a></li>
        </ul>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">— Siebert Services Team</p>
      </div>
    </div>
  `;

  await Promise.all([
    sendEmail(NOTIFICATION_EMAIL, `New Contact: ${esc(contact.name)}${contact.company ? ` — ${esc(contact.company)}` : ""}`, adminHtml),
    sendEmail(contact.email, "Thank You for Contacting Siebert Services", confirmHtml),
  ]);
}

export async function sendQuoteRequestNotification(quote: {
  name: string;
  email: string;
  phone?: string | null;
  company: string;
  companySize?: string | null;
  services: string;
  budget?: string | null;
  timeline?: string | null;
  details?: string | null;
}) {
  const services = (() => {
    try { return JSON.parse(quote.services).join(", "); } catch { return quote.services; }
  })();

  const adminHtml = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #032d60, #0176d3); padding: 20px 24px; border-radius: 4px 4px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 18px;">New Quote Request</h1>
      </div>
      <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 4px 4px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #706e6b; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${esc(quote.name)}</td></tr>
          <tr><td style="padding: 8px 0; color: #706e6b;">Email</td><td style="padding: 8px 0;">${esc(quote.email)}</td></tr>
          ${quote.phone ? `<tr><td style="padding: 8px 0; color: #706e6b;">Phone</td><td style="padding: 8px 0;">${esc(quote.phone)}</td></tr>` : ""}
          <tr><td style="padding: 8px 0; color: #706e6b;">Company</td><td style="padding: 8px 0;">${esc(quote.company)}</td></tr>
          ${quote.companySize ? `<tr><td style="padding: 8px 0; color: #706e6b;">Company Size</td><td style="padding: 8px 0;">${esc(quote.companySize)}</td></tr>` : ""}
          <tr><td style="padding: 8px 0; color: #706e6b;">Services</td><td style="padding: 8px 0; font-weight: 600;">${esc(services)}</td></tr>
          ${quote.budget ? `<tr><td style="padding: 8px 0; color: #706e6b;">Budget</td><td style="padding: 8px 0;">${esc(quote.budget)}</td></tr>` : ""}
          ${quote.timeline ? `<tr><td style="padding: 8px 0; color: #706e6b;">Timeline</td><td style="padding: 8px 0;">${esc(quote.timeline)}</td></tr>` : ""}
        </table>
        ${quote.details ? `<hr style="border: none; border-top: 1px solid #e5e5e5; margin: 16px 0;" /><p style="font-size: 13px; color: #706e6b; margin: 0 0 4px;">Additional Details:</p><p style="font-size: 14px; margin: 0; white-space: pre-wrap;">${esc(quote.details)}</p>` : ""}
        <p style="font-size: 12px; color: #999; margin-top: 20px;">This is an automated notification from the Siebert Services website.</p>
      </div>
    </div>
  `;

  const confirmHtml = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #032d60, #0176d3); padding: 20px 24px; border-radius: 4px 4px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 18px;">Quote Request Received</h1>
      </div>
      <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 4px 4px;">
        <p style="font-size: 14px; margin: 0 0 16px;">Hi ${esc(quote.name)},</p>
        <p style="font-size: 14px; margin: 0 0 16px;">Thank you for requesting a quote from Siebert Services! We've received your request for the following services:</p>
        <div style="background: #f9f9f9; padding: 12px 16px; border-radius: 4px; margin: 0 0 16px;">
          <p style="font-size: 14px; font-weight: 600; margin: 0;">${esc(services)}</p>
        </div>
        <p style="font-size: 14px; margin: 0 0 16px;">Our team will review your requirements and prepare a customized quote for you. You can expect to hear from us within 1-2 business days.</p>
        <p style="font-size: 14px; margin: 0 0 4px;">Questions? Contact us:</p>
        <ul style="font-size: 14px; margin: 8px 0 0; padding-left: 20px;">
          <li>Phone: <a href="tel:866-484-9180" style="color: #0176d3;">866-484-9180</a></li>
          <li>Email: <a href="mailto:sales@siebertrservices.com" style="color: #0176d3;">sales@siebertrservices.com</a></li>
        </ul>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">— Siebert Services Sales Team</p>
      </div>
    </div>
  `;

  await Promise.all([
    sendEmail(NOTIFICATION_EMAIL, `New Quote Request: ${esc(quote.name)} — ${esc(quote.company)}`, adminHtml),
    sendEmail(quote.email, "Quote Request Received — Siebert Services", confirmHtml),
  ]);
}

export async function sendClientTicketNotification(ticket: {
  subject: string;
  description: string;
  priority: string;
  category: string;
}, userEmail: string, userName?: string) {
  const priorityColors: Record<string, string> = {
    urgent: "#ea001e", high: "#fe9339", medium: "#0176d3", low: "#706e6b",
  };
  const pColor = priorityColors[ticket.priority] || "#706e6b";

  const adminHtml = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #032d60, #0176d3); padding: 20px 24px; border-radius: 4px 4px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 18px;">New Client Support Ticket</h1>
      </div>
      <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 4px 4px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #706e6b; width: 140px;">Subject</td><td style="padding: 8px 0; font-weight: 600;">${esc(ticket.subject)}</td></tr>
          <tr><td style="padding: 8px 0; color: #706e6b;">Priority</td><td style="padding: 8px 0;"><span style="color: ${pColor}; font-weight: 600; text-transform: uppercase;">${esc(ticket.priority)}</span></td></tr>
          <tr><td style="padding: 8px 0; color: #706e6b;">Category</td><td style="padding: 8px 0; text-transform: capitalize;">${esc(ticket.category)}</td></tr>
          <tr><td style="padding: 8px 0; color: #706e6b;">Submitted By</td><td style="padding: 8px 0;">${esc(userName || "Client")} (${esc(userEmail)})</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 16px 0;" />
        <p style="font-size: 13px; color: #706e6b; margin: 0 0 4px;">Description:</p>
        <p style="font-size: 14px; margin: 0; white-space: pre-wrap;">${esc(ticket.description)}</p>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">This is an automated notification from the Siebert Services client portal.</p>
      </div>
    </div>
  `;

  const confirmHtml = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #032d60, #0176d3); padding: 20px 24px; border-radius: 4px 4px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 18px;">Support Ticket Submitted</h1>
      </div>
      <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 4px 4px;">
        <p style="font-size: 14px; margin: 0 0 16px;">Hi ${esc(userName || "there")},</p>
        <p style="font-size: 14px; margin: 0 0 16px;">We've received your support ticket and our team is on it.</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; background: #f9f9f9; border-radius: 4px;">
          <tr><td style="padding: 10px 12px; color: #706e6b; width: 140px;">Subject</td><td style="padding: 10px 12px; font-weight: 600;">${esc(ticket.subject)}</td></tr>
          <tr><td style="padding: 10px 12px; color: #706e6b;">Priority</td><td style="padding: 10px 12px;"><span style="color: ${pColor}; font-weight: 600; text-transform: uppercase;">${esc(ticket.priority)}</span></td></tr>
          <tr><td style="padding: 10px 12px; color: #706e6b;">Category</td><td style="padding: 10px 12px; text-transform: capitalize;">${esc(ticket.category)}</td></tr>
        </table>
        <p style="font-size: 14px; margin: 16px 0 0;">You can view the status of your ticket by logging into your account.</p>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">— Siebert Services Support Team</p>
      </div>
    </div>
  `;

  await Promise.all([
    sendEmail(NOTIFICATION_EMAIL, `New Client Ticket: ${esc(ticket.subject)}`, adminHtml),
    sendEmail(userEmail, `Support Ticket Submitted: ${ticket.subject}`, confirmHtml),
  ]);
}
