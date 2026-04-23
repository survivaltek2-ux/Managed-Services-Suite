import PDFDocument from "pdfkit";
import type { WrittenPlan } from "@workspace/db";
import {
  SERVICE_LEVELS, CLIENT_RESPONSIBILITIES, ASSUMPTIONS,
  CONFIDENTIALITY_TEXT, TERMS_TEXT, ACCEPTANCE_TEXT,
  investmentSummaryText, validityNotice,
} from "@workspace/db";

function bufferDoc(doc: InstanceType<typeof PDFDocument>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const MARGIN = 72;        // 1 inch margins (legal-document standard)
const NAVY = "#0a2540";
const ACCENT = "#0176d3";
const GRAY = "#5b6573";
const LIGHT_GRAY = "#94a3b8";
const RULE = "#cbd5e1";
const BLACK = "#0f172a";

export async function generatePlanPdf(plan: WrittenPlan): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: MARGIN, bottom: MARGIN + 24, left: MARGIN, right: MARGIN },
    bufferPages: true, // needed for "Page X of Y"
  });

  interface PlanContent {
    executiveSummary?: string;
    currentEnvironment?: string;
    keyFindings?: string[];
    recommendedServices?: { service: string; description: string }[];
    recommendedProducts?: { vendor: string; product: string; category: string; rationale: string }[];
    nextSteps?: string[];
  }
  const content = (plan.planContent as PlanContent | null) ?? {};
  const pageW = doc.page.width;
  const contentW = pageW - MARGIN * 2;

  // ─── Cover Page ────────────────────────────────────────────────────────────
  // Top navy band
  doc.rect(0, 0, pageW, 14).fill(NAVY);

  // Brand mark
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(22)
    .text("SIEBERT SERVICES", MARGIN, 110);
  doc.fillColor(GRAY).font("Helvetica").fontSize(10.5)
    .text("Managed IT  ·  Cybersecurity  ·  Cloud  ·  Connectivity", MARGIN, 138);

  // Thin rule
  doc.moveTo(MARGIN, 168).lineTo(pageW - MARGIN, 168).lineWidth(0.5).strokeColor(RULE).stroke();

  // Document title
  doc.fillColor(NAVY).font("Times-Bold").fontSize(34)
    .text("IT Assessment", MARGIN, 220, { width: contentW, align: "left" });
  doc.fillColor(NAVY).font("Times-Bold").fontSize(34)
    .text("& Written Plan", MARGIN, 262, { width: contentW, align: "left" });

  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(11)
    .text(`Plan Reference: ${plan.planNumber}`, MARGIN, 322);

  // Prepared-for / prepared-by block
  const blockY = 400;
  doc.moveTo(MARGIN, blockY - 16).lineTo(pageW - MARGIN, blockY - 16).lineWidth(0.5).strokeColor(RULE).stroke();

  doc.fillColor(GRAY).font("Helvetica").fontSize(9)
    .text("PREPARED FOR", MARGIN, blockY, { characterSpacing: 1.2 });
  doc.fillColor(BLACK).font("Times-Bold").fontSize(15)
    .text(plan.clientCompany, MARGIN, blockY + 16);
  doc.fillColor(BLACK).font("Times-Roman").fontSize(11)
    .text(`${plan.clientName}${plan.clientTitle ? `, ${plan.clientTitle}` : ""}`, MARGIN, blockY + 38);
  doc.fillColor(GRAY).font("Times-Italic").fontSize(10)
    .text(plan.clientEmail, MARGIN, blockY + 54);

  doc.fillColor(GRAY).font("Helvetica").fontSize(9)
    .text("PREPARED BY", pageW / 2, blockY, { characterSpacing: 1.2 });
  doc.fillColor(BLACK).font("Times-Bold").fontSize(15)
    .text("Siebert Services LLC", pageW / 2, blockY + 16);
  doc.fillColor(BLACK).font("Times-Roman").fontSize(11)
    .text("866-484-9180", pageW / 2, blockY + 38);
  doc.fillColor(GRAY).font("Times-Italic").fontSize(10)
    .text("siebertrservices.com", pageW / 2, blockY + 54);

  doc.moveTo(MARGIN, blockY + 88).lineTo(pageW - MARGIN, blockY + 88).lineWidth(0.5).strokeColor(RULE).stroke();

  // Issue / validity / version block
  const metaY = blockY + 110;
  const colW = contentW / 3;
  const metaCol = (label: string, value: string, x: number) => {
    doc.fillColor(GRAY).font("Helvetica").fontSize(8.5)
      .text(label, x, metaY, { characterSpacing: 1.1, width: colW });
    doc.fillColor(BLACK).font("Times-Bold").fontSize(11)
      .text(value, x, metaY + 14, { width: colW });
  };
  metaCol("ISSUE DATE", formatDate(plan.createdAt), MARGIN);
  metaCol("VALID UNTIL", formatDate(plan.expiresAt), MARGIN + colW);
  metaCol("VERSION", String(plan.version ?? 1), MARGIN + colW * 2);

  // Confidential notice — bottom of cover
  const noticeY = doc.page.height - 170;
  doc.rect(MARGIN, noticeY, contentW, 90).lineWidth(0.5).strokeColor(RULE).stroke();
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10)
    .text("CONFIDENTIAL & PROPRIETARY", MARGIN + 16, noticeY + 14, { characterSpacing: 1.3 });
  doc.fillColor(BLACK).font("Times-Roman").fontSize(9.5)
    .text(
      "This document contains confidential and proprietary information of Siebert Services LLC and the named recipient. " +
      "It is provided solely for the purpose of evaluating a potential engagement and may not be reproduced, distributed, " +
      "or disclosed to any third party without the prior written consent of Siebert Services LLC.",
      MARGIN + 16, noticeY + 32, { width: contentW - 32, align: "justify", lineGap: 1.5 }
    );

  // ─── Body Pages ────────────────────────────────────────────────────────────
  doc.addPage();

  // Section helper — numbered, restrained styling
  let sectionNum = 0;
  function section(title: string) {
    if (doc.y > doc.page.height - 110) doc.addPage();
    else doc.moveDown(1.0);
    sectionNum += 1;
    const top = doc.y;

    // Number circle
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13)
      .text(`${sectionNum}.`, MARGIN, top, { continued: true, lineBreak: false });
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13)
      .text(`  ${title.toUpperCase()}`, { characterSpacing: 1.2, lineBreak: false });

    // Underline rule
    const ruleY = top + 20;
    doc.moveTo(MARGIN, ruleY).lineTo(pageW - MARGIN, ruleY).lineWidth(0.75).strokeColor(NAVY).stroke();
    doc.moveTo(MARGIN, ruleY + 2).lineTo(MARGIN + 36, ruleY + 2).lineWidth(1.25).strokeColor(ACCENT).stroke();

    doc.x = MARGIN;
    doc.y = ruleY + 12;
    doc.fillColor(BLACK).font("Times-Roman").fontSize(10.5);
  }

  function bodyText(text: string) {
    doc.fillColor(BLACK).font("Times-Roman").fontSize(10.5)
      .text(text, MARGIN, doc.y, { width: contentW, align: "justify", lineGap: 2 });
    doc.moveDown(0.4);
  }

  function bullet(text: string) {
    if (doc.y > doc.page.height - 120) doc.addPage();
    const startY = doc.y;
    doc.fillColor(ACCENT).font("Times-Bold").fontSize(10.5)
      .text("•", MARGIN, startY, { width: 12, lineBreak: false });
    doc.fillColor(BLACK).font("Times-Roman").fontSize(10.5)
      .text(text, MARGIN + 14, startY, { width: contentW - 14, align: "left", lineGap: 1.5 });
    doc.moveDown(0.25);
  }

  // ─── 1. Executive Summary ─────────────────────────────────────────────────
  section("Executive Summary");
  bodyText(content.executiveSummary || "No summary provided.");

  // ─── 2. Current Environment ───────────────────────────────────────────────
  section("Current Environment");
  bodyText(content.currentEnvironment || "No current environment details provided.");

  // ─── 3. Key Findings ──────────────────────────────────────────────────────
  section("Key Findings");
  const findings: string[] = Array.isArray(content.keyFindings) ? content.keyFindings : [];
  if (findings.length === 0) bodyText("No key findings recorded.");
  for (const f of findings) bullet(f);

  // ─── 4. Recommended Services ──────────────────────────────────────────────
  section("Recommended Services");
  const services: { service: string; description: string }[] = Array.isArray(content.recommendedServices) ? content.recommendedServices : [];
  for (const s of services) {
    if (doc.y > doc.page.height - 130) doc.addPage();
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(11)
      .text(s.service, MARGIN, doc.y, { width: contentW });
    doc.moveDown(0.15);
    doc.fillColor(BLACK).font("Times-Roman").fontSize(10.5)
      .text(s.description, MARGIN, doc.y, { width: contentW, align: "justify", lineGap: 1.5 });
    doc.moveDown(0.55);
  }

  // ─── 5. Recommended Products ──────────────────────────────────────────────
  const products: { vendor: string; product: string; category: string; rationale: string }[] =
    Array.isArray(content.recommendedProducts) ? content.recommendedProducts : [];
  if (products.length > 0) {
    section("Recommended Products");

    // Group products by category for cleaner reading
    const byCategory = new Map<string, typeof products>();
    for (const p of products) {
      const cat = p.category || "Other";
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat)!.push(p);
    }

    for (const [category, items] of byCategory) {
      if (doc.y > doc.page.height - 140) doc.addPage();
      doc.fillColor(GRAY).font("Helvetica-Bold").fontSize(9)
        .text(category.toUpperCase(), MARGIN, doc.y, { characterSpacing: 1.1, width: contentW });
      doc.moveDown(0.2);
      for (const p of items) {
        if (doc.y > doc.page.height - 130) doc.addPage();
        doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10.5)
          .text(p.vendor, MARGIN, doc.y, { width: contentW, continued: true })
          .fillColor(BLACK).font("Times-Roman").fontSize(10.5)
          .text(`  —  ${p.product}`, { width: contentW });
        doc.moveDown(0.1);
        doc.fillColor(BLACK).font("Times-Roman").fontSize(10)
          .text(p.rationale, MARGIN, doc.y, { width: contentW, align: "justify", lineGap: 1.5 });
        doc.moveDown(0.45);
      }
      doc.moveDown(0.2);
    }
  }

  // ─── 6. Service Levels ────────────────────────────────────────────────────
  section("Service Levels");
  for (const sl of SERVICE_LEVELS) {
    if (doc.y > doc.page.height - 120) doc.addPage();
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10.5)
      .text(sl.tier, MARGIN, doc.y, { width: contentW });
    doc.fillColor(GRAY).font("Times-Italic").fontSize(10)
      .text(sl.target, MARGIN, doc.y, { width: contentW, lineGap: 1.5 });
    doc.moveDown(0.4);
  }

  // ─── 6. Investment Summary ────────────────────────────────────────────────
  section("Investment Summary");
  bodyText(investmentSummaryText((plan.questionnaireAnswers as Record<string, unknown>) ?? {}));

  // ─── 7. Client Responsibilities ───────────────────────────────────────────
  section("Client Responsibilities");
  for (const r of CLIENT_RESPONSIBILITIES) bullet(r);

  // ─── 8. Assumptions ───────────────────────────────────────────────────────
  section("Assumptions");
  for (const a of ASSUMPTIONS) bullet(a);

  // ─── 9. Next Steps ────────────────────────────────────────────────────────
  section("Next Steps");
  const steps: string[] = Array.isArray(content.nextSteps) ? content.nextSteps : [];
  steps.forEach((step, i) => {
    if (doc.y > doc.page.height - 120) doc.addPage();
    const y = doc.y;
    doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(10.5)
      .text(`${i + 1}.`, MARGIN, y, { width: 18, lineBreak: false });
    doc.fillColor(BLACK).font("Times-Roman").fontSize(10.5)
      .text(step, MARGIN + 20, y, { width: contentW - 20, lineGap: 1.5 });
    doc.moveDown(0.3);
  });

  // ─── 10. Plan Validity ────────────────────────────────────────────────────
  section("Plan Validity");
  bodyText(validityNotice(plan.validityDays ?? 30, plan.expiresAt));

  // ─── 11. Confidentiality ──────────────────────────────────────────────────
  section("Confidentiality");
  bodyText(CONFIDENTIALITY_TEXT);

  // ─── 12. Terms ────────────────────────────────────────────────────────────
  section("Terms");
  bodyText(TERMS_TEXT);

  // ─── 13. Acceptance ───────────────────────────────────────────────────────
  section("Acceptance");
  bodyText(ACCEPTANCE_TEXT);

  // ─── 14. Signatures (always present, with placeholders if unsigned) ───────
  if (doc.y > doc.page.height - 280) doc.addPage();
  // Don't double-paginate: only call section() if room exists; otherwise we
  // already addPage'd above.
  section("Signatures");

  doc.moveDown(0.5);
  const sigTop = doc.y;
  const colSpace = 30;
  const sigColW = (contentW - colSpace) / 2;
  const leftX = MARGIN;
  const rightX = MARGIN + sigColW + colSpace;

  // Column headers
  doc.fillColor(GRAY).font("Helvetica").fontSize(8.5)
    .text("CLIENT", leftX, sigTop, { characterSpacing: 1.3 });
  doc.fillColor(GRAY).font("Helvetica").fontSize(8.5)
    .text("SIEBERT SERVICES LLC", rightX, sigTop, { characterSpacing: 1.3 });

  // Signature image (client side, if signed)
  let sigImgBottom = sigTop + 30;
  if (plan.status === "approved" && plan.signatureImage && plan.signatureImage.startsWith("data:image/png;base64,")) {
    try {
      const base64Data = plan.signatureImage.replace("data:image/png;base64,", "");
      const imgBuffer = Buffer.from(base64Data, "base64");
      doc.image(imgBuffer, leftX, sigTop + 22, { fit: [sigColW - 10, 56] });
      sigImgBottom = sigTop + 22 + 56 + 6;
    } catch { /* ignore bad image */ }
  } else {
    sigImgBottom = sigTop + 80;
  }

  // Signature line
  const lineY = sigImgBottom;
  doc.moveTo(leftX, lineY).lineTo(leftX + sigColW, lineY).lineWidth(0.75).strokeColor(BLACK).stroke();
  doc.moveTo(rightX, lineY).lineTo(rightX + sigColW, lineY).lineWidth(0.75).strokeColor(BLACK).stroke();
  doc.fillColor(GRAY).font("Helvetica").fontSize(8).text("Signature", leftX, lineY + 4);
  doc.fillColor(GRAY).font("Helvetica").fontSize(8).text("Signature", rightX, lineY + 4);

  // Name field
  const nameY = lineY + 30;
  doc.fillColor(BLACK).font("Times-Bold").fontSize(11)
    .text(plan.signerName || plan.clientName || "", leftX, nameY, { width: sigColW });
  doc.fillColor(BLACK).font("Times-Bold").fontSize(11)
    .text("", rightX, nameY, { width: sigColW });
  doc.moveTo(leftX, nameY + 16).lineTo(leftX + sigColW, nameY + 16).lineWidth(0.4).strokeColor(LIGHT_GRAY).stroke();
  doc.moveTo(rightX, nameY + 16).lineTo(rightX + sigColW, nameY + 16).lineWidth(0.4).strokeColor(LIGHT_GRAY).stroke();
  doc.fillColor(GRAY).font("Helvetica").fontSize(8).text("Printed Name", leftX, nameY + 20);
  doc.fillColor(GRAY).font("Helvetica").fontSize(8).text("Printed Name", rightX, nameY + 20);

  // Title field
  const titleY = nameY + 46;
  doc.fillColor(BLACK).font("Times-Roman").fontSize(10.5)
    .text(plan.signerTitle || plan.clientTitle || "", leftX, titleY, { width: sigColW });
  doc.moveTo(leftX, titleY + 14).lineTo(leftX + sigColW, titleY + 14).lineWidth(0.4).strokeColor(LIGHT_GRAY).stroke();
  doc.moveTo(rightX, titleY + 14).lineTo(rightX + sigColW, titleY + 14).lineWidth(0.4).strokeColor(LIGHT_GRAY).stroke();
  doc.fillColor(GRAY).font("Helvetica").fontSize(8).text("Title", leftX, titleY + 18);
  doc.fillColor(GRAY).font("Helvetica").fontSize(8).text("Title", rightX, titleY + 18);

  // Date field
  const dateY = titleY + 44;
  doc.fillColor(BLACK).font("Times-Roman").fontSize(10.5)
    .text(plan.approvedAt ? formatDate(plan.approvedAt) : "", leftX, dateY, { width: sigColW });
  doc.moveTo(leftX, dateY + 14).lineTo(leftX + sigColW, dateY + 14).lineWidth(0.4).strokeColor(LIGHT_GRAY).stroke();
  doc.moveTo(rightX, dateY + 14).lineTo(rightX + sigColW, dateY + 14).lineWidth(0.4).strokeColor(LIGHT_GRAY).stroke();
  doc.fillColor(GRAY).font("Helvetica").fontSize(8).text("Date", leftX, dateY + 18);
  doc.fillColor(GRAY).font("Helvetica").fontSize(8).text("Date", rightX, dateY + 18);

  if (plan.status === "approved" && plan.approvedAt) {
    doc.moveDown(2);
    doc.fillColor(GRAY).font("Times-Italic").fontSize(9)
      .text(`Digitally signed on ${formatDate(plan.approvedAt)} via the Siebert Services secure plan-review portal.`,
        MARGIN, dateY + 50, { width: contentW, align: "center" });
  }

  // ─── Running headers + footers on every page (except cover) ────────────────
  const range = doc.bufferedPageRange();
  const total = range.count;
  for (let i = range.start; i < range.start + total; i++) {
    doc.switchToPage(i);
    // Disable auto-pagination on top/bottom margins for header/footer writes
    const originalBottom = doc.page.margins.bottom;
    const originalTop = doc.page.margins.top;
    doc.page.margins.bottom = 0;
    doc.page.margins.top = 0;

    if (i !== range.start) {
      // Top running header
      doc.fillColor(GRAY).font("Helvetica").fontSize(8)
        .text(`${plan.clientCompany}  ·  ${plan.planNumber}  ·  IT Assessment & Written Plan`,
          MARGIN, 36, { width: contentW, align: "left", lineBreak: false });
      doc.moveTo(MARGIN, 50).lineTo(pageW - MARGIN, 50).lineWidth(0.4).strokeColor(RULE).stroke();

      // Footer
      const fy = doc.page.height - 44;
      doc.moveTo(MARGIN, fy).lineTo(pageW - MARGIN, fy).lineWidth(0.4).strokeColor(RULE).stroke();
      doc.fillColor(GRAY).font("Helvetica").fontSize(8)
        .text("Siebert Services LLC  ·  Confidential & Proprietary", MARGIN, fy + 8,
          { width: contentW / 2, align: "left", lineBreak: false });
      doc.fillColor(GRAY).font("Helvetica").fontSize(8)
        .text(`Page ${i - range.start} of ${total - 1}`, MARGIN + contentW / 2, fy + 8,
          { width: contentW / 2, align: "right", lineBreak: false });
    }

    doc.page.margins.bottom = originalBottom;
    doc.page.margins.top = originalTop;
  }

  return bufferDoc(doc);
}
