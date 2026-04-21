import PDFDocument from "pdfkit";
import type { WrittenPlan } from "@workspace/db";

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

export async function generatePlanPdf(plan: WrittenPlan): Promise<Buffer> {
  const doc = new PDFDocument({ size: "LETTER", margins: { top: 60, bottom: 60, left: 60, right: 60 } });

  const content = (plan.planContent as any) || {};
  const NAVY = "#032d60";
  const BLUE = "#0176d3";
  const GRAY = "#64748b";
  const LIGHT = "#f8fafc";
  const BLACK = "#111827";

  // ─── Header ─────────────────────────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 80).fill(NAVY);
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(20)
    .text("Siebert Services", 60, 24);
  doc.font("Helvetica").fontSize(10).fillColor("rgba(255,255,255,0.7)")
    .text("IT Assessment & Written Plan", 60, 48);
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10)
    .text(plan.planNumber, doc.page.width - 160, 30, { width: 100, align: "right" });
  doc.font("Helvetica").fontSize(9).fillColor("rgba(255,255,255,0.7)")
    .text(`Version ${plan.version}`, doc.page.width - 160, 46, { width: 100, align: "right" });

  doc.moveDown(4);

  // ─── Client Info ─────────────────────────────────────────────────────────
  const infoY = 100;
  doc.rect(60, infoY, doc.page.width - 120, 70).fill(LIGHT).stroke("#e2e8f0");
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(11)
    .text("Prepared For:", 80, infoY + 12);
  doc.fillColor(BLACK).font("Helvetica-Bold").fontSize(13)
    .text(plan.clientCompany, 80, infoY + 27);
  doc.fillColor(GRAY).font("Helvetica").fontSize(10)
    .text(`${plan.clientName}${plan.clientTitle ? `, ${plan.clientTitle}` : ""}  ·  ${plan.clientEmail}`, 80, infoY + 44);

  doc.fillColor(GRAY).font("Helvetica").fontSize(9)
    .text(`Created: ${formatDate(plan.createdAt)}`, doc.page.width - 200, infoY + 12, { width: 140, align: "right" });
  if (plan.expiresAt) {
    doc.text(`Valid until: ${formatDate(plan.expiresAt)}`, doc.page.width - 200, infoY + 26, { width: 140, align: "right" });
  }

  doc.y = infoY + 85;

  // ─── Section Helper ───────────────────────────────────────────────────────
  function section(title: string) {
    if (doc.y > doc.page.height - 140) doc.addPage();
    doc.moveDown(0.5);
    doc.rect(60, doc.y, doc.page.width - 120, 22).fill(BLUE);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(11)
      .text(title.toUpperCase(), 68, doc.y - 17);
    doc.fillColor(BLACK).y += 8;
  }

  function bodyText(text: string) {
    doc.fillColor(BLACK).font("Helvetica").fontSize(10).text(text, 60, doc.y, { width: doc.page.width - 120, align: "justify" });
    doc.moveDown(0.5);
  }

  // ─── Executive Summary ───────────────────────────────────────────────────
  section("Executive Summary");
  doc.moveDown(0.3);
  bodyText(content.executiveSummary || "No summary provided.");

  // ─── Current Environment ─────────────────────────────────────────────────
  section("Current Environment");
  doc.moveDown(0.3);
  bodyText(content.currentEnvironment || "No current environment details provided.");

  // ─── Key Findings ────────────────────────────────────────────────────────
  section("Key Findings");
  doc.moveDown(0.3);
  const findings: string[] = Array.isArray(content.keyFindings) ? content.keyFindings : [];
  for (const f of findings) {
    doc.fillColor(BLUE).font("Helvetica-Bold").fontSize(10).text("▪", 60, doc.y, { continued: true });
    doc.fillColor(BLACK).font("Helvetica").text("  " + f, { width: doc.page.width - 120 });
    doc.moveDown(0.25);
  }
  if (findings.length === 0) bodyText("No key findings recorded.");

  // ─── Recommended Services ────────────────────────────────────────────────
  section("Recommended Services");
  doc.moveDown(0.3);
  const services: { service: string; description: string }[] = Array.isArray(content.recommendedServices) ? content.recommendedServices : [];
  for (const s of services) {
    if (doc.y > doc.page.height - 100) doc.addPage();
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(11).text(s.service, 60, doc.y, { width: doc.page.width - 120 });
    doc.fillColor(GRAY).font("Helvetica").fontSize(10).text(s.description, 60, doc.y, { width: doc.page.width - 120 });
    doc.moveDown(0.6);
  }

  // ─── Next Steps ──────────────────────────────────────────────────────────
  section("Next Steps");
  doc.moveDown(0.3);
  const steps: string[] = Array.isArray(content.nextSteps) ? content.nextSteps : [];
  steps.forEach((step, i) => {
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text(`${i + 1}.`, 60, doc.y, { continued: true, width: 20 });
    doc.fillColor(BLACK).font("Helvetica").text("  " + step, { width: doc.page.width - 120 });
    doc.moveDown(0.3);
  });

  // ─── Signature Block ─────────────────────────────────────────────────────
  if (plan.status === "approved" && plan.signerName) {
    if (doc.y > doc.page.height - 200) doc.addPage();
    section("Approval & Signature");
    doc.moveDown(0.5);

    const sigY = doc.y;
    doc.rect(60, sigY, doc.page.width - 120, 1).fill("#e2e8f0");
    doc.y = sigY + 10;

    if (plan.signatureImage && plan.signatureImage.startsWith("data:image/png;base64,")) {
      try {
        const base64Data = plan.signatureImage.replace("data:image/png;base64,", "");
        const imgBuffer = Buffer.from(base64Data, "base64");
        doc.image(imgBuffer, 60, doc.y, { width: 200, height: 70 });
        doc.y += 80;
      } catch {
        doc.y += 10;
      }
    }

    doc.fillColor(BLACK).font("Helvetica-Bold").fontSize(10)
      .text(plan.signerName, 60, doc.y);
    if (plan.signerTitle) {
      doc.fillColor(GRAY).font("Helvetica").fontSize(9).text(plan.signerTitle, 60, doc.y);
    }
    doc.fillColor(GRAY).font("Helvetica").fontSize(9)
      .text(plan.clientCompany, 60, doc.y);
    doc.moveDown(0.3);
    doc.fillColor(GRAY).font("Helvetica").fontSize(9)
      .text(`Digitally signed on ${formatDate(plan.approvedAt)}`, 60, doc.y);
  }

  // ─── Footer ──────────────────────────────────────────────────────────────
  const footerY = doc.page.height - 40;
  doc.rect(0, footerY - 5, doc.page.width, 45).fill(LIGHT);
  doc.fillColor(GRAY).font("Helvetica").fontSize(8)
    .text("Siebert Services LLC  ·  866-484-9180  ·  siebertrservices.com", 60, footerY, { width: doc.page.width - 120, align: "center" });
  doc.text(`Plan ${plan.planNumber}  ·  Confidential`, 60, footerY + 12, { width: doc.page.width - 120, align: "center" });

  return bufferDoc(doc);
}
