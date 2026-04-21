import PDFDocument from "pdfkit";

export interface ContractParams {
  customerName: string;
  customerEmail: string;
  companyName: string;
  planName: string;
  planSlug: string;
  billingCycle: "monthly" | "annual" | string;
  pricePerUser: number;
  seats: number;
  subscriptionId: string;
  effectiveDate: Date;
}

const COMPANY_NAME = "Siebert Services LLC";
const COMPANY_ADDRESS = "New York, NY";
const COMPANY_PHONE = "866-484-9180";
const COMPANY_EMAIL = "contracts@siebertrservices.com";
const COMPANY_WEBSITE = "www.siebertrservices.com";

const PLAN_FEATURES: Record<string, string[]> = {
  essentials: [
    "Business-hours help desk (Monday–Friday, 8 AM – 5 PM ET)",
    "Remote monitoring and automated patch management",
    "Endpoint antivirus and threat prevention",
    "Microsoft 365 administration and license management",
    "Quarterly system health check reports",
    "Email and phone support",
  ],
  business: [
    "Extended-hours help desk (7 AM – 8 PM ET, Monday–Friday)",
    "Remote monitoring and automated patch management",
    "Endpoint Detection & Response (EDR)",
    "Microsoft 365 administration plus security hardening",
    "Multi-factor authentication rollout and enforcement",
    "Backup and disaster-recovery monitoring",
    "Quarterly business reviews with virtual CIO (vCIO)",
    "On-site dispatch (4 hours/month, New York only)",
  ],
  enterprise: [
    "24/7/365 help desk with dedicated emergency line",
    "Full Endpoint Detection & Response plus Managed SOC monitoring",
    "Microsoft 365 E3/E5 management",
    "MFA, conditional access, and SSO design",
    "Immutable backup with tested restores",
    "Compliance program management (HIPAA, SOC 2, CMMC)",
    "Named vCIO with monthly strategy meetings",
    "Unlimited on-site dispatch (New York only)",
    "Dedicated account team",
  ],
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generateMSAContract(params: ContractParams): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ margin: 60, size: "LETTER" });
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const {
      customerName,
      customerEmail,
      companyName,
      planName,
      planSlug,
      billingCycle,
      pricePerUser,
      seats,
      subscriptionId,
      effectiveDate,
    } = params;

    const totalMonthly = pricePerUser * seats;
    const billingLabel = billingCycle === "annual" ? "annual" : "monthly";
    const intervalLabel = billingCycle === "annual" ? "year" : "month";
    const features = PLAN_FEATURES[planSlug.toLowerCase()] || PLAN_FEATURES["essentials"];

    const BLUE = "#032d60";
    const LIGHT_BLUE = "#0176d3";
    const GRAY = "#444";
    const LIGHT_GRAY = "#777";
    const LINE_GRAY = "#cccccc";
    const pageWidth = doc.page.width - 120;
    const bottomLimit = () => doc.page.height - doc.page.margins.bottom;
    const ensureSpace = (needed: number) => {
      if (doc.y + needed > bottomLimit()) {
        doc.addPage();
      }
    };

    // ── Header ──────────────────────────────────────────────────────────────
    doc
      .rect(0, 0, doc.page.width, 90)
      .fill(BLUE);

    doc
      .fillColor("#ffffff")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("SIEBERT SERVICES", 60, 28, { lineBreak: false });

    doc
      .fillColor("#7ec8e3")
      .fontSize(10)
      .font("Helvetica")
      .text("MANAGED SERVICES AGREEMENT", 60, 56);

    doc
      .fillColor("#ffffff")
      .fontSize(9)
      .text(`${COMPANY_WEBSITE}  |  ${COMPANY_PHONE}`, doc.page.width - 250, 56, {
        width: 190,
        align: "right",
      });

    doc.moveDown(4);

    // ── Document title ────────────────────────────────────────────────────────
    doc
      .fillColor(BLUE)
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Managed Services Agreement", 60, doc.y, { align: "center" });

    doc.moveDown(0.4);

    doc
      .fillColor(LIGHT_GRAY)
      .fontSize(9)
      .font("Helvetica")
      .text(
        `Agreement Reference: MSA-${subscriptionId.replace("sub_", "").slice(0, 12).toUpperCase()}  |  Effective: ${formatDate(effectiveDate)}`,
        60,
        doc.y,
        { align: "center" }
      );

    doc.moveDown(1.2);
    doc.moveTo(60, doc.y).lineTo(60 + pageWidth, doc.y).strokeColor(LINE_GRAY).lineWidth(1).stroke();
    doc.moveDown(1);

    // ── Parties ───────────────────────────────────────────────────────────────
    doc
      .fillColor(BLUE)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("PARTIES TO THIS AGREEMENT");

    doc.moveDown(0.5);

    const colW = pageWidth / 2 - 10;
    const leftX = 60;
    const rightX = 60 + colW + 20;
    const partyY = doc.y;

    // Provider box
    doc.rect(leftX, partyY, colW, 80).fillAndStroke("#f0f4f8", LINE_GRAY);
    doc
      .fillColor(BLUE)
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("SERVICE PROVIDER", leftX + 10, partyY + 10);
    doc
      .fillColor(GRAY)
      .fontSize(9)
      .font("Helvetica-Bold")
      .text(COMPANY_NAME, leftX + 10, partyY + 24);
    doc
      .fillColor(LIGHT_GRAY)
      .fontSize(8)
      .font("Helvetica")
      .text(`${COMPANY_ADDRESS}\n${COMPANY_EMAIL}\n${COMPANY_PHONE}`, leftX + 10, partyY + 38);

    // Customer box
    doc.rect(rightX, partyY, colW, 80).fillAndStroke("#f0f8f4", LINE_GRAY);
    doc
      .fillColor(BLUE)
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("CLIENT", rightX + 10, partyY + 10);
    doc
      .fillColor(GRAY)
      .fontSize(9)
      .font("Helvetica-Bold")
      .text(companyName || customerName, rightX + 10, partyY + 24);
    doc
      .fillColor(LIGHT_GRAY)
      .fontSize(8)
      .font("Helvetica")
      .text(`${customerName}\n${customerEmail}`, rightX + 10, partyY + 38);

    doc.y = partyY + 94;
    doc.moveDown(1);

    // ── Plan Summary ──────────────────────────────────────────────────────────
    doc.moveTo(60, doc.y).lineTo(60 + pageWidth, doc.y).strokeColor(LINE_GRAY).lineWidth(1).stroke();
    doc.moveDown(0.8);

    doc
      .fillColor(BLUE)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("SERVICE PLAN & BILLING SUMMARY");

    doc.moveDown(0.5);

    const tableY = doc.y;
    const rows = [
      ["Service Plan", `${planName} Plan`],
      ["Billing Cycle", billingLabel.charAt(0).toUpperCase() + billingLabel.slice(1)],
      ["Rate per User", `${formatCurrency(pricePerUser)} / ${intervalLabel}`],
      ["Number of Seats (Users)", `${seats}`],
      ["Total Recurring Charge", `${formatCurrency(totalMonthly)} / ${intervalLabel}`],
      ["Effective Date", formatDate(effectiveDate)],
      ["Auto-Renewal", "Yes — renews automatically unless canceled in writing 30 days prior"],
    ];

    rows.forEach(([label, value], i) => {
      const rowY = tableY + i * 22;
      if (i % 2 === 0) {
        doc.rect(60, rowY, pageWidth, 22).fill("#f5f7fa");
      }
      doc
        .fillColor(GRAY)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(label, 68, rowY + 7, { width: 160, lineBreak: false });
      doc
        .fillColor(GRAY)
        .fontSize(9)
        .font("Helvetica")
        .text(value, 240, rowY + 7, { width: pageWidth - 185 });
    });

    doc.y = tableY + rows.length * 22 + 12;
    doc.moveDown(1);

    // ── Services Included ─────────────────────────────────────────────────────
    doc.moveTo(60, doc.y).lineTo(60 + pageWidth, doc.y).strokeColor(LINE_GRAY).lineWidth(1).stroke();
    doc.moveDown(0.8);

    doc
      .fillColor(BLUE)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("SERVICES INCLUDED");

    doc.moveDown(0.5);

    doc
      .fillColor(GRAY)
      .fontSize(9)
      .font("Helvetica")
      .text(
        `The following managed IT services are included under the ${planName} Plan:`,
        60,
        doc.y
      );

    doc.moveDown(0.4);

    features.forEach((feature) => {
      doc
        .fillColor(LIGHT_BLUE)
        .fontSize(9)
        .text("▸", 68, doc.y, { width: 12, lineBreak: false });
      doc
        .fillColor(GRAY)
        .fontSize(9)
        .font("Helvetica")
        .text(feature, 82, doc.y - 9, { width: pageWidth - 30 });
      doc.moveDown(0.15);
    });

    doc.moveDown(0.8);

    // ── Terms and Conditions ──────────────────────────────────────────────────
    doc.moveTo(60, doc.y).lineTo(60 + pageWidth, doc.y).strokeColor(LINE_GRAY).lineWidth(1).stroke();
    doc.moveDown(0.8);

    doc
      .fillColor(BLUE)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("TERMS AND CONDITIONS");

    doc.moveDown(0.5);

    const terms: Array<{ title: string; body: string }> = [
      {
        title: "1. Payment Terms",
        body: `Client agrees to pay ${formatCurrency(totalMonthly)} per ${intervalLabel} for ${seats} user seat(s) under the ${planName} Plan. Payment is due at the start of each billing period. Payments are processed automatically via credit card on file through Stripe. All fees are non-refundable except as required by applicable law. Siebert Services reserves the right to suspend services upon non-payment after a ten (10) day cure period.`,
      },
      {
        title: "2. Service Term & Renewal",
        body: `This Agreement commences on ${formatDate(effectiveDate)} and continues on a ${billingLabel} basis. It will renew automatically at the end of each billing period unless either party provides written notice of cancellation at least thirty (30) calendar days prior to the next renewal date. Cancellation requests must be submitted via email to ${COMPANY_EMAIL}.`,
      },
      {
        title: "3. Service Level",
        body:
          "Siebert Services will use commercially reasonable efforts to maintain service availability. For after-hours emergencies on plans that include 24/7 coverage, response time targets are set forth in the applicable plan documentation. Siebert Services shall not be liable for service interruptions caused by force majeure, Client-side infrastructure failures, or third-party platform outages (including Microsoft 365, internet service providers, or cloud providers).",
      },
      {
        title: "4. Client Responsibilities",
        body:
          "Client shall (a) provide timely access to systems, devices, and network infrastructure required to deliver services; (b) maintain valid software licenses for all applications in use; (c) designate a primary point of contact; and (d) promptly notify Siebert Services of any security incidents, suspected breaches, or unauthorized access.",
      },
      {
        title: "5. Confidentiality",
        body:
          "Each party agrees to keep the other's Confidential Information strictly confidential and not to disclose it to third parties without prior written consent. Confidential Information excludes information that is publicly known, independently developed, or lawfully obtained from a third party. This obligation survives termination of the Agreement for a period of three (3) years.",
      },
      {
        title: "6. Data Privacy",
        body:
          "Siebert Services will handle any personal data accessed in the course of providing services in accordance with applicable privacy laws, including the New York SHIELD Act. Client retains ownership of all Client data. Siebert Services will not sell, rent, or share Client data with third parties except as necessary to deliver the contracted services.",
      },
      {
        title: "7. Limitation of Liability",
        body:
          "TO THE MAXIMUM EXTENT PERMITTED BY LAW, SIEBERT SERVICES' TOTAL CUMULATIVE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT SHALL NOT EXCEED THE TOTAL FEES PAID BY CLIENT IN THE THREE (3) MONTHS PRECEDING THE CLAIM. IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, EVEN IF ADVISED OF THE POSSIBILITY THEREOF.",
      },
      {
        title: "8. Termination for Cause",
        body:
          "Either party may terminate this Agreement immediately upon written notice if the other party materially breaches this Agreement and fails to cure such breach within fifteen (15) days of written notice. Siebert Services may terminate immediately if Client engages in fraudulent activity, illegal use of services, or non-payment beyond thirty (30) days.",
      },
      {
        title: "9. Governing Law & Dispute Resolution",
        body:
          "This Agreement shall be governed by and construed in accordance with the laws of the State of New York, without regard to conflict-of-law principles. Any dispute arising from this Agreement shall first be submitted to good-faith mediation. If mediation fails, disputes shall be resolved by binding arbitration in New York County, New York, under the rules of the American Arbitration Association.",
      },
      {
        title: "10. Entire Agreement",
        body:
          "This Agreement, together with any applicable order forms or statements of work, constitutes the entire agreement between the parties with respect to its subject matter and supersedes all prior agreements, representations, and understandings. This Agreement may only be modified by a written instrument signed by authorized representatives of both parties.",
      },
    ];

    terms.forEach(({ title, body }) => {
      const estimated = 30 + doc.heightOfString(body, { width: pageWidth, align: "justify" }) + 16;
      ensureSpace(estimated);

      doc
        .fillColor(BLUE)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(title, 60, doc.y);

      doc.moveDown(0.2);

      doc
        .fillColor(GRAY)
        .fontSize(8.5)
        .font("Helvetica")
        .text(body, 60, doc.y, { width: pageWidth, align: "justify" });

      doc.moveDown(0.7);
    });

    // ── Acceptance ────────────────────────────────────────────────────────────
    ensureSpace(140);

    doc.moveDown(0.5);
    doc.moveTo(60, doc.y).lineTo(60 + pageWidth, doc.y).strokeColor(LINE_GRAY).lineWidth(1).stroke();
    doc.moveDown(0.8);

    doc
      .fillColor(BLUE)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("ACCEPTANCE");

    doc.moveDown(0.5);

    doc
      .fillColor(GRAY)
      .fontSize(9)
      .font("Helvetica")
      .text(
        `By completing payment for the ${planName} Plan subscription on ${formatDate(effectiveDate)}, Client acknowledges that they have read, understood, and agree to be bound by all terms of this Managed Services Agreement. Electronic acceptance via payment constitutes a legally binding signature under the Electronic Signatures in Global and National Commerce Act (E-SIGN Act).`,
        60,
        doc.y,
        { width: pageWidth, align: "justify" }
      );

    doc.moveDown(1.5);

    const sigY = doc.y;
    const sigColW = pageWidth / 2 - 20;

    // Service Provider signature block
    doc.moveTo(60, sigY + 40).lineTo(60 + sigColW, sigY + 40).strokeColor(GRAY).lineWidth(0.5).stroke();
    doc
      .fillColor(GRAY)
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("SIEBERT SERVICES LLC — Authorized Representative", 60, sigY + 44);
    doc
      .fillColor(LIGHT_GRAY)
      .fontSize(8)
      .font("Helvetica")
      .text("Signature / Accepted by System on Execution Date", 60, sigY + 56);

    // Client signature block
    const sigRightX = 60 + sigColW + 40;
    doc.moveTo(sigRightX, sigY + 40).lineTo(sigRightX + sigColW, sigY + 40).strokeColor(GRAY).lineWidth(0.5).stroke();
    doc
      .fillColor(GRAY)
      .fontSize(8)
      .font("Helvetica-Bold")
      .text(`CLIENT — ${companyName || customerName}`, sigRightX, sigY + 44);
    doc
      .fillColor(LIGHT_GRAY)
      .fontSize(8)
      .font("Helvetica")
      .text(`Accepted by: ${customerName} (${customerEmail})`, sigRightX, sigY + 56);

    doc.y = sigY + 70;
    doc.moveDown(1.5);

    // ── Footer ────────────────────────────────────────────────────────────────
    doc.moveTo(60, doc.y).lineTo(60 + pageWidth, doc.y).strokeColor(LINE_GRAY).lineWidth(0.5).stroke();
    doc.moveDown(0.5);

    doc
      .fillColor(LIGHT_GRAY)
      .fontSize(7.5)
      .font("Helvetica")
      .text(
        `Siebert Services LLC  •  ${COMPANY_ADDRESS}  •  ${COMPANY_PHONE}  •  ${COMPANY_EMAIL}`,
        60,
        doc.y,
        { width: pageWidth, align: "center" }
      );

    doc.moveDown(0.3);

    doc
      .fillColor(LIGHT_GRAY)
      .fontSize(7.5)
      .text(
        `Subscription ID: ${subscriptionId}  •  Generated: ${formatDate(new Date())}`,
        60,
        doc.y,
        { width: pageWidth, align: "center" }
      );

    doc.end();
  });
}
