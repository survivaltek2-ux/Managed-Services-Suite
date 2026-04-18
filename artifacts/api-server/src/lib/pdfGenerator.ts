import PDFDocument from "pdfkit";

const NAVY = "#032d60";
const PRIMARY = "#0176d3";
const TEXT = "#1f2937";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";

const HIPAA_SECTIONS: { title: string; section: string; items: string[] }[] = [
  {
    title: "Administrative Safeguards",
    section: "§164.308",
    items: [
      "Conduct a written, accurate, and thorough risk analysis (164.308(a)(1)(ii)(A))",
      "Implement risk management measures sufficient to reduce risks to a reasonable level",
      "Apply sanction policies for workforce members who fail to comply with policies",
      "Information system activity review — regular log review and audit-trail analysis",
      "Designate a HIPAA Security Officer with documented responsibilities",
      "Workforce clearance procedures and supervision for staff with PHI access",
      "Termination procedures: revoke access on the same day as departure",
      "Information access management — role-based access aligned to least-privilege",
      "Security awareness training (initial + ongoing reminders, malware/phishing protection)",
      "Password management training and policies",
      "Security incident procedures: detection, response, and reporting",
      "Contingency plan: data backup, disaster recovery, emergency mode operation",
      "Periodic technical and non-technical evaluations of safeguards",
      "Business Associate Agreements (BAAs) signed with every vendor that touches PHI",
    ],
  },
  {
    title: "Physical Safeguards",
    section: "§164.310",
    items: [
      "Facility access controls: locked doors, visitor logs, badge access where appropriate",
      "Workstation use policies — appropriate use, location, and surrounding workspace",
      "Workstation security: cable locks, privacy screens, lock-on-walk-away enforced",
      "Device & media controls: documented disposal of hardware and media containing PHI",
      "Media re-use procedures (sanitization / destruction certificates)",
      "Asset inventory of all hardware and electronic media containing ePHI",
      "Backup of ePHI before equipment is moved",
    ],
  },
  {
    title: "Technical Safeguards",
    section: "§164.312",
    items: [
      "Unique user IDs for every workforce member (no shared accounts)",
      "Emergency access procedure to retrieve ePHI during a system outage",
      "Automatic logoff after a defined period of inactivity",
      "Encryption of ePHI at rest (full-disk + database) and in transit (TLS 1.2+)",
      "Audit controls: hardware/software/procedural mechanisms recording activity in systems with ePHI",
      "Integrity controls — mechanisms to authenticate ePHI has not been altered",
      "Person or entity authentication: MFA on all remote access and admin accounts",
      "Transmission security: encryption + integrity for ePHI sent over open networks",
    ],
  },
  {
    title: "Organizational Requirements & Policies",
    section: "§164.314 & §164.316",
    items: [
      "Written policies and procedures for every required safeguard",
      "Documentation retained for 6 years from creation or last effective date",
      "Periodic review and update of policies (at least annually)",
      "BAAs with all subcontractors that handle PHI",
      "Workforce member confidentiality agreements signed",
    ],
  },
  {
    title: "Breach Notification Readiness",
    section: "§164.400–414",
    items: [
      "Defined process for assessing whether an incident is a reportable breach",
      "Notification template: notify affected individuals within 60 days",
      "HHS notification process: <500 affected → annual log, ≥500 → immediate report",
      "Media notification readiness for breaches affecting >500 in a state",
      "Breach response team and contact tree documented",
    ],
  },
];

const BUYERS_QUESTIONS: { num: number; q: string; why: string; lookFor: string }[] = [
  {
    num: 1,
    q: "What's your guaranteed response time, and is it in writing?",
    why: "Many MSPs advertise '24/7 support' but bury vague response times in their SLA — or have none at all.",
    lookFor: "A written SLA with response and resolution times by severity (e.g., 15-min for outages, 1-hr for high-priority).",
  },
  {
    num: 2,
    q: "What does your cybersecurity stack actually include?",
    why: "Antivirus alone is no longer adequate. Modern threats need EDR/MDR + 24/7 monitoring.",
    lookFor: "EDR or MDR with a real SOC, DNS filtering, email security, MFA enforcement, and monthly vulnerability scans.",
  },
  {
    num: 3,
    q: "How often do you test our backups?",
    why: "Backups that haven't been restore-tested are wishful thinking. Most ransomware victims discover failures during the incident.",
    lookFor: "Quarterly restore tests, immutable off-site copies, and documented RTO/RPO targets.",
  },
  {
    num: 4,
    q: "Who actually answers the phone — and where are they based?",
    why: "Tier-1 outsourced support reads from a script. You want engineers who know your environment.",
    lookFor: "US-based help desk with low staff turnover and named technical leads assigned to your account.",
  },
  {
    num: 5,
    q: "What's included vs. what's billed extra?",
    why: "Cheap monthly rates often hide project fees, after-hours surcharges, or 'out of scope' tickets.",
    lookFor: "All-inclusive flat rate covering normal break/fix, patching, monitoring, and onboarding/offboarding.",
  },
  {
    num: 6,
    q: "How do you proactively reduce our IT issues over time?",
    why: "A reactive 'fix it when broken' MSP wastes your money. Strategic MSPs prevent issues.",
    lookFor: "Quarterly business reviews, documented IT roadmap, and reporting on ticket trends.",
  },
  {
    num: 7,
    q: "How do you onboard a new client?",
    why: "Bad onboarding = months of pain. The first 30 days predict the next 5 years.",
    lookFor: "A documented 30/60/90 plan, dedicated onboarding manager, and a network discovery + documentation phase.",
  },
  {
    num: 8,
    q: "Can I see your incident response plan?",
    why: "When ransomware hits at 2am, you need a plan — not improvisation.",
    lookFor: "Written IR plan with named roles, escalation paths, and at least annual tabletop exercises.",
  },
  {
    num: 9,
    q: "What certifications and compliance frameworks do you support?",
    why: "If you're regulated (HIPAA, PCI, CMMC), your MSP must understand your obligations.",
    lookFor: "Vendor partnerships (Microsoft, SonicWall, etc.), CompTIA-certified engineers, and demonstrated experience with your framework.",
  },
  {
    num: 10,
    q: "Can I talk to 3 reference clients in my industry, similar in size?",
    why: "Anyone can show you a logo wall. Conversations reveal the truth.",
    lookFor: "References they're willing to introduce by phone — and questions you can ask about responsiveness, billing, and trust.",
  },
];

function bufferDoc(doc: InstanceType<typeof PDFDocument>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

function drawHeader(doc: InstanceType<typeof PDFDocument>, eyebrow: string, title: string, subtitle: string) {
  doc.fillColor(PRIMARY).font("Helvetica-Bold").fontSize(9).text(eyebrow.toUpperCase(), { characterSpacing: 1.5 });
  doc.moveDown(0.2);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(22).text(title);
  doc.moveDown(0.3);
  doc.fillColor(MUTED).font("Helvetica").fontSize(10).text(subtitle, { lineGap: 2 });
  const y = doc.y + 6;
  doc.moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.width - doc.page.margins.right, y)
    .lineWidth(2)
    .strokeColor(PRIMARY)
    .stroke();
  doc.moveDown(1);
}

function drawFooter(doc: InstanceType<typeof PDFDocument>) {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    const bottom = doc.page.height - doc.page.margins.bottom + 12;
    doc.fillColor(MUTED).font("Helvetica").fontSize(8);
    doc.text(
      `Siebert Services  ·  866-484-9180  ·  sales@siebertrservices.com  ·  siebertrservices.com`,
      doc.page.margins.left,
      bottom,
      { width: doc.page.width - doc.page.margins.left - doc.page.margins.right, align: "left" },
    );
    doc.text(
      `Page ${i + 1} of ${range.count}`,
      doc.page.margins.left,
      bottom,
      { width: doc.page.width - doc.page.margins.left - doc.page.margins.right, align: "right" },
    );
  }
}

export async function generateHipaaChecklistPdf(): Promise<Buffer> {
  const doc = new PDFDocument({ size: "LETTER", margins: { top: 56, bottom: 64, left: 56, right: 56 }, bufferPages: true });

  drawHeader(
    doc,
    "Siebert Services",
    "HIPAA Compliance Checklist",
    "A practical checklist mapped to the HIPAA Security Rule (45 CFR §164.308–316). For medical, dental, and behavioral-health practices.",
  );

  for (const s of HIPAA_SECTIONS) {
    if (doc.y > doc.page.height - doc.page.margins.bottom - 120) doc.addPage();
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(14).text(s.title, { continued: true });
    doc.fillColor(MUTED).font("Helvetica").fontSize(9).text(`   ${s.section}`);
    doc.moveDown(0.4);

    for (const item of s.items) {
      const boxX = doc.page.margins.left;
      const boxSize = 9;
      const textWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right - boxSize - 8;
      doc.fillColor(TEXT).font("Helvetica").fontSize(10);
      const itemHeight = doc.heightOfString(item, { width: textWidth, lineGap: 2 });
      if (doc.y + itemHeight > doc.page.height - doc.page.margins.bottom - 6) doc.addPage();
      const startY = doc.y;
      doc.lineWidth(1).strokeColor("#9ca3af").rect(boxX, startY + 2, boxSize, boxSize).stroke();
      doc.fillColor(TEXT).font("Helvetica").fontSize(10)
        .text(item, boxX + boxSize + 8, startY, { width: textWidth, lineGap: 2 });
      doc.moveDown(0.25);
    }
    doc.moveDown(0.5);
  }

  if (doc.y > doc.page.height - doc.page.margins.bottom - 100) doc.addPage();
  doc.moveDown(0.5);
  doc.strokeColor(BORDER).lineWidth(1)
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .stroke();
  doc.moveDown(0.6);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(11).text("Need help closing the gaps?");
  doc.fillColor(TEXT).font("Helvetica").fontSize(10)
    .text("Siebert Services builds HIPAA-ready stacks for medical, dental, and behavioral-health practices in under 30 days. Book a free HIPAA gap assessment at siebertrservices.com/contact.", { lineGap: 2 });
  doc.moveDown(0.4);
  doc.fillColor(MUTED).font("Helvetica-Oblique").fontSize(8)
    .text("This checklist is provided for informational purposes only and does not constitute legal advice. Consult your compliance counsel for your specific obligations.", { lineGap: 2 });

  drawFooter(doc);
  return bufferDoc(doc);
}

export async function generateBuyersGuidePdf(): Promise<Buffer> {
  const doc = new PDFDocument({ size: "LETTER", margins: { top: 56, bottom: 64, left: 56, right: 56 }, bufferPages: true });

  drawHeader(
    doc,
    "Siebert Services · Buyer's Guide",
    "10 Questions to Ask Before Hiring an MSP",
    "The same evaluation framework our highest-performing clients used to vet Siebert and 30+ other providers. Use it as a scoring rubric to compare 3–5 MSPs side-by-side.",
  );

  for (const q of BUYERS_QUESTIONS) {
    if (doc.y > doc.page.height - doc.page.margins.bottom - 120) doc.addPage();
    const startY = doc.y;
    const numSize = 22;
    doc.save();
    doc.circle(doc.page.margins.left + numSize / 2, startY + numSize / 2, numSize / 2)
      .fillColor(PRIMARY).fill();
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(12)
      .text(String(q.num), doc.page.margins.left, startY + 5, { width: numSize, align: "center" });
    doc.restore();

    const textX = doc.page.margins.left + numSize + 10;
    const textWidth = doc.page.width - doc.page.margins.right - textX;
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13)
      .text(q.q, textX, startY, { width: textWidth, lineGap: 2 });
    doc.moveDown(0.3);

    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text("Why it matters: ", textX, doc.y, { width: textWidth, continued: true });
    doc.fillColor(TEXT).font("Helvetica").fontSize(10).text(q.why, { width: textWidth, lineGap: 2 });
    doc.moveDown(0.2);

    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text("What to look for: ", textX, doc.y, { width: textWidth, continued: true });
    doc.fillColor(TEXT).font("Helvetica").fontSize(10).text(q.lookFor, { width: textWidth, lineGap: 2 });

    doc.moveDown(0.8);
    doc.x = doc.page.margins.left;
  }

  if (doc.y > doc.page.height - doc.page.margins.bottom - 160) doc.addPage();
  doc.moveDown(0.4);
  const boxX = doc.page.margins.left;
  const boxY = doc.y;
  const boxW = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  doc.save();
  doc.roundedRect(boxX, boxY, boxW, 110, 8).fillColor(NAVY).fill();
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(13).text("Scoring rubric", boxX + 16, boxY + 14);
  doc.fillColor("#ffffff").font("Helvetica").fontSize(10)
    .text("For each MSP, score every question 1 (poor) → 5 (excellent). Total possible: 50.", boxX + 16, boxY + 34, { width: boxW - 32, lineGap: 2 });
  doc.font("Helvetica-Bold").text("40–50:", boxX + 16, boxY + 60, { continued: true });
  doc.font("Helvetica").text(" Strong contender — request references and proposal.");
  doc.font("Helvetica-Bold").text("30–39:", boxX + 16, doc.y, { continued: true });
  doc.font("Helvetica").text(" Mixed — push back on weak areas before signing.");
  doc.font("Helvetica-Bold").text("< 30:", boxX + 16, doc.y, { continued: true });
  doc.font("Helvetica").text(" Walk away.");
  doc.restore();

  doc.y = boxY + 130;
  doc.x = doc.page.margins.left;
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(11).text("Want us to walk you through it live?");
  doc.fillColor(TEXT).font("Helvetica").fontSize(10)
    .text("Book a 30-minute consultation at siebertrservices.com/contact · 866-484-9180 · sales@siebertrservices.com", { lineGap: 2 });

  drawFooter(doc);
  return bufferDoc(doc);
}

export type LeadMagnetPdfKey = "hipaa_checklist" | "buyers_guide";

export async function generateLeadMagnetPdf(magnet: LeadMagnetPdfKey): Promise<{ buffer: Buffer; filename: string }> {
  if (magnet === "hipaa_checklist") {
    return { buffer: await generateHipaaChecklistPdf(), filename: "Siebert-Services-HIPAA-Compliance-Checklist.pdf" };
  }
  return { buffer: await generateBuyersGuidePdf(), filename: "Siebert-Services-MSP-Buyers-Guide.pdf" };
}
