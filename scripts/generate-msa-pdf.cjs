#!/usr/bin/env node
/**
 * Siebert Services — MSA PDF Generator
 *
 * This script is the CANONICAL source for the MSA PDF.
 *
 * Usage:
 *   node scripts/generate-msa-pdf.cjs [output-path]
 *
 * Requires pdfkit:
 *   npm install pdfkit     (or: cd /tmp/pdf-gen && npm install pdfkit)
 *
 * Output defaults to: attached_assets/contracts/siebert-msa.pdf
 */

"use strict";

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const OUTPUT_PATH = process.argv[2] ||
  path.join(__dirname, "../attached_assets/contracts/siebert-msa.pdf");

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

// Optional placeholder substitutions. When MSA_VALUES_FILE points to a JSON
// file mapping bracketed placeholder text (e.g. "CUSTOMER LEGAL NAME") to its
// real value, the placeholder() / inlinePlaceholder() helpers below will use
// the substituted value instead of emitting "[PLACEHOLDER TEXT]".
let PLACEHOLDER_VALUES = {};
if (process.env.MSA_VALUES_FILE) {
  try {
    PLACEHOLDER_VALUES = JSON.parse(fs.readFileSync(process.env.MSA_VALUES_FILE, "utf8"));
  } catch (e) {
    console.error("[generate-msa-pdf] Failed to read MSA_VALUES_FILE:", e.message);
    process.exit(1);
  }
}

const COLORS = {
  navy: "#0a1628",
  navyMed: "#1a3a5c",
  blue: "#1e56a0",
  gray: "#4b5563",
  lightGray: "#9ca3af",
  rule: "#d1d5db",
  highlight: "#f0f4ff",
  white: "#ffffff",
  placeholder: "#1e56a0",
};

const FONTS = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
  italic: "Helvetica-Oblique",
  boldItalic: "Helvetica-BoldOblique",
};

const PAGE = { margin: 72, width: 612, height: 792 };
const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;

const doc = new PDFDocument({
  size: "LETTER",
  margins: { top: PAGE.margin, bottom: 80, left: PAGE.margin, right: PAGE.margin },
  info: {
    Title: "Siebert Services — Master Services Agreement",
    Author: "Siebert Services",
    Subject: "Managed Services Agreement — Managed IT Services",
    Keywords: "MSA, MSP, managed IT, contract, New York",
    CreationDate: new Date(),
  },
  autoFirstPage: false,
});

const stream = fs.createWriteStream(OUTPUT_PATH);
doc.pipe(stream);

let pageNumber = 0;

// pdfkit triggers a new page whenever the cursor passes the bottom margin.
// drawFooter() writes BELOW the regular content area, so we have to neutralise
// the bottom margin while drawing it — otherwise pdfkit would auto-add a page
// for every footer write, leaving the document peppered with blank pages.
function drawFooter() {
  const page = doc.page;
  const origBottom = page.margins.bottom;
  const savedY = doc.y;
  page.margins.bottom = 0;
  try {
    const y = PAGE.height - 54;
    doc.save()
      .moveTo(PAGE.margin, y)
      .lineTo(PAGE.width - PAGE.margin, y)
      .strokeColor(COLORS.rule)
      .lineWidth(0.5)
      .stroke()
      .restore();

    doc.font(FONTS.regular)
      .fontSize(8)
      .fillColor(COLORS.lightGray)
      .text("Siebert Services — Master Services Agreement", PAGE.margin, y + 6,
        { width: CONTENT_WIDTH / 2, align: "left", lineBreak: false });

    doc.font(FONTS.regular)
      .fontSize(8)
      .fillColor(COLORS.lightGray)
      .text(`Page ${pageNumber}`, PAGE.margin, y + 6,
        { width: CONTENT_WIDTH, align: "right", lineBreak: false });
  } finally {
    page.margins.bottom = origBottom;
    // Restore the cursor: drawFooter() writes near the bottom of the page,
    // which advances doc.y past the bottom margin and would cause every
    // subsequent text() call to trigger another auto-page-break.
    doc.y = savedY;
  }
}

// Hook into pdfkit's pageAdded event so that EVERY page (whether added
// explicitly via addPage() or auto-added because content overflowed) gets a
// footer drawn exactly once. This eliminates the need to call drawFooter()
// manually after each addPage().
doc.on("pageAdded", () => {
  pageNumber++;
  drawFooter();
});

function addPage() {
  // If we're already at the very top of a fresh page (e.g. content just
  // auto-broke), don't add another empty one.
  if (doc.y > PAGE.margin + 1) {
    doc.addPage();
  }
}

// Reserve `needed` pixels of vertical room; if the row wouldn't fit on the
// current page, force a page break before drawing it. Used to keep table rows
// and other multi-column blocks together.
function pageBreakIfNeeded(needed) {
  const maxY = PAGE.height - doc.page.margins.bottom;
  if (doc.y + needed > maxY) {
    doc.addPage();
  }
}

function hRule(color = COLORS.rule, weight = 0.5) {
  const x = PAGE.margin;
  const y = doc.y + 4;
  doc.moveTo(x, y).lineTo(PAGE.width - PAGE.margin, y)
    .strokeColor(color).lineWidth(weight).stroke();
  doc.moveDown(0.5);
}

function sectionHeading(text, level = 1) {
  if (level === 1) {
    doc.moveDown(0.8);
    const y = doc.y;
    doc.rect(PAGE.margin, y, CONTENT_WIDTH, 22)
      .fill(COLORS.navy);
    doc.font(FONTS.bold)
      .fontSize(11)
      .fillColor(COLORS.white)
      .text(text, PAGE.margin + 8, y + 5, { width: CONTENT_WIDTH - 16 });
    doc.moveDown(0.5);
  } else if (level === 2) {
    doc.moveDown(0.6);
    doc.font(FONTS.bold).fontSize(10).fillColor(COLORS.navyMed).text(text);
    doc.moveDown(0.1);
    hRule(COLORS.navyMed, 0.5);
  } else {
    doc.moveDown(0.4);
    doc.font(FONTS.bold).fontSize(9.5).fillColor(COLORS.gray).text(text);
    doc.moveDown(0.1);
  }
}

function bodyText(text, opts = {}) {
  doc.font(FONTS.regular)
    .fontSize(9.5)
    .fillColor(COLORS.gray)
    .text(text, PAGE.margin, doc.y, { width: CONTENT_WIDTH, align: "justify", ...opts });
  doc.moveDown(0.3);
}

function placeholder(text) {
  if (Object.prototype.hasOwnProperty.call(PLACEHOLDER_VALUES, text)) {
    const v = PLACEHOLDER_VALUES[text];
    if (v !== null && v !== undefined && String(v).length > 0) return String(v);
  }
  return `[${text}]`;
}

function inlinePlaceholder(text) {
  return placeholder(text);
}

function bulletList(items, indent = 0) {
  items.forEach(item => {
    const x = PAGE.margin + indent;
    const w = CONTENT_WIDTH - indent;
    doc.font(FONTS.regular).fontSize(9.5).fillColor(COLORS.gray)
      .text(`\u2022  ${item}`, x, doc.y, { width: w, indent: 12, align: "left" });
    doc.moveDown(0.15);
  });
  doc.moveDown(0.2);
}

function numberedList(items, indent = 0) {
  items.forEach((item, i) => {
    const x = PAGE.margin + indent;
    const w = CONTENT_WIDTH - indent;
    doc.font(FONTS.regular).fontSize(9.5).fillColor(COLORS.gray)
      .text(`${i + 1}.  ${item}`, x, doc.y, { width: w, indent: 18, align: "left" });
    doc.moveDown(0.15);
  });
  doc.moveDown(0.2);
}

function definitionRow(term, definition) {
  const termW = 140;
  const defX = PAGE.margin + termW + 8;
  const defW = CONTENT_WIDTH - termW - 8;
  const startY = doc.y;
  doc.font(FONTS.bold).fontSize(9.5).fillColor(COLORS.navyMed)
    .text(`"${term}"`, PAGE.margin, startY, { width: termW });
  const termEndY = doc.y;
  doc.font(FONTS.regular).fontSize(9.5).fillColor(COLORS.gray)
    .text(definition, defX, startY, { width: defW });
  const defEndY = doc.y;
  doc.y = Math.max(termEndY, defEndY) + 4;
  doc.moveDown(0.1);
}

function tableRow(cols, widths, isHeader = false, shade = false) {
  const rowH = isHeader ? 20 : 18;
  // Reserve room for the row + the divider line beneath it. Without this, a
  // row drawn near the bottom margin causes each individual cell text() call
  // to trigger its own page break — splitting one row across multiple pages.
  pageBreakIfNeeded(rowH + 4);
  const startX = PAGE.margin;
  const startY = doc.y;

  if (shade) {
    doc.rect(startX, startY - 2, CONTENT_WIDTH, rowH)
      .fill(COLORS.highlight);
  }
  if (isHeader) {
    doc.rect(startX, startY - 2, CONTENT_WIDTH, rowH)
      .fill(COLORS.navy);
  }

  let x = startX + 4;
  cols.forEach((col, i) => {
    doc.font(isHeader ? FONTS.bold : FONTS.regular)
      .fontSize(isHeader ? 8.5 : 9)
      .fillColor(isHeader ? COLORS.white : COLORS.gray)
      .text(col, x, startY + (isHeader ? 3 : 1), { width: widths[i] - 8, lineBreak: false });
    x += widths[i];
  });

  doc.y = startY + rowH;

  doc.moveTo(startX, doc.y - 1)
    .lineTo(startX + CONTENT_WIDTH, doc.y - 1)
    .strokeColor(COLORS.rule).lineWidth(0.3).stroke();
}

function checkboxRow(label, checked = false) {
  const x = PAGE.margin;
  const y = doc.y;
  doc.rect(x, y + 1, 9, 9).strokeColor(COLORS.gray).lineWidth(0.5).stroke();
  if (checked) {
    doc.font(FONTS.bold).fontSize(8).fillColor(COLORS.blue)
      .text("✓", x + 1.5, y + 1.5, { width: 8 });
  }
  doc.font(FONTS.regular).fontSize(9.5).fillColor(COLORS.gray)
    .text(label, x + 16, y, { width: CONTENT_WIDTH - 16 });
  doc.moveDown(0.4);
}

function noticeBox(text, type = "info") {
  const bgColor = type === "warning" ? "#fff7ed" : "#eff6ff";
  const borderColor = type === "warning" ? "#f97316" : COLORS.blue;
  const startY = doc.y;
  doc.rect(PAGE.margin, startY, CONTENT_WIDTH, 1)
    .fill("transparent");

  const savedY = doc.y;
  doc.font(FONTS.italic).fontSize(9).fillColor(COLORS.gray)
    .text(text, PAGE.margin + 12, savedY + 8, { width: CONTENT_WIDTH - 24 });
  const endY = doc.y + 8;

  doc.rect(PAGE.margin, savedY, CONTENT_WIDTH, endY - savedY)
    .fillAndStroke(bgColor, borderColor);

  doc.rect(PAGE.margin, savedY, 3, endY - savedY).fill(borderColor);

  doc.font(FONTS.italic).fontSize(9).fillColor(COLORS.gray)
    .text(text, PAGE.margin + 12, savedY + 8, { width: CONTENT_WIDTH - 24 });

  doc.y = endY;
  doc.moveDown(0.5);
}

function signatureLine(label, wide = false) {
  const lineW = wide ? CONTENT_WIDTH : CONTENT_WIDTH / 2 - 20;
  doc.moveDown(0.5);
  doc.moveTo(PAGE.margin, doc.y + 16)
    .lineTo(PAGE.margin + lineW, doc.y + 16)
    .strokeColor(COLORS.rule).lineWidth(0.8).stroke();
  doc.font(FONTS.regular).fontSize(8).fillColor(COLORS.lightGray)
    .text(label, PAGE.margin, doc.y + 20, { width: lineW });
  doc.moveDown(1.2);
}

// ─────────────────────────────────────────────────────────────────────────────
// COVER PAGE
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage();

doc.rect(0, 0, PAGE.width, 260).fill(COLORS.navy);

doc.font(FONTS.bold).fontSize(22).fillColor(COLORS.white)
  .text("MASTER SERVICES AGREEMENT", PAGE.margin, 60,
    { width: CONTENT_WIDTH, align: "center" });

doc.font(FONTS.bold).fontSize(14).fillColor("#7eb8f5")
  .text("Managed IT Services Agreement", PAGE.margin, 94,
    { width: CONTENT_WIDTH, align: "center" });

doc.font(FONTS.regular).fontSize(10).fillColor("#a5c8f0")
  .text("Siebert Services  ·  Washingtonville, New York", PAGE.margin, 118,
    { width: CONTENT_WIDTH, align: "center" });

const boxY = 150;
doc.rect(PAGE.margin + 60, boxY, CONTENT_WIDTH - 120, 88)
  .fillAndStroke("#0f2545", "#2563eb");

const fields = [
  ["Customer Legal Name:", inlinePlaceholder("CUSTOMER LEGAL NAME")],
  ["Effective Date:", inlinePlaceholder("EFFECTIVE DATE")],
  ["Number of Seats:", inlinePlaceholder("NUMBER OF SEATS") + "  (min. 3)"],
  ["Service Tier:", inlinePlaceholder("ESSENTIALS / BUSINESS / ENTERPRISE")],
];

fields.forEach(([label, val], i) => {
  const fy = boxY + 10 + i * 19;
  doc.font(FONTS.bold).fontSize(8.5).fillColor("#7eb8f5")
    .text(label, PAGE.margin + 68, fy, { width: 130 });
  doc.font(FONTS.regular).fontSize(8.5).fillColor(COLORS.white)
    .text(val, PAGE.margin + 68 + 132, fy, { width: CONTENT_WIDTH - 120 - 140 });
});

doc.y = 280;

// Confidential notice
doc.rect(PAGE.margin, doc.y, CONTENT_WIDTH, 0.5).fill("#2563eb");
doc.moveDown(0.8);

doc.font(FONTS.bold).fontSize(10).fillColor(COLORS.navy)
  .text("AGREEMENT OVERVIEW", PAGE.margin, doc.y);
doc.moveDown(0.4);

const coverItems = [
  ["Service Provider", "Siebert Repair Services LLC d/b/a Siebert Services — Washingtonville, New York"],
  ["Customer", inlinePlaceholder("CUSTOMER LEGAL NAME")],
  ["Service Tier", inlinePlaceholder("ESSENTIALS / BUSINESS / ENTERPRISE") + " Plan"],
  ["Effective Date", inlinePlaceholder("EFFECTIVE DATE")],
  ["Contracted Seats", inlinePlaceholder("NUMBER OF SEATS") + "  (minimum 3)"],
  ["Document Sections", "Master Services Agreement · Schedules A–E · Optional Addenda"],
];

coverItems.forEach(([label, value], i) => {
  const rowY = doc.y;
  if (i % 2 === 0) doc.rect(PAGE.margin, rowY, CONTENT_WIDTH, 18).fill("#f8fafc");
  doc.font(FONTS.bold).fontSize(8.5).fillColor(COLORS.navyMed)
    .text(label, PAGE.margin + 6, rowY + 4, { width: 130, lineBreak: false });
  doc.font(FONTS.regular).fontSize(8.5).fillColor(COLORS.gray)
    .text(value, PAGE.margin + 140, rowY + 4, { width: CONTENT_WIDTH - 146 });
  doc.y = rowY + 18;
});

doc.moveDown(1.2);
doc.rect(PAGE.margin, doc.y, CONTENT_WIDTH, 0.5).fill(COLORS.rule);
doc.moveDown(0.8);

doc.font(FONTS.italic).fontSize(8.5).fillColor(COLORS.lightGray)
  .text(
    "CONFIDENTIAL — This document and the information contained herein are proprietary to Siebert Services " +
    "and the Customer identified above. Do not distribute without authorization.",
    PAGE.margin, doc.y, { width: CONTENT_WIDTH, align: "center" }
  );

// ─────────────────────────────────────────────────────────────────────────────
// TABLE OF CONTENTS (placeholder — filled after rendering)
// ─────────────────────────────────────────────────────────────────────────────
addPage();
doc.font(FONTS.bold).fontSize(16).fillColor(COLORS.navy)
  .text("TABLE OF CONTENTS", PAGE.margin, 80, { width: CONTENT_WIDTH });
doc.moveDown(0.3);
hRule(COLORS.blue, 1.5);
doc.moveDown(0.5);

const tocSections = [
  ["MASTER SERVICES AGREEMENT"],
  ["  §1  Definitions"],
  ["  §2  Services"],
  ["  §3  Term and Termination"],
  ["  §4  Fees and Payment"],
  ["  §5  Customer Obligations"],
  ["  §6  Acceptable Use"],
  ["  §7  Intellectual Property"],
  ["  §8  Confidentiality"],
  ["  §9  Data Protection & Privacy"],
  ["  §10  Security Incident Handling"],
  ["  §11  Warranties & Disclaimer"],
  ["  §12  Limitation of Liability"],
  ["  §13  Indemnification"],
  ["  §14  Insurance"],
  ["  §15  Force Majeure"],
  ["  §16  Governing Law & Venue"],
  ["  §17  Dispute Resolution"],
  ["  §18  Notices"],
  ["  §19  Assignment"],
  ["  §20  General Provisions"],
  ["  Signature Page"],
  [""],
  ["SCHEDULES & ADDENDA"],
  ["  Schedule A — Services & Tier Selection"],
  ["  Schedule B — Service Level Agreement (SLA)"],
  ["  Schedule C — Fees & Payment Terms"],
  ["  Schedule D — Customer Responsibilities & Acceptable Use"],
  ["  Schedule E — Data Protection & Security Addendum"],
  [""],
  ["OPTIONAL ADDENDA (attach as applicable)"],
  ["  Addendum 1 — Cybersecurity / Managed SOC"],
  ["  Addendum 2 — Cloud & Microsoft 365 Management"],
  ["  Addendum 3 — Backup & Disaster Recovery"],
  ["  Addendum 4 — Compliance (HIPAA / SOC 2 / CMMC)"],
  ["  Addendum 4-A — Business Associate Agreement (HIPAA)"],
  ["  Addendum 5 — Network Infrastructure"],
  ["  Addendum 6 — VoIP & Telephony"],
  ["  Addendum 7 — Hardware & Software Reselling"],
];

tocSections.forEach(([label, pg]) => {
  if (!label) { doc.moveDown(0.3); return; }
  const isSectionHeader = !label.startsWith("  ");

  if (isSectionHeader) {
    doc.moveDown(0.3);
    doc.font(FONTS.bold).fontSize(9.5).fillColor(COLORS.navy).text(label, PAGE.margin, doc.y);
    doc.moveDown(0.1);
    hRule(COLORS.navy, 0.5);
  } else {
    const y = doc.y;
    doc.font(FONTS.regular).fontSize(9).fillColor(COLORS.gray)
      .text(label.trimStart(), PAGE.margin + 8, y, { width: CONTENT_WIDTH - 40 });
    if (pg) {
      doc.font(FONTS.regular).fontSize(9).fillColor(COLORS.lightGray)
        .text(pg, PAGE.margin, y, { width: CONTENT_WIDTH, align: "right" });
    }
    doc.moveDown(0.25);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// MASTER SERVICES AGREEMENT BODY
// ─────────────────────────────────────────────────────────────────────────────
addPage();

doc.font(FONTS.bold).fontSize(16).fillColor(COLORS.navy)
  .text("MASTER SERVICES AGREEMENT", PAGE.margin, 80, { width: CONTENT_WIDTH, align: "center" });
doc.moveDown(0.2);
doc.font(FONTS.regular).fontSize(9.5).fillColor(COLORS.gray)
  .text(
    `This Master Services Agreement ("Agreement") is entered into as of ${placeholder("EFFECTIVE DATE")} ` +
    `("Effective Date") between Siebert Repair Services LLC d/b/a Siebert Services, a New York limited ` +
    `liability company with its principal place of business at 4 Maple Court, Washingtonville, NY 10992 ` +
    `("Provider"), and ${placeholder("CUSTOMER LEGAL NAME")}, a ${placeholder("ENTITY TYPE AND STATE OF FORMATION")} ` +
    `with its principal place of business at ${placeholder("CUSTOMER ADDRESS")} ("Customer").`,
    PAGE.margin, doc.y, { width: CONTENT_WIDTH, align: "justify" }
  );
doc.moveDown(0.5);
doc.font(FONTS.bold).fontSize(9.5).fillColor(COLORS.gray)
  .text("RECITALS", PAGE.margin, doc.y, { width: CONTENT_WIDTH, align: "center" });
doc.moveDown(0.2);
doc.font(FONTS.regular).fontSize(9.5).fillColor(COLORS.gray)
  .text(
    "Provider desires to provide and Customer desires to receive certain managed information technology " +
    "services and related professional services on the terms and conditions set forth herein. NOW, THEREFORE, " +
    "in consideration of the mutual covenants and agreements herein, the parties agree as follows:",
    PAGE.margin, doc.y, { width: CONTENT_WIDTH, align: "justify" }
  );
doc.moveDown(0.5);

// SECTION 1 — DEFINITIONS
sectionHeading("SECTION 1 — DEFINITIONS", 1);
bodyText(
  "As used in this Agreement, the following terms have the meanings set forth below. Additional defined " +
  "terms may appear in the Schedules and Addenda attached hereto."
);
definitionRow("Agreement", "This Master Services Agreement together with all Schedules, Addenda, and Order Forms incorporated herein by reference.");
definitionRow("Authorized User", "Any employee, contractor, or agent of Customer who is authorized by Customer to use the Services.");
definitionRow("Business Day", "Monday through Friday, excluding federal and New York State public holidays.");
definitionRow("Confidential Information", "Any information disclosed by one party to the other that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and circumstances of disclosure.");
definitionRow("Customer Data", "All electronic data, information, and materials submitted by or on behalf of Customer through the Services.");
definitionRow("Documentation", "Technical and user documentation, runbooks, and other materials Provider makes available related to the Services.");
definitionRow("Fees", "All amounts payable by Customer to Provider under this Agreement, including recurring managed service fees, one-time project fees, and pass-through expenses.");
definitionRow("Incident", "Any unplanned interruption, degradation, or security event affecting the Services or Customer's environment.");
definitionRow("Order Form", "A written order, statement of work, or proposal executed by both parties that specifies the Services, Fees, and Term.");
definitionRow("Personal Data", "Any information that relates to an identified or identifiable natural person within the meaning of applicable privacy laws.");
definitionRow("Seat / User", "A single named Authorized User licensed to receive Services under an applicable Order Form. The minimum Seat count is three (3).");
definitionRow("Services", "The managed IT services, professional services, and related deliverables described in the applicable Order Form and Schedules.");
definitionRow("Service Level Agreement (SLA)", "The performance commitments set forth in Schedule B.");
definitionRow("Term", "The Initial Term and any Renewal Terms as defined in Section 3.");

// SECTION 2 — SERVICES
sectionHeading("SECTION 2 — SERVICES", 1);

sectionHeading("2.1  Provision of Services", 2);
bodyText(
  `Provider will provide the Services described in the applicable Order Form and Schedules, subject to ` +
  `the terms of this Agreement. The parties acknowledge that the scope of Services may be modified only ` +
  `by a written amendment signed by authorized representatives of both parties or a new Order Form.`
);

sectionHeading("2.2  Service Tiers", 2);
bodyText(
  "Provider offers three (3) standard service tiers — Essentials, Business, and Enterprise — as described " +
  "in Schedule A. Customer's selected tier is specified in the Order Form and incorporated herein by reference."
);

sectionHeading("2.3  Co-Managed Arrangements", 2);
bodyText(
  "Where Customer has an existing internal IT staff, Provider may deliver Services on a co-managed basis " +
  `as specified in the Order Form. Customer's internal IT personnel remain responsible for areas expressly ` +
  "excluded from Provider's scope as documented in the Order Form and accepted runbooks."
);

sectionHeading("2.4  On-Site Services", 2);
bodyText(
  "On-site dispatch, where included in a Service Tier or Order Form, is available exclusively within the " +
  "State of New York. Travel to locations outside New York will be pre-quoted and invoiced separately at " +
  `Provider's then-current travel and labor rates unless otherwise agreed in writing.`
);

sectionHeading("2.5  Subcontractors", 2);
bodyText(
  "Provider may engage subcontractors and third-party service partners (including after-hours NOC providers) " +
  "to perform portions of the Services. Provider remains responsible for the acts and omissions of its " +
  "subcontractors to the same extent as if performed directly by Provider."
);

sectionHeading("2.6  Third-Party Products", 2);
bodyText(
  "The Services may include procurement, provisioning, or management of third-party hardware, software, " +
  "or cloud services. Such products are subject to the applicable vendor's terms and conditions, which " +
  "Customer agrees to review and accept. Provider is not responsible for outages, defects, or support " +
  "limitations arising solely from third-party products."
);

sectionHeading("2.7  Beta and Preview Features", 2);
bodyText(
  "From time to time Provider may make new tools, dashboards, or service capabilities available to " +
  "Customer on a beta, preview, early-access, or evaluation basis (collectively, \"Preview Features\"). " +
  "Preview Features are provided strictly AS-IS and AS-AVAILABLE, without any service-level commitment, " +
  "warranty, or indemnity, and may be modified, suspended, or discontinued at any time without notice. " +
  "Sections 11 (Warranties), 12 (Limitation of Liability), and 13 (Indemnification) apply to Preview " +
  "Features as if they were Services, and Customer's exclusive remedy for any dissatisfaction with a " +
  "Preview Feature is to discontinue use."
);

sectionHeading("2.8  Change Control", 2);
bodyText(
  `Work falling outside the scope of the selected Service Tier or an existing Order Form is handled as ` +
  `follows. Routine, low-risk requests estimated at or under ${placeholder("CHANGE EMAIL THRESHOLD, e.g., two (2) hours")} ` +
  "of effort may be authorized by Customer's primary point of contact via email and will be invoiced at " +
  `Provider's then-current professional services rate. Engagements exceeding that threshold, or any work ` +
  "that introduces new recurring fees, requires a written Order Form or signed change order before work " +
  "begins. Provider will not perform out-of-scope work without Customer's documented authorization, and " +
  "Customer agrees that emailed approval from its designated contact constitutes binding authorization " +
  "for the threshold described above."
);

// SECTION 3 — TERM AND TERMINATION
sectionHeading("SECTION 3 — TERM AND TERMINATION", 1);

sectionHeading("3.1  Initial Term", 2);
bodyText(
  `This Agreement commences on the Effective Date and continues for an initial period of ` +
  `${placeholder("INITIAL TERM, e.g., twelve (12) months")} ("Initial Term"), unless earlier terminated in ` +
  "accordance with this Section."
);

sectionHeading("3.2  Renewal", 2);
bodyText(
  `Following the Initial Term, this Agreement automatically renews for successive ${placeholder("RENEWAL PERIOD, e.g., twelve (12) month")} ` +
  `periods ("Renewal Terms") unless either party provides written notice of non-renewal at least ` +
  `${placeholder("NOTICE PERIOD, e.g., sixty (60) days")} prior to the end of the then-current Term.`
);

sectionHeading("3.3  Termination for Cause", 2);
bodyText(
  "Either party may terminate this Agreement (or any Order Form) for cause upon thirty (30) days' written " +
  "notice to the other party if such other party: (a) materially breaches this Agreement and fails to " +
  "cure such breach within such notice period; (b) becomes insolvent or makes a general assignment for " +
  "the benefit of creditors; or (c) is subject to bankruptcy, receivership, or similar proceedings."
);

sectionHeading("3.4  Termination for Convenience", 2);
bodyText(
  `Customer may terminate this Agreement for convenience upon ${placeholder("CONVENIENCE NOTICE PERIOD, e.g., ninety (90) days")} ` +
  "written notice to Provider. In such event, Customer shall pay all Fees accrued through the termination " +
  "date plus any applicable early-termination fees specified in the Order Form."
);

sectionHeading("3.5  Effect of Termination", 2);
bodyText(
  "Upon termination or expiration: (a) Provider will cease providing Services and promptly return or " +
  "destroy Customer Data as requested; (b) Customer will pay all outstanding Fees within thirty (30) days; " +
  "(c) each party will return or destroy Confidential Information of the other party; and (d) Sections 6, " +
  "8, 9, 12, 13, 16, and 17 will survive termination."
);

sectionHeading("3.6  Transition Assistance", 2);
bodyText(
  `Provider will provide up to ${placeholder("TRANSITION HOURS, e.g., twenty (20) hours")} of transition assistance ` +
  `at no additional charge following notice of termination or non-renewal. Additional transition assistance ` +
  `will be quoted at Provider's then-current professional services rates.`
);

// SECTION 4 — FEES AND PAYMENT
sectionHeading("SECTION 4 — FEES AND PAYMENT", 1);

sectionHeading("4.1  Fees", 2);
bodyText(
  "Customer shall pay Provider the Fees set forth in the applicable Order Form and Schedule C. Fees for " +
  "recurring managed services are due monthly in advance unless the parties agree to annual billing, in " +
  "which case the annual amount is due on the first day of the applicable billing period."
);

sectionHeading("4.2  Invoicing and Payment Terms", 2);
bodyText(
  "Provider will issue invoices electronically to Customer's designated billing contact. Payment is due " +
  "within thirty (30) days of the invoice date unless otherwise specified in the Order Form. All amounts " +
  "are denominated in U.S. Dollars."
);

sectionHeading("4.3  Late Payments", 2);
bodyText(
  "Invoices not paid within thirty (30) days of the due date will accrue interest at the lesser of: " +
  "(a) one and one-half percent (1.5%) per month; or (b) the maximum rate permitted by New York law. " +
  "Provider may suspend Services upon fifteen (15) days' notice if any undisputed invoice remains unpaid " +
  "for sixty (60) or more days."
);

sectionHeading("4.4  Seat True-Up", 2);
bodyText(
  "Provider will perform a quarterly Seat true-up. If the average number of active Authorized Users " +
  "during a quarter exceeds the contracted Seat count, Provider will invoice Customer for the additional " +
  "Seats at the applicable per-seat rate. Reductions below the contracted minimum Seat count do not " +
  "reduce the monthly Fee unless agreed in a written amendment."
);

sectionHeading("4.5  Price Adjustments", 2);
bodyText(
  `Provider may adjust recurring Fees upon at least ${placeholder("PRICE INCREASE NOTICE, e.g., sixty (60) days")} prior ` +
  "written notice. Price increases exceeding five percent (5%) in any twelve-month period entitle Customer " +
  "to terminate the affected Order Form upon thirty (30) days' notice without early-termination penalty."
);

sectionHeading("4.6  Taxes", 2);
bodyText(
  "All Fees are exclusive of applicable taxes. Customer is responsible for all sales, use, value-added, " +
  "or similar taxes arising from the Services, except taxes on Provider's income. Customer will provide " +
  "Provider with a valid tax-exemption certificate upon request if Customer is exempt."
);

sectionHeading("4.7  Disputed Invoices", 2);
bodyText(
  "Customer must notify Provider in writing of any invoice dispute within fifteen (15) days of the invoice " +
  "date, specifying the amount disputed and the basis for the dispute. The parties will work in good faith " +
  "to resolve disputes within thirty (30) days. Undisputed portions of invoices must be paid when due."
);

// SECTION 5 — CUSTOMER OBLIGATIONS
addPage();
sectionHeading("SECTION 5 — CUSTOMER OBLIGATIONS", 1);

sectionHeading("5.1  General Cooperation", 2);
bodyText(
  "Customer shall: (a) provide Provider with reasonable access to Customer's systems, networks, facilities, " +
  "and personnel necessary for Provider to perform the Services; (b) maintain current, valid licenses for " +
  "all software used in Customer's environment; (c) designate a primary point of contact for the Agreement; " +
  "(d) implement and maintain Provider's recommended security baseline settings on all in-scope systems; " +
  "(e) promptly notify Provider of any changes to Customer's environment that may affect the Services; " +
  "(f) obtain all third-party consents, authorizations, and licenses required to allow Provider to access " +
  "and process Customer Data; and (g) comply with the Customer Responsibilities set forth in Schedule D."
);

sectionHeading("5.2  Minimum Security Baseline", 2);
bodyText(
  "As a condition of receiving the Services, Customer shall maintain at minimum the following security " +
  "controls in its environment. Provider's SLA, security warranties, and indemnification obligations are " +
  "expressly conditioned on Customer's reasonable compliance with this baseline:"
);
bulletList([
  "Multi-factor authentication (MFA) enforced on all email accounts, VPN access, remote-desktop access, and any administrator-level account.",
  "Named individual user accounts; no shared credentials for production or administrative access.",
  "Endpoint protection (Provider-supplied EDR or equivalent) installed and active on all Customer-owned endpoints used to access Customer Data.",
  "Operating systems and applications kept within vendor-supported versions; end-of-life software is removed or quarantined within ninety (90) days.",
  "Backups of Customer-managed systems outside Provider's scope (if any) are tested at least quarterly by Customer.",
  "Security awareness training completed at least annually by all Authorized Users with email access.",
]);
bodyText(
  "If Customer materially deviates from this baseline (for example, by disabling MFA on administrator " +
  "accounts), Provider may, after written notice and a reasonable opportunity to cure, suspend dependent " +
  "Services and is excused from any resulting SLA failures, security warranties, or indemnity obligations " +
  "to the extent the failure is attributable to the deviation."
);

// SECTION 6 — ACCEPTABLE USE
sectionHeading("SECTION 6 — ACCEPTABLE USE", 1);
bodyText(
  "Customer shall not, and shall ensure that its Authorized Users do not, use the Services to: " +
  "(a) violate any applicable law or regulation; (b) infringe the intellectual property rights of any " +
  "third party; (c) transmit malware, spam, or unlawful content; (d) gain unauthorized access to any " +
  "system or network; (e) engage in cryptomining or other resource-intensive unauthorized activities; or " +
  "(f) interfere with Provider's infrastructure or other customers' services. Provider may immediately " +
  "suspend access to prevent harm arising from actual or suspected violations of this Section."
);

// SECTION 7 — INTELLECTUAL PROPERTY
sectionHeading("SECTION 7 — INTELLECTUAL PROPERTY", 1);

sectionHeading("7.1  Provider IP", 2);
bodyText(
  "Provider retains all right, title, and interest in and to: (a) its pre-existing tools, scripts, " +
  "methodologies, and know-how; (b) any improvements to Provider's general tools developed in the course " +
  "of performing the Services; and (c) the Documentation. Nothing in this Agreement transfers ownership " +
  "of Provider IP to Customer."
);

sectionHeading("7.2  Customer IP", 2);
bodyText(
  "Customer retains all right, title, and interest in and to Customer Data and Customer's pre-existing " +
  "systems, software, and data. Customer grants Provider a limited, non-exclusive license to access and " +
  "process Customer Data solely to perform the Services."
);

sectionHeading("7.3  Work Product", 2);
bodyText(
  `Custom work product created specifically for Customer and expressly designated as 'work for hire' in ` +
  "a signed Order Form shall, upon full payment, be owned by Customer. All other deliverables, including " +
  "runbooks, configuration templates, and scripts based on Provider's methodology, remain Provider property " +
  "with a perpetual, royalty-free license granted to Customer for its internal use."
);

// SECTION 8 — CONFIDENTIALITY
sectionHeading("SECTION 8 — CONFIDENTIALITY", 1);

sectionHeading("8.1  Obligations", 2);
bodyText(
  "Each party shall: (a) hold the other party's Confidential Information in strict confidence; " +
  "(b) not disclose it to third parties without prior written consent; and (c) use it solely to perform " +
  "obligations or exercise rights under this Agreement. Each party may disclose Confidential Information " +
  "to its employees, contractors, and professional advisors who have a need to know and are bound by " +
  "confidentiality obligations no less protective than this Agreement."
);

sectionHeading("8.2  Exclusions", 2);
bodyText(
  "Confidentiality obligations do not apply to information that: (a) is or becomes publicly known through " +
  "no breach by the receiving party; (b) was rightfully known before disclosure; (c) is rightfully obtained " +
  "from a third party without restriction; or (d) is independently developed without reference to the " +
  "disclosing party's Confidential Information."
);

sectionHeading("8.3  Compelled Disclosure", 2);
bodyText(
  "If a party is required by law or court order to disclose Confidential Information, it will promptly " +
  "notify the disclosing party (to the extent legally permitted), cooperate in seeking a protective order, " +
  "and disclose only the minimum amount required."
);

sectionHeading("8.4  Duration", 2);
bodyText(
  `Confidentiality obligations survive termination of this Agreement for a period of ${placeholder("CONFIDENTIALITY PERIOD, e.g., three (3) years")}.`
);

// SECTION 9 — DATA PROTECTION
sectionHeading("SECTION 9 — DATA PROTECTION & PRIVACY", 1);

sectionHeading("9.1  Roles and Safeguards", 2);
bodyText(
  "Provider will process Customer Data in accordance with this Agreement, applicable law, and Schedule E " +
  "(Data Protection & Security Addendum). Customer is the data controller (or equivalent); Provider acts " +
  "as a data processor (or equivalent) with respect to Personal Data. Provider implements and maintains " +
  "commercially reasonable administrative, technical, and physical safeguards designed to protect Customer " +
  "Data from unauthorized access, use, or disclosure."
);

sectionHeading("9.2  Data Residency", 2);
bodyText(
  "Provider will store and process Customer Data within the United States. If Provider proposes to relocate " +
  "any Customer Data outside the United States — for example, by adopting a non-U.S. cloud region or " +
  "subprocessor — Provider will obtain Customer's prior written consent and, if required, execute appropriate " +
  "cross-border transfer mechanisms. Provider's standard tooling, backups, and support operations are " +
  "U.S.-based as of the Effective Date."
);

sectionHeading("9.3  Subprocessor Notice", 2);
bodyText(
  "Provider engages a list of subprocessors to deliver the Services (including, as of the Effective Date, " +
  "Provider's RMM/PSA platform, EDR vendor, backup cloud, after-hours NOC partner, and Microsoft 365 / " +
  "cloud-hosting providers used to operate Customer's tenants). The current subprocessor list is maintained " +
  "in Schedule E and is available to Customer on written request. Provider will provide at least thirty (30) " +
  "days' prior written notice (which may be by email to Customer's designated contact) before adding or " +
  "replacing any subprocessor that materially processes Customer Data. If Customer has a reasonable, " +
  "documented objection to a new subprocessor, the parties will work in good faith to find an alternative; " +
  "if no alternative is available, Customer may terminate the affected Services without early-termination fee."
);

sectionHeading("9.4  No Use of Customer Data for AI Training", 2);
bodyText(
  "Provider will not use Customer Data — including without limitation Customer Personal Data, message " +
  "content, ticket content, configuration files, or backups — to train, fine-tune, or otherwise improve " +
  "any generative-AI or machine-learning model that is made available to Provider's other customers or to " +
  "the public. Provider may use generative-AI tools internally to assist in delivering the Services (for " +
  "example, drafting ticket responses or summarizing logs), provided that: (a) any such tool is configured " +
  "to disable vendor training on Provider's inputs; (b) Customer Data is not transmitted to consumer-tier " +
  "AI services; and (c) Provider remains responsible under this Agreement for the work product regardless " +
  "of whether AI tools assisted in producing it. Customer may opt out of Provider's internal AI-assisted " +
  "service delivery for its account by written notice to Provider."
);

sectionHeading("9.5  HIPAA / Business Associate Agreement", 2);
bodyText(
  "Where Customer is a Covered Entity or Business Associate (each as defined under HIPAA, 45 C.F.R. " +
  "Parts 160 and 164) and Provider's performance of the Services involves the creation, receipt, " +
  "maintenance, or transmission of Protected Health Information (\"PHI\") on Customer's behalf, the parties " +
  "will execute Provider's standard Business Associate Agreement (\"BAA\"), which is incorporated into " +
  "this Agreement upon execution. In the event of any conflict between this Agreement and the BAA with " +
  "respect to PHI, the BAA controls. Customer represents that it will not transmit PHI to Provider until " +
  "a BAA has been executed, and Provider may suspend the affected Services if PHI is transmitted in " +
  "advance of a fully executed BAA."
);

// SECTION 10 — SECURITY INCIDENT HANDLING
sectionHeading("SECTION 10 — SECURITY INCIDENT HANDLING", 1);
bodyText(
  "Provider will: (a) notify Customer without undue delay (and in any event within seventy-two (72) hours) " +
  "upon discovering a confirmed Security Incident affecting Customer Data; (b) provide reasonable details " +
  "about the nature, scope, and likely consequences of the Incident; (c) implement reasonable mitigation " +
  "measures; and (d) cooperate with Customer's reasonable incident-response efforts. Provider will maintain " +
  "a documented incident-response plan and make a summary available to Customer upon written request."
);

// SECTION 11 — WARRANTIES
addPage();
sectionHeading("SECTION 11 — WARRANTIES & DISCLAIMER", 1);

sectionHeading("11.1  Provider Warranties", 2);
bodyText(
  "Provider warrants that: (a) it has the right and authority to enter into this Agreement; (b) the " +
  "Services will be performed in a professional and workmanlike manner consistent with industry standards; " +
  "and (c) Provider will comply with all applicable laws and regulations in the performance of the Services."
);

sectionHeading("11.2  Customer Warranties", 2);
bodyText(
  "Customer warrants that: (a) it has the right and authority to enter into this Agreement; (b) it owns " +
  "or has the necessary rights to all Customer Data provided to Provider; and (c) Customer's use of the " +
  "Services will comply with all applicable laws."
);

sectionHeading("11.3  Disclaimer", 2);
bodyText(
  "EXCEPT AS EXPRESSLY SET FORTH IN THIS AGREEMENT, PROVIDER MAKES NO WARRANTIES OF ANY KIND, EXPRESS " +
  "OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A " +
  "PARTICULAR PURPOSE, OR NON-INFRINGEMENT. PROVIDER DOES NOT WARRANT THAT THE SERVICES WILL BE " +
  "UNINTERRUPTED, ERROR-FREE, OR FREE FROM SECURITY VULNERABILITIES."
);

sectionHeading("11.4  Provider Personnel and Background Checks", 2);
bodyText(
  "Provider represents that all of its employees and any subcontractor personnel who will have logical " +
  "or physical access to Customer's systems, Customer Data, or Customer facilities have, prior to such " +
  "access being granted, completed: (a) a documented criminal-history background check covering at least " +
  "the prior seven (7) years in jurisdictions of residence or employment, to the extent permitted by " +
  "applicable law; (b) identity verification; and (c) Provider's confidentiality and acceptable-use " +
  "training. Provider will retain records of such checks and will, on Customer's reasonable written " +
  "request and subject to applicable privacy law, confirm in writing that a specific named individual " +
  "assigned to Customer's account satisfies this requirement. Provider remains responsible under this " +
  "Agreement for the acts and omissions of its personnel and subcontractors."
);

// SECTION 12 — LIMITATION OF LIABILITY
sectionHeading("SECTION 12 — LIMITATION OF LIABILITY", 1);

sectionHeading("12.1  Mutual Cap", 2);
bodyText(
  "EXCEPT FOR OBLIGATIONS ARISING UNDER SECTIONS 8 (CONFIDENTIALITY), 13 (INDEMNIFICATION), OR LIABILITIES " +
  "ARISING FROM GROSS NEGLIGENCE OR WILLFUL MISCONDUCT, IN NO EVENT SHALL EITHER PARTY'S AGGREGATE LIABILITY " +
  "UNDER THIS AGREEMENT EXCEED THE GREATER OF: (A) THE TOTAL FEES PAID OR PAYABLE BY CUSTOMER TO PROVIDER " +
  `IN THE ${placeholder("CAP PERIOD, e.g., TWELVE (12)")} MONTHS IMMEDIATELY PRECEDING THE CLAIM; OR ` +
  `(B) ${placeholder("MINIMUM CAP, e.g., FIVE THOUSAND DOLLARS ($5,000)")}.`
);

sectionHeading("12.2  Exclusion of Consequential Damages", 2);
bodyText(
  "IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR " +
  "CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS, LOSS OF DATA, BUSINESS INTERRUPTION, OR COST OF " +
  "SUBSTITUTE SERVICES, WHETHER OR NOT SUCH PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES."
);

// SECTION 13 — INDEMNIFICATION
sectionHeading("SECTION 13 — INDEMNIFICATION", 1);

sectionHeading("13.1  Provider Indemnity", 2);
bodyText(
  "Provider will defend, indemnify, and hold harmless Customer from third-party claims arising from: " +
  "(a) Provider's gross negligence or willful misconduct; (b) Provider's infringement of a third party's " +
  "intellectual property rights through the Services (excluding third-party products); or (c) Provider's " +
  "material breach of this Agreement."
);

sectionHeading("13.2  Customer Indemnity", 2);
bodyText(
  "Customer will defend, indemnify, and hold harmless Provider from third-party claims arising from: " +
  "(a) Customer's use of the Services in violation of this Agreement or applicable law; (b) Customer Data " +
  "infringing a third party's rights; or (c) Customer's gross negligence or willful misconduct."
);

sectionHeading("13.3  Indemnification Procedure", 2);
bodyText(
  "The indemnified party shall: (a) promptly notify the indemnifying party of the claim; (b) grant " +
  "control of the defense and settlement to the indemnifying party; and (c) cooperate reasonably. " +
  "The indemnifying party shall not settle any claim without the indemnified party's prior written consent " +
  "if such settlement imposes obligations on the indemnified party."
);

// SECTION 14 — INSURANCE
sectionHeading("SECTION 14 — INSURANCE", 1);
bodyText(
  "Provider shall maintain, at its own expense, at minimum the following insurance coverage during the Term:"
);
bulletList([
  "Commercial General Liability: $1,000,000 per occurrence / $2,000,000 aggregate",
  "Technology Errors & Omissions / Cyber Liability: $1,000,000 per claim",
  "Workers' Compensation: as required by New York State law",
  "Umbrella/Excess Liability: $1,000,000 per occurrence",
]);
bodyText(
  `Customer shall be named as additional insured on Provider's General Liability policy. Provider will ` +
  `provide certificates of insurance upon written request.`
);

// SECTION 15 — FORCE MAJEURE
sectionHeading("SECTION 15 — FORCE MAJEURE", 1);
bodyText(
  "Neither party shall be liable for delays or failures in performance resulting from causes beyond its " +
  "reasonable control, including acts of God, natural disasters, war, terrorism, government actions, " +
  "pandemics, internet or power outages beyond the party's control, or third-party infrastructure failures. " +
  "The affected party shall promptly notify the other party and use commercially reasonable efforts to " +
  "mitigate the impact. If a Force Majeure event continues for more than thirty (30) days, either party " +
  "may terminate the affected Services without penalty on written notice."
);

// SECTION 16 — GOVERNING LAW
addPage();
sectionHeading("SECTION 16 — GOVERNING LAW & VENUE", 1);
bodyText(
  "This Agreement shall be governed by and construed in accordance with the laws of the State of New York, " +
  "without regard to its conflict-of-laws principles. The parties irrevocably consent to the exclusive " +
  "jurisdiction and venue of the state and federal courts located in Orange County, " +
  "New York for any dispute arising out of or relating to this Agreement."
);

// SECTION 17 — DISPUTE RESOLUTION
sectionHeading("SECTION 17 — DISPUTE RESOLUTION", 1);
bodyText(
  "Before initiating litigation, the parties agree to attempt resolution through the following escalation:"
);
numberedList([
  "Good-faith written notice of the dispute to the other party's designated representative.",
  "Within fifteen (15) days of notice, senior management of each party will confer in good faith.",
  "If unresolved within thirty (30) days of initial notice, either party may pursue mediation before a mutually agreed mediator in Orange County, New York.",
  "If mediation fails within sixty (60) days, either party may pursue litigation in a court of competent jurisdiction in New York.",
]);
bodyText(
  "Nothing in this Section prevents either party from seeking emergency injunctive or equitable relief " +
  "without prior notice or mediation."
);

// SECTION 18 — NOTICES
sectionHeading("SECTION 18 — NOTICES", 1);
bodyText(
  "Notices must be in writing and delivered by: (a) hand delivery; (b) nationally recognized overnight " +
  "courier; or (c) email with confirmed receipt. Notices to Provider shall be sent to: " +
  "Siebert Repair Services LLC d/b/a Siebert Services, 4 Maple Court, Washingtonville, NY 10992, " +
  `Attn: Contracts; Email: ${placeholder("CONTRACTS EMAIL, e.g., legal@siebertservices.com")}. ` +
  `Notices to Customer shall be sent to: ${placeholder("CUSTOMER NOTICE ADDRESS AND EMAIL")}.`
);

// SECTION 19 — ASSIGNMENT
sectionHeading("SECTION 19 — ASSIGNMENT", 1);
bodyText(
  "Neither party may assign this Agreement without the prior written consent of the other party, except " +
  "that Provider may assign this Agreement without consent in connection with a merger, acquisition, " +
  "corporate reorganization, or sale of substantially all of Provider's assets. Any purported assignment " +
  "in violation of this Section is void. This Agreement binds and inures to the benefit of the parties " +
  "and their respective permitted successors and assigns."
);

// SECTION 20 — GENERAL PROVISIONS
sectionHeading("SECTION 20 — GENERAL PROVISIONS", 1);
bodyText(
  "(a) Entire Agreement. This Agreement, together with all Order Forms, Schedules, and Addenda, " +
  "constitutes the entire agreement between the parties regarding its subject matter and supersedes all " +
  "prior agreements, representations, and understandings. (b) Amendments. Amendments require a written " +
  "instrument signed by authorized representatives of both parties. (c) Waiver. Failure to enforce any " +
  "provision does not constitute a waiver of future enforcement rights. (d) Severability. If any provision " +
  "is found unenforceable, the remaining provisions continue in full force. (e) Counterparts. This Agreement " +
  "may be executed in counterparts, including by electronic signature, each of which is deemed an original. " +
  "(f) Independent Contractors. The parties are independent contractors; nothing herein creates an " +
  "employment, agency, partnership, or joint venture relationship. (g) No Third-Party Beneficiaries. " +
  "This Agreement is for the sole benefit of the parties and their permitted successors; it does not " +
  "create any rights in third parties. (h) Headings. Section headings are for convenience only. " +
  "(i) Construction. This Agreement has been negotiated by both parties, and any ambiguity will not be " +
  "construed against the drafter. " +
  "(j) Mutual Non-Solicitation. During the Term and for twelve (12) months after termination, neither " +
  "party shall directly or indirectly solicit for employment or engagement any employee or contractor of " +
  "the other party who has been substantially involved in performing or receiving the Services, without " +
  "the other party's prior written consent. General public job postings, recruitment-firm searches not " +
  "targeted at the other party, and the hiring of an individual who responds to such general efforts " +
  "without solicitation are not a breach of this clause. " +
  "(k) Publicity and Logo Use. Provider may identify Customer as a customer and use Customer's name and " +
  "logo on Provider's website, sales decks, capabilities statements, and similar marketing materials, " +
  "provided that any such use is consistent with any usage guidelines Customer reasonably provides in " +
  "writing. Customer may revoke this permission at any time by written notice to Provider, in which case " +
  "Provider will remove Customer's name and logo from publicly distributed materials within thirty (30) " +
  "days. Any case study, press release, or quoted testimonial requires Customer's prior written approval."
);

// SIGNATURE PAGE
addPage();
sectionHeading("SIGNATURE PAGE", 1);
doc.moveDown(0.5);
bodyText(
  "By signing below, the authorized representatives of the parties agree to be bound by the terms of " +
  "this Master Services Agreement, including all Schedules and Addenda attached hereto."
);
doc.moveDown(1.5);

const col1X = PAGE.margin;
const col2X = PAGE.margin + CONTENT_WIDTH / 2 + 10;
const sigW = CONTENT_WIDTH / 2 - 20;

const signatureBlocks = [
  { title: "SIEBERT REPAIR SERVICES LLC", subtitle: "d/b/a SIEBERT SERVICES (Provider)" },
  { title: inlinePlaceholder("CUSTOMER LEGAL NAME"), subtitle: "(Customer)" },
];

const sigY = doc.y;
signatureBlocks.forEach((block, i) => {
  const x = i === 0 ? col1X : col2X;
  doc.font(FONTS.bold).fontSize(9).fillColor(COLORS.navy)
    .text(block.title, x, sigY, { width: sigW });
  doc.font(FONTS.regular).fontSize(8.5).fillColor(COLORS.gray)
    .text(block.subtitle, x, doc.y, { width: sigW });

  const lineY = doc.y + 25;
  doc.moveTo(x, lineY).lineTo(x + sigW, lineY)
    .strokeColor(COLORS.rule).lineWidth(0.8).stroke();
  doc.font(FONTS.regular).fontSize(7.5).fillColor(COLORS.lightGray)
    .text("Authorized Signature", x, lineY + 4, { width: sigW });

  const nameLineY = lineY + 30;
  doc.moveTo(x, nameLineY).lineTo(x + sigW, nameLineY)
    .strokeColor(COLORS.rule).lineWidth(0.8).stroke();
  doc.font(FONTS.regular).fontSize(7.5).fillColor(COLORS.lightGray)
    .text("Printed Name", x, nameLineY + 4, { width: sigW });

  const titleLineY = nameLineY + 30;
  doc.moveTo(x, titleLineY).lineTo(x + sigW, titleLineY)
    .strokeColor(COLORS.rule).lineWidth(0.8).stroke();
  doc.font(FONTS.regular).fontSize(7.5).fillColor(COLORS.lightGray)
    .text("Title", x, titleLineY + 4, { width: sigW });

  const dateLineY = titleLineY + 30;
  doc.moveTo(x, dateLineY).lineTo(x + sigW, dateLineY)
    .strokeColor(COLORS.rule).lineWidth(0.8).stroke();
  doc.font(FONTS.regular).fontSize(7.5).fillColor(COLORS.lightGray)
    .text("Date", x, dateLineY + 4, { width: sigW });
});

doc.y = sigY + 190;
doc.moveDown(1.5);
bodyText(
  "Each Schedule and Addendum attached hereto is incorporated into this Agreement. " +
  "The parties initial below to confirm acceptance of each attached Schedule:"
);
doc.moveDown(0.5);

const schedules = [
  "Schedule A — Services & Tier Selection",
  "Schedule B — Service Level Agreement",
  "Schedule C — Fees & Payment Terms",
  "Schedule D — Customer Responsibilities",
  "Schedule E — Data Protection & Security Addendum",
];

schedules.forEach(sch => {
  const y = doc.y;
  doc.font(FONTS.regular).fontSize(9).fillColor(COLORS.gray)
    .text(sch, PAGE.margin, y, { width: CONTENT_WIDTH - 120 });
  const initW = 45;
  const gap = 12;
  const x2 = PAGE.margin + CONTENT_WIDTH - initW;
  const x1 = x2 - initW - gap;
  doc.moveTo(x1, y + 10).lineTo(x1 + initW, y + 10)
    .strokeColor(COLORS.rule).lineWidth(0.5).stroke();
  doc.font(FONTS.regular).fontSize(7).fillColor(COLORS.lightGray)
    .text("Provider", x1, y + 13, { width: initW, align: "center" });
  doc.moveTo(x2, y + 10).lineTo(x2 + initW, y + 10)
    .strokeColor(COLORS.rule).lineWidth(0.5).stroke();
  doc.font(FONTS.regular).fontSize(7).fillColor(COLORS.lightGray)
    .text("Customer", x2, y + 13, { width: initW, align: "center" });
  doc.moveDown(0.6);
});

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE A — SERVICES & TIER SELECTION
// ─────────────────────────────────────────────────────────────────────────────
addPage();

doc.font(FONTS.bold).fontSize(14).fillColor(COLORS.navy)
  .text("SCHEDULE A", PAGE.margin, 80, { width: CONTENT_WIDTH, align: "center" });
doc.font(FONTS.bold).fontSize(11).fillColor(COLORS.blue)
  .text("Services & Tier Selection", PAGE.margin, doc.y + 4, { width: CONTENT_WIDTH, align: "center" });
hRule(COLORS.blue, 1.5);
doc.moveDown(0.4);

bodyText(
  "Customer selects one (1) primary Service Tier and may attach Optional Addenda for additional services. " +
  "Check the applicable tier and initial."
);

doc.moveDown(0.5);
doc.font(FONTS.bold).fontSize(10).fillColor(COLORS.navy).text("A.1  Primary Service Tier", PAGE.margin);
doc.moveDown(0.4);

const tiers = [
  {
    name: "ESSENTIALS",
    price: "$89/user/month (monthly)  ·  $76/user/month (annual)",
    desc: "Core managed IT for small teams.",
    features: [
      "Business-hours help desk (M–F 8:00 AM – 5:00 PM ET)",
      "Remote monitoring & automated patch management",
      "Endpoint antivirus (managed)",
      "Microsoft 365 administration (user management, licensing)",
      "Asset inventory and documentation",
      "Quarterly health-check report",
      "Email and phone support",
      "Minimum 3 Seats",
    ],
    excluded: [
      "24/7 after-hours support",
      "Endpoint Detection & Response (EDR)",
      "vCIO strategic planning",
      "On-site dispatch",
    ],
  },
  {
    name: "BUSINESS",
    price: "$149/user/month (monthly)  ·  $127/user/month (annual)",
    desc: "Full-stack IT, security, and cloud — most popular.",
    features: [
      "Extended-hours help desk (7:00 AM – 8:00 PM ET, M–F)",
      "Remote monitoring & automated patch management",
      "Endpoint Detection & Response (EDR) — managed",
      "Microsoft 365 + security hardening (baseline policies)",
      "Multi-factor authentication (MFA) rollout and enforcement",
      "Backup & disaster-recovery monitoring",
      "Quarterly business reviews (vCIO)",
      "On-site dispatch: up to 4 hours/month (New York only)",
      "Minimum 3 Seats",
    ],
    excluded: [
      "24/7 after-hours support",
      "Dedicated SOC analyst",
      "Compliance program management",
    ],
  },
  {
    name: "ENTERPRISE",
    price: "$229/user/month (monthly)  ·  $195/user/month (annual)",
    desc: "24/7 coverage, compliance, and a named team for complex organizations.",
    features: [
      "24/7/365 help desk + dedicated emergency line",
      "Full EDR + Managed Security Operations Center (SOC) monitoring",
      "Microsoft 365 E3/E5 management",
      "MFA, conditional access, and SSO design & enforcement",
      "Immutable backup with quarterly tested restores",
      "Compliance program management (HIPAA, SOC 2, CMMC — see Addendum 4)",
      "Named vCIO + monthly strategy meetings",
      "Unlimited on-site dispatch (New York only)",
      "Dedicated account team",
      "Minimum 3 Seats",
    ],
    excluded: [],
  },
];

tiers.forEach((tier, idx) => {
  const y = doc.y;
  doc.rect(PAGE.margin, y, CONTENT_WIDTH, 20)
    .fillAndStroke(idx === 1 ? "#eef4ff" : "#f9fafb", COLORS.rule);

  doc.moveTo(PAGE.margin, y).lineTo(PAGE.margin, y + 20)
    .strokeColor(idx === 1 ? COLORS.blue : COLORS.rule).lineWidth(3).stroke();

  doc.rect(PAGE.margin + 8, y + 5, 10, 10)
    .strokeColor(COLORS.gray).lineWidth(0.5).stroke();

  doc.font(FONTS.bold).fontSize(10).fillColor(COLORS.navy)
    .text(tier.name, PAGE.margin + 24, y + 4, { width: 100 });
  doc.font(FONTS.regular).fontSize(8).fillColor(COLORS.blue)
    .text(tier.price, PAGE.margin + 130, y + 5, { width: CONTENT_WIDTH - 130 - 8 });

  doc.y = y + 24;
  doc.font(FONTS.italic).fontSize(8.5).fillColor(COLORS.gray)
    .text(tier.desc, PAGE.margin + 8, doc.y);
  doc.moveDown(0.3);

  tier.features.forEach(f => {
    doc.font(FONTS.regular).fontSize(8.5).fillColor(COLORS.gray)
      .text(`✓  ${f}`, PAGE.margin + 16, doc.y, { width: CONTENT_WIDTH - 24 });
    doc.moveDown(0.15);
  });

  if (tier.excluded.length > 0) {
    doc.moveDown(0.1);
    tier.excluded.forEach(f => {
      doc.font(FONTS.regular).fontSize(8).fillColor(COLORS.lightGray)
        .text(`✗  ${f} (not included)`, PAGE.margin + 16, doc.y, { width: CONTENT_WIDTH - 24 });
      doc.moveDown(0.12);
    });
  }
  doc.moveDown(0.5);
});

doc.moveDown(0.3);
doc.font(FONTS.bold).fontSize(10).fillColor(COLORS.navy).text("A.2  Selected Billing Cycle", PAGE.margin);
doc.moveDown(0.3);
checkboxRow(`Monthly billing — standard rate (${placeholder("TIER NAME")} at $${placeholder("MONTHLY RATE")}/user/month)`);
checkboxRow(`Annual billing — approximately 15% discount (${placeholder("TIER NAME")} at $${placeholder("ANNUAL RATE")}/user/month, billed annually)`);

doc.moveDown(0.3);
doc.font(FONTS.bold).fontSize(10).fillColor(COLORS.navy).text("A.3  Seat Count", PAGE.margin);
doc.moveDown(0.3);
bodyText(`Contracted Seats: ${placeholder("NUMBER OF SEATS")}  (minimum 3)`);
bodyText(`Estimated Monthly Total: $${placeholder("MONTHLY TOTAL")} (Seats × per-seat rate)`);

doc.moveDown(0.3);
doc.font(FONTS.bold).fontSize(10).fillColor(COLORS.navy).text("A.4  Optional Addenda Attached", PAGE.margin);
doc.moveDown(0.3);
checkboxRow("Addendum 1 — Cybersecurity / Managed SOC");
checkboxRow("Addendum 2 — Cloud & Microsoft 365 Management");
checkboxRow("Addendum 3 — Backup & Disaster Recovery");
checkboxRow("Addendum 4 — Compliance (HIPAA / SOC 2 / CMMC)");
checkboxRow("Addendum 4-A — Business Associate Agreement (HIPAA)");
checkboxRow("Addendum 5 — Network Infrastructure");
checkboxRow("Addendum 6 — VoIP & Telephony");
checkboxRow("Addendum 7 — Hardware & Software Reselling");

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE B — SLA
// ─────────────────────────────────────────────────────────────────────────────
addPage();

doc.font(FONTS.bold).fontSize(14).fillColor(COLORS.navy)
  .text("SCHEDULE B", PAGE.margin, 80, { width: CONTENT_WIDTH, align: "center" });
doc.font(FONTS.bold).fontSize(11).fillColor(COLORS.blue)
  .text("Service Level Agreement (SLA)", PAGE.margin, doc.y + 4, { width: CONTENT_WIDTH, align: "center" });
hRule(COLORS.blue, 1.5);
doc.moveDown(0.4);

noticeBox(
  "SLA credits are Customer's exclusive remedy for SLA failures. Credits do not apply during force " +
  "majeure events, scheduled maintenance windows, or outages caused by Customer's actions or third-party " +
  "products not under Provider's management.",
  "info"
);

sectionHeading("B.1  Help Desk Response Times", 2);

const slaHelpCols = ["Severity", "Description", "Essentials", "Business", "Enterprise"];
const slaHelpWidths = [80, 160, 75, 75, 78];
tableRow(slaHelpCols, slaHelpWidths, true);
const slaRows = [
  ["P1 — Critical", "Complete outage / data loss risk", "4 hrs", "2 hrs", "15 min"],
  ["P2 — High", "Significant degradation / multiple users", "4 hrs (BH)", "2 hrs", "30 min"],
  ["P3 — Medium", "Single user impacted / workaround available", "8 hrs (BH)", "4 hrs (BH)", "2 hrs"],
  ["P4 — Low", "Questions / non-urgent requests", "1 BD (BH)", "1 BD (BH)", "4 hrs (BH)"],
];
slaRows.forEach((row, i) => tableRow(row, slaHelpWidths, false, i % 2 === 0));
doc.moveDown(0.3);
doc.font(FONTS.italic).fontSize(8).fillColor(COLORS.lightGray)
  .text("BH = Business Hours (see Schedule A for tier-specific hours). BD = Business Day.", PAGE.margin);
doc.moveDown(0.5);

sectionHeading("B.2  Infrastructure Uptime Target", 2);
bodyText(
  "Provider targets 99.9% monthly uptime for managed infrastructure services (help desk availability, " +
  "RMM platform, and backup monitoring) as measured by Provider's monitoring tools, excluding scheduled " +
  "maintenance windows."
);

sectionHeading("B.3  Patch Management SLA", 2);
const patchCols = ["Patch Type", "Deployment Target"];
const patchWidths = [240, 228];
tableRow(patchCols, patchWidths, true);
tableRow(["Critical / Security (CVSS ≥ 9.0)", "7 calendar days"], patchWidths, false, true);
tableRow(["High (CVSS 7.0–8.9)", "14 calendar days"], patchWidths, false, false);
tableRow(["Medium (CVSS 4.0–6.9)", "30 calendar days"], patchWidths, false, true);
tableRow(["Low / Informational", "60 calendar days or next scheduled maintenance"], patchWidths, false, false);
doc.moveDown(0.5);

sectionHeading("B.4  On-Site Dispatch", 2);
const onSiteCols = ["Tier", "Included On-Site Time", "Geography", "Response Time (P1)"];
const onSiteWidths = [80, 130, 150, 108];
tableRow(onSiteCols, onSiteWidths, true);
tableRow(["Essentials", "Not included", "N/A (remote only)", "N/A"], onSiteWidths, false, true);
tableRow(["Business", "4 hrs/month", "New York only", "Next Business Day"], onSiteWidths, false, false);
tableRow(["Enterprise", "Unlimited", "New York only", "4 hours (P1)"], onSiteWidths, false, true);
doc.moveDown(0.3);
bodyText(
  "On-site dispatch outside New York will be quoted at Provider's then-current travel rates. Unused " +
  "Business-tier on-site hours do not roll over."
);

sectionHeading("B.5  SLA Credits", 2);
const creditCols = ["Uptime in Month", "Credit (% of Monthly Fee)"];
const creditWidths = [220, 248];
tableRow(creditCols, creditWidths, true);
tableRow(["≥ 99.9% (SLA Met)", "None"], creditWidths, false, true);
tableRow(["99.0% – 99.89%", "5%"], creditWidths, false, false);
tableRow(["98.0% – 98.99%", "10%"], creditWidths, false, true);
tableRow(["< 98.0%", "25%"], creditWidths, false, false);
doc.moveDown(0.4);
bodyText(
  "Customer must request SLA credits within thirty (30) days of the end of the affected month. " +
  "Credits are applied to the next invoice and do not exceed the monthly Fee for the affected service."
);

sectionHeading("B.6  Scheduled Maintenance", 2);
bodyText(
  `Provider's standard maintenance window is ${placeholder("MAINTENANCE WINDOW, e.g., Sundays 2:00 AM – 6:00 AM ET")}. ` +
  "Provider will provide at least forty-eight (48) hours' notice for standard maintenance and five (5) " +
  "Business Days' notice for major upgrades. Emergency maintenance may be performed with notice as " +
  "soon as practicable."
);

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE C — FEES
// ─────────────────────────────────────────────────────────────────────────────
addPage();

doc.font(FONTS.bold).fontSize(14).fillColor(COLORS.navy)
  .text("SCHEDULE C", PAGE.margin, 80, { width: CONTENT_WIDTH, align: "center" });
doc.font(FONTS.bold).fontSize(11).fillColor(COLORS.blue)
  .text("Fees & Payment Terms", PAGE.margin, doc.y + 4, { width: CONTENT_WIDTH, align: "center" });
hRule(COLORS.blue, 1.5);
doc.moveDown(0.4);

sectionHeading("C.1  Standard Tier Pricing", 2);
const priceCols = ["Tier", "Monthly Rate", "Annual Rate*", "Min. Seats", "Annual Save"];
const priceWidths = [100, 90, 90, 80, 108];
tableRow(priceCols, priceWidths, true);
tableRow(["Essentials", "$89/user/mo", "$76/user/mo", "3", "~15%"], priceWidths, false, true);
tableRow(["Business", "$149/user/mo", "$127/user/mo", "3", "~15%"], priceWidths, false, false);
tableRow(["Enterprise", "$229/user/mo", "$195/user/mo", "3", "~15%"], priceWidths, false, true);
doc.moveDown(0.2);
doc.font(FONTS.italic).fontSize(8).fillColor(COLORS.lightGray)
  .text("* Annual rates are billed as a single annual invoice or 12 equal monthly installments at Provider's discretion.", PAGE.margin);
doc.moveDown(0.5);

sectionHeading("C.2  Customer-Specific Fee Schedule", 2);

const feeDetailCols = ["Line Item", "Detail", "Amount"];
const feeDetailWidths = [170, 180, 118];
tableRow(feeDetailCols, feeDetailWidths, true);
tableRow(
  ["Primary Tier", `${placeholder("TIER")} — ${placeholder("# SEATS")} Seats`, `$${placeholder("MONTHLY FEE")}/mo`],
  feeDetailWidths, false, true
);
tableRow(
  ["Billing Cycle", placeholder("Monthly / Annual"), placeholder("Monthly or Annual Invoice")],
  feeDetailWidths, false, false
);
tableRow(
  ["One-Time Onboarding Fee", placeholder("ONBOARDING SCOPE"), `$${placeholder("ONBOARDING FEE")}`],
  feeDetailWidths, false, true
);
tableRow(
  ["Optional Addenda", placeholder("LIST ADDENDA"), placeholder("Per addendum pricing")],
  feeDetailWidths, false, false
);
tableRow(
  ["Hardware / Software (pass-through)", "Per procurement request", "Cost + 15%"],
  feeDetailWidths, false, true
);
tableRow(
  ["Professional Services (ad hoc)", placeholder("HOURLY OR PROJECT RATE"), `$${placeholder("PS RATE")}/hr or fixed`],
  feeDetailWidths, false, false
);
doc.moveDown(0.5);

sectionHeading("C.3  Onboarding Fee", 2);
bodyText(
  `Customer agrees to pay a one-time onboarding fee of $${placeholder("ONBOARDING FEE")} due within fifteen (15) ` +
  "days of the Effective Date. This fee covers environment discovery, RMM agent deployment, documentation, " +
  "and user onboarding communications."
);

sectionHeading("C.4  Seat True-Up", 2);
bodyText(
  "Seat counts are audited quarterly based on active directory user counts or RMM agent counts, whichever " +
  "is greater. Additional Seats are invoiced at the applicable per-seat rate. Reductions below the contracted " +
  "minimum are not credited unless mutually agreed in writing."
);

sectionHeading("C.5  Payment Method", 2);
checkboxRow(`ACH/Bank Transfer — Routing: ${placeholder("ROUTING #")}  ·  Account: ${placeholder("ACCT #")}`);
checkboxRow("Credit Card — Customer to provide card on file via Provider's billing portal");
checkboxRow(`Check — Payable to: Siebert Repair Services LLC, 4 Maple Court, Washingtonville, NY 10992`);
checkboxRow("Other: " + placeholder("PAYMENT METHOD"));

sectionHeading("C.6  Billing Contact", 2);
bodyText(
  `Name: ${placeholder("BILLING CONTACT NAME")}  ·  Email: ${placeholder("BILLING EMAIL")}  ·  ` +
  `Phone: ${placeholder("BILLING PHONE")}`
);

sectionHeading("C.7  Hardware & Pass-Through Costs", 2);
bodyText(
  "Hardware, software licensing, and third-party service fees procured on Customer's behalf are invoiced " +
  "at cost plus fifteen percent (15%) unless a different rate is specified in the Order Form. Customer " +
  "will provide written approval for any single procurement exceeding $" + placeholder("APPROVAL THRESHOLD, e.g., 2,500") + "."
);

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE D — CUSTOMER RESPONSIBILITIES
// ─────────────────────────────────────────────────────────────────────────────
addPage();

doc.font(FONTS.bold).fontSize(14).fillColor(COLORS.navy)
  .text("SCHEDULE D", PAGE.margin, 80, { width: CONTENT_WIDTH, align: "center" });
doc.font(FONTS.bold).fontSize(11).fillColor(COLORS.blue)
  .text("Customer Responsibilities & Acceptable Use", PAGE.margin, doc.y + 4, { width: CONTENT_WIDTH, align: "center" });
hRule(COLORS.blue, 1.5);
doc.moveDown(0.4);

sectionHeading("D.1  Technical Environment", 2);
bodyText("Customer is responsible for maintaining the following minimum baseline requirements:");
bulletList([
  "Operating systems at levels supported by the manufacturer (no end-of-life OS on production systems).",
  "Vendor-supported hardware — Provider may decline to manage hardware beyond end of manufacturer support.",
  "Adequate internet connectivity (minimum 25 Mbps symmetric, with separate guest Wi-Fi if applicable).",
  "Licensed copies of all software; Customer will provide license keys and documentation upon request.",
  "Uninterruptible power supplies (UPS) on all servers and network equipment.",
]);

sectionHeading("D.2  Access & Cooperation", 2);
bulletList([
  "Designate and maintain a primary IT point of contact with authority to approve changes.",
  "Provide administrative credentials and access to all in-scope systems within 10 Business Days of Effective Date.",
  "Grant Provider remote access via Provider's approved remote-access tools (e.g., RMM agent, VPN).",
  "Approve planned changes within 5 Business Days of Provider's request or accept default scheduling.",
  "Allow Provider to perform patching during maintenance windows without requiring per-patch approval.",
  "Notify Provider of planned IT changes (hardware purchases, new software, organizational changes) with at least 5 Business Days' notice.",
]);

sectionHeading("D.3  User Security Obligations", 2);
bulletList([
  "Enroll all Authorized Users in Provider-managed MFA within 30 days of onboarding.",
  "Complete Provider's annual security-awareness training (Business and Enterprise tiers).",
  "Not share credentials or disable security software installed by Provider.",
  "Report suspected phishing, malware, or security incidents to Provider's help desk within 1 hour of discovery.",
  "Secure physical access to workstations, servers, and network equipment.",
]);

sectionHeading("D.4  Acceptable Use", 2);
bodyText("Authorized Users shall not use Provider-managed systems or networks to:");
bulletList([
  "Access, transmit, or store unlawful, infringing, or obscene material.",
  "Conduct unauthorized network scanning, penetration testing, or vulnerability scanning without Provider's prior written approval.",
  "Install or execute unauthorized software, particularly software obtained from unofficial sources.",
  "Circumvent or disable security controls, firewalls, endpoint protection, or MFA.",
  "Use company resources for personal cryptocurrency mining or other resource-intensive personal activities.",
  "Violate any third-party terms of service for cloud services managed under this Agreement.",
]);

sectionHeading("D.5  Third-Party Vendor Management", 2);
bodyText(
  "Customer must include Provider in any vendor communications regarding changes to IT-adjacent services " +
  "(internet circuits, phone systems, cloud platforms, line-of-business applications). Customer will " +
  "authorize Provider to communicate directly with relevant vendors on Customer's behalf by executing " +
  "a Letter of Authorization (LOA) provided by Provider."
);

sectionHeading("D.6  Compliance Obligations", 2);
bodyText(
  "Customer is solely responsible for understanding and complying with any regulatory obligations " +
  "applicable to its industry (HIPAA, GLBA, CMMC, SOC 2, NY SHIELD, etc.). Provider's Services are " +
  "designed to support compliance but do not guarantee Customer's compliance with any regulatory framework. " +
  "If a specific Addendum (e.g., Addendum 4 — Compliance) is attached, the obligations therein supplement " +
  "this Section."
);

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE E — DATA PROTECTION
// ─────────────────────────────────────────────────────────────────────────────
addPage();

doc.font(FONTS.bold).fontSize(14).fillColor(COLORS.navy)
  .text("SCHEDULE E", PAGE.margin, 80, { width: CONTENT_WIDTH, align: "center" });
doc.font(FONTS.bold).fontSize(11).fillColor(COLORS.blue)
  .text("Data Protection & Security Addendum", PAGE.margin, doc.y + 4, { width: CONTENT_WIDTH, align: "center" });
hRule(COLORS.blue, 1.5);
doc.moveDown(0.4);

sectionHeading("E.1  Data Processing Roles", 2);
bodyText(
  "Customer is the controller (or equivalent) of Customer Data, including any Personal Data. Provider " +
  "acts as a processor (or equivalent) processing Personal Data solely on Customer's documented instructions " +
  "and as necessary to perform the Services. Provider will not sell, rent, or disclose Customer Data to " +
  "third parties except as required to deliver the Services or as required by law."
);

sectionHeading("E.2  Security Controls", 2);
bodyText("Provider maintains the following minimum security controls:");
bulletList([
  "Encryption of data in transit using TLS 1.2 or higher.",
  "Encryption of sensitive data at rest (servers, backup media, portable media).",
  "Role-based access controls (RBAC) limiting Provider staff access to Customer Data to those with a need to know.",
  "Multi-factor authentication enforced for all Provider staff accessing Customer systems.",
  "Annual third-party vulnerability assessment of Provider's internal systems.",
  "Documented incident response plan with annual tabletop exercises.",
  "Background checks for all Provider employees and subcontractors with Customer Data access.",
]);

sectionHeading("E.3  Subprocessors", 2);
bodyText(
  "Provider engages the following subprocessors to deliver the Services as of the Effective Date. " +
  "Each subprocessor is bound by written terms imposing data-protection obligations equivalent to those " +
  "in this Schedule E. Provider will provide at least thirty (30) days' prior written notice (via the " +
  `notice address in §17 or via email to Customer's primary contact) before adding or replacing any ` +
  "subprocessor that materially processes Customer Data."
);
doc.moveDown(0.3);
const subWidths = [0.28, 0.32, 0.25, 0.15].map((w) => w * CONTENT_WIDTH);
tableRow(["Function", "Subprocessor", "Data Processed", "Hosting Region"], subWidths, true, true);
tableRow([
  "RMM / PSA platform",
  placeholder("RMM/PSA VENDOR, e.g., NinjaOne / ConnectWise / Datto Autotask"),
  "Device telemetry, asset inventory, ticket data",
  "United States",
], subWidths, false, false);
tableRow([
  "Endpoint Detection & Response (EDR)",
  placeholder("EDR VENDOR, e.g., SentinelOne / CrowdStrike / Huntress"),
  "Endpoint security telemetry, threat indicators",
  "United States",
], subWidths, false, true);
tableRow([
  "Backup & disaster-recovery cloud",
  placeholder("BACKUP VENDOR, e.g., Datto / Veeam Cloud Connect / Axcient"),
  "Server, endpoint, and Microsoft 365 backup data",
  "United States",
], subWidths, false, false);
tableRow([
  "After-hours NOC / SOC partner",
  placeholder("NOC/SOC PARTNER, e.g., Continuum / Blackpoint Cyber"),
  "Alerting metadata, incident response logs",
  "United States",
], subWidths, false, true);
tableRow([
  "Microsoft 365 / Azure hosting",
  "Microsoft Corporation",
  "Customer email, files, identity (Customer's own tenant)",
  "United States",
], subWidths, false, false);
tableRow([
  "Documentation / knowledge base",
  placeholder("DOCS VENDOR, e.g., IT Glue / Hudu"),
  "Configuration data, network diagrams, credentials (encrypted at rest)",
  "United States",
], subWidths, false, true);
tableRow([
  "Email & collaboration (Provider-side)",
  "Microsoft 365 (Provider tenant)",
  "Customer correspondence, support tickets sent by email",
  "United States",
], subWidths, false, false);
doc.moveDown(0.3);
bodyText(
  "An updated subprocessor list is also available on request to compliance@siebertservices.com. If " +
  "Customer has a reasonable, documented objection to a new or replacement subprocessor, the parties " +
  "will work in good faith to identify an alternative; if no commercially reasonable alternative is " +
  "available, Customer may terminate the affected Service without penalty as set forth in §9.3 of the " +
  "main Agreement."
);

sectionHeading("E.4  Data Retention & Return", 2);
bodyText(
  "Upon termination of this Agreement, Provider will: (a) return Customer Data in a standard format " +
  "(e.g., CSV, common backup format) within thirty (30) days upon written request; and (b) securely " +
  "delete or destroy Provider's copies of Customer Data within sixty (60) days of the later of " +
  "termination or Customer's written confirmation that data return is complete."
);

sectionHeading("E.5  NY SHIELD Act Compliance", 2);
bodyText(
  "Provider maintains a written information security program (WISP) that satisfies the New York SHIELD " +
  "Act (NY Gen. Bus. Law § 899-bb) requirements applicable to a service provider handling private " +
  "information of New York residents. Provider will provide a summary of its WISP upon written request."
);

sectionHeading("E.6  Security Incident Notification", 2);
bodyText(
  "Provider will notify Customer without undue delay (and in any event within seventy-two (72) hours) " +
  "of discovering a confirmed breach or unauthorized access to Customer Data. Notification will include: " +
  "(a) date of discovery; (b) nature of the incident; (c) categories and approximate number of affected " +
  "individuals and records; (d) mitigation steps taken; and (e) Provider's incident response contact."
);

sectionHeading("E.7  Regulatory Assistance", 2);
bodyText(
  "Provider will cooperate reasonably with Customer's obligations to respond to data subject requests, " +
  "regulatory inquiries, and audits related to Customer Data, at Customer's expense for Provider's " +
  "reasonable time and costs beyond standard Services."
);

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONAL ADDENDA
// ─────────────────────────────────────────────────────────────────────────────
addPage();

doc.font(FONTS.bold).fontSize(14).fillColor(COLORS.navy)
  .text("OPTIONAL ADDENDA", PAGE.margin, 80, { width: CONTENT_WIDTH, align: "center" });
hRule(COLORS.blue, 1.5);
doc.moveDown(0.4);

const addenda = [
  {
    num: "1",
    title: "Cybersecurity / Managed SOC",
    scope: "This Addendum governs Provider's managed security services beyond the baseline EDR included in the " +
      "Business and Enterprise tiers.",
    includes: [
      "24/7 Managed Security Operations Center (SOC) monitoring and alert triage",
      "SIEM log aggregation and correlation (via Provider's or Customer's SIEM platform)",
      "Dark-web credential monitoring for Customer's email domain(s)",
      "Quarterly phishing simulation campaigns and results reporting",
      "Incident response retainer: up to " + placeholder("IR RETAINER HOURS, e.g., 8 hours") + "/year included",
      "Fractional vCISO advisory: " + placeholder("VCISO HOURS, e.g., 4 hours/month") + " included",
    ],
    pricing: `$${placeholder("ADDENDUM MONTHLY FEE")}/month or per Order Form`,
  },
  {
    num: "2",
    title: "Cloud & Microsoft 365 Management",
    scope: "Extends the baseline M365 administration included in all tiers to include full managed cloud operations.",
    includes: [
      "Microsoft 365 E3/E5 licensing procurement and lifecycle management",
      "Azure / Google Workspace / AWS administration (per Order Form scope)",
      "Entra ID (Azure AD) conditional access, SSPR, and privileged identity management (PIM)",
      "Microsoft Intune device management (MDM/MAM policy deployment)",
      "SharePoint Online / OneDrive governance and structure setup",
      "Migration services (email, file share, Teams): scoped separately in Order Form",
    ],
    pricing: `$${placeholder("ADDENDUM MONTHLY FEE")}/month or per Order Form`,
  },
  {
    num: "3",
    title: "Backup & Disaster Recovery",
    scope: "Governs immutable backup and disaster-recovery services beyond the monitoring included in Business tier.",
    includes: [
      "Daily immutable cloud backups for servers, endpoints, and Microsoft 365 data",
      `Recovery Time Objective (RTO): ${placeholder("RTO, e.g., 4 hours")} for Priority systems`,
      `Recovery Point Objective (RPO): ${placeholder("RPO, e.g., 24 hours")} standard, ${placeholder("PREMIUM RPO, e.g., 4 hours")} for Priority systems`,
      "Quarterly tested restores with written results report",
      "Offsite geo-redundant storage (US-based data centers)",
      "Ransomware-resistant backup retention: 30 daily / 12 monthly / 7 yearly snapshots",
    ],
    pricing: `$${placeholder("ADDENDUM MONTHLY FEE")}/month or per Order Form`,
  },
  {
    num: "4",
    title: "Compliance (HIPAA / SOC 2 / CMMC)",
    scope: "Governs Provider's compliance-support services. Does not constitute legal, audit, or regulatory advice.",
    includes: [
      "Initial gap assessment against selected framework(s): " + placeholder("FRAMEWORKS, e.g., HIPAA, CMMC L2"),
      "Control deployment roadmap with task ownership matrix",
      "Policy and procedure authoring (based on Provider templates)",
      "Evidence collection and maintenance for selected controls",
      "Pre-audit readiness review (not a substitute for certified auditor engagement)",
      "Quarterly compliance status reports to designated Customer representative",
    ],
    pricing: `$${placeholder("ADDENDUM MONTHLY FEE")}/month or per Order Form. Audit readiness engagements quoted separately.`,
  },
  {
    num: "5",
    title: "Network Infrastructure",
    scope: "Governs design, deployment, and management of Customer's network infrastructure.",
    includes: [
      "Managed firewall (Fortinet, Palo Alto, or Cisco Meraki — per Order Form)",
      "Managed switching and Wi-Fi (Cisco Meraki, Ubiquiti, or equivalent)",
      "SD-WAN design and management",
      "VPN (site-to-site and remote access) deployment and monitoring",
      "Quarterly firewall policy review and cleanup",
      "Structured cabling oversight (subcontracted cabling vendor, coordinated by Provider)",
    ],
    pricing: `Hardware costs pass-through (cost + 15%). Monthly management: $${placeholder("NETWORK MGMT FEE")}/month.`,
  },
  {
    num: "6",
    title: "VoIP & Telephony",
    scope: "Governs Provider's provisioning and management of cloud telephone services.",
    includes: [
      "Cloud phone system provisioning: " + placeholder("PLATFORM, e.g., Zoom Phone, RingCentral, Microsoft Teams Phone"),
      "Number porting and DID provisioning",
      "Auto-attendant, call queue, and voicemail configuration",
      "Softphone and desk-phone provisioning (hardware pass-through)",
      "Ongoing administration: adds/moves/changes, extension management",
      "Monthly billing reconciliation against contracted seat counts",
    ],
    pricing: `$${placeholder("VOIP SEAT RATE")}/seat/month + platform licensing (pass-through).`,
  },
  {
    num: "7",
    title: "Hardware & Software Reselling",
    scope: "Governs Customer's purchase of hardware and software licensing through Provider.",
    includes: [
      "Authorized reseller for: HP, Dell, Lenovo, Microsoft, Adobe, and other manufacturer partners",
      "Procurement, imaging, and asset tagging included for managed clients",
      "Microsoft SPLA and CSP licensing management",
      "Hardware asset tracking in Provider's RMM platform",
      "Warranty tracking and RMA coordination",
      `Annual software-license reconciliation (Microsoft, Adobe, and others)`,
    ],
    pricing: "Hardware and software: cost + 15% unless volume pricing is negotiated separately. No markup on licenses sourced at Microsoft CSP rates.",
    extra: "Hardware Return & E-Waste: Hardware that is owned by Provider and loaned, leased, or " +
      "consigned to Customer (including loaner laptops, evaluation units, and Provider-owned spares) " +
      "shall be returned to Provider within thirty (30) days after termination of the applicable Order " +
      "Form, in substantially the same condition as delivered, ordinary wear and tear excepted. " +
      "Customer is responsible for shipping costs for returns within the continental United States; " +
      "Provider will provide return labels on request. Hardware not returned within the thirty (30) day " +
      "window will be invoiced at the depreciated replacement value set forth in the applicable Order " +
      "Form (or, if not specified, at fair market value as reasonably determined by Provider). For " +
      "Customer-owned hardware that Customer wishes to dispose of through Provider, Provider offers " +
      "secure data sanitization (NIST SP 800-88-aligned) and certified e-waste recycling at Provider's " +
      "then-current rates. A certificate of data destruction will be provided for each device sanitized.",
  },
];

addenda.forEach((add, i) => {
  if (i > 0 && i % 2 === 0 && doc.y > PAGE.height - 300) addPage();
  doc.moveDown(0.5);
  const y = doc.y;
  doc.rect(PAGE.margin, y, CONTENT_WIDTH, 18).fill(COLORS.navyMed);
  doc.font(FONTS.bold).fontSize(9.5).fillColor(COLORS.white)
    .text(`ADDENDUM ${add.num} — ${add.title}`, PAGE.margin + 6, y + 3, { width: CONTENT_WIDTH - 12 });
  doc.y = y + 22;

  doc.font(FONTS.italic).fontSize(9).fillColor(COLORS.gray)
    .text(add.scope, PAGE.margin + 4, doc.y, { width: CONTENT_WIDTH - 8 });
  doc.moveDown(0.3);

  doc.font(FONTS.bold).fontSize(8.5).fillColor(COLORS.navyMed).text("Included Services:", PAGE.margin + 4);
  doc.moveDown(0.1);
  add.includes.forEach(inc => {
    doc.font(FONTS.regular).fontSize(8.5).fillColor(COLORS.gray)
      .text(`•  ${inc}`, PAGE.margin + 12, doc.y, { width: CONTENT_WIDTH - 20 });
    doc.moveDown(0.12);
  });
  doc.moveDown(0.15);
  doc.font(FONTS.bold).fontSize(8.5).fillColor(COLORS.navyMed)
    .text("Pricing: ", PAGE.margin + 4, doc.y, { continued: true });
  doc.font(FONTS.regular).fontSize(8.5).fillColor(COLORS.gray)
    .text(add.pricing, { width: CONTENT_WIDTH - 20 });
  if (add.extra) {
    doc.moveDown(0.25);
    doc.font(FONTS.italic).fontSize(8.5).fillColor(COLORS.gray)
      .text(add.extra, PAGE.margin + 4, doc.y, { width: CONTENT_WIDTH - 8, align: "justify" });
  }
  doc.moveDown(0.2);
  doc.rect(PAGE.margin, doc.y, CONTENT_WIDTH, 0.5).fill(COLORS.rule);
  doc.moveDown(0.3);
});

// ============================================================
// ADDENDUM 4-A — BUSINESS ASSOCIATE AGREEMENT (HIPAA)
// ============================================================
// Only the rendered template — Customer signs it as a rider when their
// environment processes Protected Health Information (PHI).
// ============================================================
addPage();
doc.font(FONTS.bold).fontSize(14).fillColor(COLORS.navy)
  .text("ADDENDUM 4-A", PAGE.margin, 80, { width: CONTENT_WIDTH, align: "center" });
doc.moveDown(0.2);
doc.font(FONTS.bold).fontSize(12).fillColor(COLORS.navyMed)
  .text("BUSINESS ASSOCIATE AGREEMENT (HIPAA)", { width: CONTENT_WIDTH, align: "center" });
doc.moveDown(0.2);
doc.font(FONTS.italic).fontSize(9).fillColor(COLORS.gray)
  .text(
    "This Addendum 4-A applies only when Customer signs it below or otherwise notifies Provider in writing " +
    "that Provider will create, receive, maintain, or transmit Protected Health Information (\"PHI\") on " +
    "Customer's behalf. Capitalized terms not defined here have the meaning given in 45 C.F.R. §§ 160.103 " +
    "and 164.501.",
    { width: CONTENT_WIDTH, align: "justify" }
  );
doc.moveDown(0.5);

sectionHeading("1.  Definitions", 2);
bodyText(
  "\"Business Associate\" means Provider. \"Covered Entity\" means Customer. \"PHI\" has the meaning given " +
  "at 45 C.F.R. § 160.103 and includes Electronic PHI (\"ePHI\"). \"HIPAA Rules\" means the Privacy, " +
  "Security, Breach Notification, and Enforcement Rules at 45 C.F.R. Parts 160 and 164, as amended " +
  "(including by the HITECH Act and the Omnibus Rule)."
);

sectionHeading("2.  Permitted Uses and Disclosures", 2);
bodyText(
  "Business Associate may use or disclose PHI only as necessary to perform the Services for or on behalf " +
  "of Covered Entity, as required by law, or as expressly permitted by this Addendum. Business Associate " +
  "may use PHI for its own proper management and administration and to carry out its legal " +
  "responsibilities, and may disclose PHI for those purposes if (a) the disclosure is required by law, or " +
  "(b) Business Associate obtains reasonable assurances from the recipient that the PHI will be held " +
  "confidentially and used or further disclosed only as required by law or for the purpose for which it " +
  "was disclosed, and the recipient notifies Business Associate of any breach of confidentiality."
);

sectionHeading("3.  Safeguards", 2);
bodyText(
  "Business Associate will implement and maintain appropriate administrative, physical, and technical " +
  "safeguards in accordance with the Security Rule (45 C.F.R. Part 164, Subpart C) to prevent the use or " +
  "disclosure of ePHI other than as provided in this Addendum, including encryption of ePHI in transit " +
  "and at rest, role-based access controls, audit logging, and workforce HIPAA training."
);

sectionHeading("4.  Reporting of Breaches and Security Incidents", 2);
bodyText(
  "Business Associate will report to Covered Entity, without unreasonable delay and in no event later " +
  "than five (5) business days after Discovery, any (a) Breach of Unsecured PHI, (b) use or disclosure of " +
  "PHI not permitted by this Addendum, or (c) Security Incident affecting ePHI. Routine, unsuccessful " +
  "attempts at unauthorized access (port scans, blocked login attempts, etc.) that do not result in " +
  "access to ePHI are reported in the aggregate on a quarterly basis. Each report will include the " +
  "information required under 45 C.F.R. § 164.410, to the extent known."
);

sectionHeading("5.  Subcontractors", 2);
bodyText(
  "Business Associate will require any subcontractor that creates, receives, maintains, or transmits PHI " +
  "on its behalf to agree, in writing, to restrictions and conditions that are at least as stringent as " +
  "those that apply to Business Associate under this Addendum (a \"Downstream BAA\"). Business Associate's " +
  "subprocessors as of the Effective Date are listed in Schedule E.3."
);

sectionHeading("6.  Access, Amendment, Accounting", 2);
bodyText(
  "To the extent Business Associate maintains PHI in a Designated Record Set, Business Associate will: " +
  "(a) make such PHI available to Covered Entity within fifteen (15) business days of a written request " +
  "to enable Covered Entity to meet its obligations under 45 C.F.R. § 164.524; (b) make amendments to " +
  "PHI as directed by Covered Entity in accordance with 45 C.F.R. § 164.526; and (c) maintain and make " +
  "available the information required to provide an accounting of disclosures in accordance with 45 " +
  "C.F.R. § 164.528."
);

sectionHeading("7.  Compliance with Covered Entity Obligations", 2);
bodyText(
  "To the extent Business Associate is to carry out one or more of Covered Entity's obligations under " +
  "Subpart E of 45 C.F.R. Part 164, Business Associate will comply with the requirements of Subpart E " +
  "that apply to Covered Entity in the performance of those obligations."
);

sectionHeading("8.  HHS Audit Cooperation", 2);
bodyText(
  "Business Associate will make its internal practices, books, and records relating to the use and " +
  "disclosure of PHI available to the Secretary of the U.S. Department of Health and Human Services " +
  "for purposes of determining Covered Entity's compliance with the HIPAA Rules."
);

sectionHeading("9.  Term and Termination", 2);
bodyText(
  "This Addendum is effective on the same date as the underlying Agreement and terminates on the earlier " +
  "of: (a) termination of the Agreement; (b) Covered Entity's written notice that Business Associate is " +
  "no longer providing Services involving PHI; or (c) termination by Covered Entity for material breach " +
  "as set forth in 45 C.F.R. § 164.504(e)(2)(iii). Upon termination, Business Associate will return or " +
  "destroy all PHI received from, or created or received by Business Associate on behalf of, Covered " +
  "Entity that Business Associate still maintains. If return or destruction is infeasible, Business " +
  "Associate will extend the protections of this Addendum to such PHI and limit further uses and " +
  "disclosures to those purposes that make the return or destruction infeasible, for so long as Business " +
  "Associate maintains the PHI."
);

sectionHeading("10.  Indemnification and Insurance", 2);
bodyText(
  "Business Associate will maintain Cyber Liability insurance with limits of not less than the amount " +
  "set forth in §14 of the main Agreement, which coverage will extend to HIPAA-related claims. The " +
  "indemnification provisions of §13 of the main Agreement apply to claims arising from Business " +
  "Associate's breach of this Addendum, subject to the limitations set forth therein, except that " +
  "Business Associate's liability for civil monetary penalties imposed directly on Covered Entity by " +
  "the U.S. Department of Health and Human Services arising solely from Business Associate's failure to " +
  "comply with the HIPAA Rules is excluded from the cap in §12 to the extent required by law."
);

sectionHeading("11.  Order of Precedence", 2);
bodyText(
  "In the event of any conflict between this Addendum and the underlying Agreement (including any other " +
  "Addendum or Schedule) with respect to the handling of PHI, this Addendum controls."
);

doc.moveDown(0.6);
doc.font(FONTS.italic).fontSize(8).fillColor(COLORS.lightGray)
  .text(
    "Acknowledged: ____________________________  (Customer)     " +
    "Date: ______________     " +
    "Acknowledged: ____________________________  (Provider)     " +
    "Date: ______________",
    PAGE.margin, doc.y, { width: CONTENT_WIDTH }
  );

// End
doc.end();

stream.on("finish", () => {
  console.log(`\n✅  PDF generated: ${OUTPUT_PATH}\n`);
});

stream.on("error", (err) => {
  console.error("PDF generation error:", err);
  process.exit(1);
});
