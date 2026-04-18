import crypto from "crypto";
import { and, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { db, leadMagnetSubmissionsTable, leadMagnetSequenceSendsTable, leadMagnetSequenceStepsTable, siteSettingsTable } from "@workspace/db";
import { sendLeadMagnetFollowUpEmail, type LeadMagnetKey } from "./email.js";

export interface SequenceStep {
  step: number;
  delayDays: number;
  subject: string;
  intro: string;
  bodyHtml: (ctx: { name: string; baseUrl: string; unsubUrl: string }) => string;
}

export interface RenderedSequenceStep {
  step: number;
  delayDays: number;
  subject: string;
  intro: string;
  /** Rendered HTML body, with placeholders replaced. */
  html: string;
}

export interface SequenceStepView {
  step: number;
  delayDays: number;
  subject: string;
  intro: string;
  bodyHtml: string;
  defaults: { delayDays: number; subject: string; intro: string; bodyHtml: string };
  customized: boolean;
  updatedAt: Date | null;
}

const cta = (label: string, href: string) =>
  `<p style="margin:18px 0;"><a href="${href}" style="background:#032d60;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;">${label}</a></p>`;

export const SEQUENCES: Record<LeadMagnetKey, SequenceStep[]> = {
  cybersecurity_assessment: [
    {
      step: 1,
      delayDays: 2,
      subject: "The 3 attacks hitting SMBs hardest right now",
      intro: "How attackers get in — and the controls that stop them.",
      bodyHtml: ({ name, baseUrl }) => `
        <p style="font-size:14px;margin:0 0 16px;">Hi ${name},</p>
        <p style="font-size:14px;margin:0 0 16px;">Following up on your cybersecurity assessment — here are the three attack patterns we see most against businesses your size, plus the single control that blocks each:</p>
        <ul style="font-size:14px;color:#374151;line-height:1.6;padding-left:20px;margin:0 0 16px;">
          <li><strong>Business email compromise</strong> — blocked by enforced MFA and DMARC.</li>
          <li><strong>Ransomware via remote access</strong> — blocked by EDR and immutable off-site backups.</li>
          <li><strong>Vendor / supply-chain breach</strong> — blocked by quarterly vendor reviews and conditional access.</li>
        </ul>
        <p style="font-size:14px;margin:0 0 8px;">Want a Siebert specialist to walk through your specific gaps?</p>
        ${cta("Book a free 30-minute review", `${baseUrl}/contact?source=nurture_cybersecurity_d2`)}
      `,
    },
    {
      step: 2,
      delayDays: 5,
      subject: "Case study: how a 90-person firm cut breach risk 78%",
      intro: "Real numbers from a recent Siebert engagement.",
      bodyHtml: ({ name, baseUrl }) => `
        <p style="font-size:14px;margin:0 0 16px;">Hi ${name},</p>
        <p style="font-size:14px;margin:0 0 16px;">A 90-employee professional services firm came to us after a near-miss phishing incident. In 60 days we deployed managed EDR, hardened M365, ran phishing training, and stood up immutable backups.</p>
        <ul style="font-size:14px;color:#374151;line-height:1.6;padding-left:20px;margin:0 0 16px;">
          <li>Phishing click-through dropped from 22% to 3%.</li>
          <li>Mean time to detect endpoint compromise: <strong>under 9 minutes</strong>.</li>
          <li>Cyber insurance premium reduced 18% at renewal.</li>
        </ul>
        <p style="font-size:14px;margin:0 0 8px;">If your assessment surfaced gaps, we can put a similar plan in front of you in 7 days.</p>
        ${cta("See if you qualify for a free roadmap", `${baseUrl}/contact?source=nurture_cybersecurity_d5`)}
      `,
    },
    {
      step: 3,
      delayDays: 10,
      subject: "Last note — your next move on cyber risk",
      intro: "A quick offer before we close the loop.",
      bodyHtml: ({ name, baseUrl }) => `
        <p style="font-size:14px;margin:0 0 16px;">Hi ${name},</p>
        <p style="font-size:14px;margin:0 0 16px;">This is the last automated note from our team on the cybersecurity assessment. If you're still evaluating, the fastest next step is a 30-minute call where we map your highest-impact fixes — no obligation.</p>
        ${cta("Grab a 30-minute slot", `${baseUrl}/contact?source=nurture_cybersecurity_d10`)}
        <p style="font-size:14px;margin:0 0 8px;">If now isn't the right time, just ignore this note — we won't keep emailing you on this resource.</p>
      `,
    },
  ],
  downtime_calculator: [
    {
      step: 1,
      delayDays: 2,
      subject: "Where that downtime number actually comes from",
      intro: "The hidden costs your spreadsheet probably missed.",
      bodyHtml: ({ name, baseUrl }) => `
        <p style="font-size:14px;margin:0 0 16px;">Hi ${name},</p>
        <p style="font-size:14px;margin:0 0 16px;">Most teams undercount downtime cost by 30–50% because they only count payroll. Here's the full picture:</p>
        <ul style="font-size:14px;color:#374151;line-height:1.6;padding-left:20px;margin:0 0 16px;">
          <li>Lost revenue (orders not taken, calls not answered)</li>
          <li>SLA penalties and refunds</li>
          <li>Recovery overtime (often double-billed)</li>
          <li>Customer churn in the 90 days following an outage</li>
        </ul>
        <p style="font-size:14px;margin:0 0 8px;">Want our analyst to model your real annualized risk?</p>
        ${cta("Request a downtime risk modeling session", `${baseUrl}/contact?source=nurture_downtime_d2`)}
      `,
    },
    {
      step: 2,
      delayDays: 5,
      subject: "How Siebert clients cut unplanned downtime ~70%",
      intro: "The 4-part playbook that drives the result.",
      bodyHtml: ({ name, baseUrl }) => `
        <p style="font-size:14px;margin:0 0 16px;">Hi ${name},</p>
        <p style="font-size:14px;margin:0 0 16px;">Across our managed-IT clients, the average reduction in unplanned downtime is 68% in year one. The playbook:</p>
        <ol style="font-size:14px;color:#374151;line-height:1.6;padding-left:20px;margin:0 0 16px;">
          <li>24/7 monitoring with proactive ticketing.</li>
          <li>Automated patching with monthly compliance reports.</li>
          <li>Redundancy on the top 3 single points of failure.</li>
          <li>1-hour response SLA with on-call escalation.</li>
        </ol>
        ${cta("See pricing for your team size", `${baseUrl}/pricing?source=nurture_downtime_d5`)}
      `,
    },
    {
      step: 3,
      delayDays: 10,
      subject: "Final note: turn your downtime number into a plan",
      intro: "30-minute call to make this concrete.",
      bodyHtml: ({ name, baseUrl }) => `
        <p style="font-size:14px;margin:0 0 16px;">Hi ${name},</p>
        <p style="font-size:14px;margin:0 0 16px;">Last automated email on the downtime calculator. If you're ready to take the number you saw and turn it into a reduction plan, we'd love 30 minutes.</p>
        ${cta("Book a downtime-reduction consultation", `${baseUrl}/contact?source=nurture_downtime_d10`)}
      `,
    },
  ],
  hipaa_checklist: [
    {
      step: 1,
      delayDays: 2,
      subject: "The 3 HIPAA gaps auditors flag most",
      intro: "Where practices like yours typically lose points.",
      bodyHtml: ({ name, baseUrl }) => `
        <p style="font-size:14px;margin:0 0 16px;">Hi ${name},</p>
        <p style="font-size:14px;margin:0 0 16px;">Now that you have the checklist, here are the three gaps OCR auditors call out most often in small/mid practices:</p>
        <ul style="font-size:14px;color:#374151;line-height:1.6;padding-left:20px;margin:0 0 16px;">
          <li>No documented risk analysis in the last 12 months.</li>
          <li>Missing or stale Business Associate Agreements.</li>
          <li>No formal incident response &amp; breach notification plan.</li>
        </ul>
        <p style="font-size:14px;margin:0 0 8px;">We can close all three in under 30 days.</p>
        ${cta("Book a HIPAA gap assessment", `${baseUrl}/contact?source=nurture_hipaa_d2`)}
      `,
    },
    {
      step: 2,
      delayDays: 5,
      subject: "Sample HIPAA risk analysis (free)",
      intro: "What a complete risk analysis looks like.",
      bodyHtml: ({ name, baseUrl }) => `
        <p style="font-size:14px;margin:0 0 16px;">Hi ${name},</p>
        <p style="font-size:14px;margin:0 0 16px;">Want to see a finished HIPAA risk analysis? Reply to this email and we'll send a redacted sample we delivered to a 25-provider clinic last quarter — including the audit-ready remediation plan.</p>
        ${cta("Or, schedule the gap assessment now", `${baseUrl}/contact?source=nurture_hipaa_d5`)}
      `,
    },
    {
      step: 3,
      delayDays: 10,
      subject: "Closing the loop on HIPAA",
      intro: "One more way we can help.",
      bodyHtml: ({ name, baseUrl }) => `
        <p style="font-size:14px;margin:0 0 16px;">Hi ${name},</p>
        <p style="font-size:14px;margin:0 0 16px;">Last automated note on the HIPAA checklist. If you'd like Siebert to handle ongoing compliance — risk analysis, BAAs, training, and breach response — we offer a fixed-fee Compliance-as-a-Service plan.</p>
        ${cta("See if you qualify", `${baseUrl}/contact?source=nurture_hipaa_d10`)}
      `,
    },
  ],
  buyers_guide: [
    {
      step: 1,
      delayDays: 2,
      subject: "Question 1 of the guide is the one most people skip",
      intro: "Why the 'response time' question matters most.",
      bodyHtml: ({ name, baseUrl }) => `
        <p style="font-size:14px;margin:0 0 16px;">Hi ${name},</p>
        <p style="font-size:14px;margin:0 0 16px;">Of the 10 vetting questions in the guide, the one buyers most often skip is:</p>
        <blockquote style="border-left:4px solid #0176d3;padding:8px 16px;margin:0 0 16px;color:#374151;font-style:italic;background:#f9fafb;">"What's your guaranteed first-response time, and what's the financial penalty when you miss it?"</blockquote>
        <p style="font-size:14px;margin:0 0 16px;">Most MSPs quote response targets without contractual teeth. Siebert puts a service credit on the line for missed SLAs — ask any provider you're evaluating to do the same.</p>
        ${cta("Want our SLA in writing? Talk to us.", `${baseUrl}/contact?source=nurture_buyers_d2`)}
      `,
    },
    {
      step: 2,
      delayDays: 5,
      subject: "How to compare MSP quotes apples-to-apples",
      intro: "A 1-page scoring matrix you can use today.",
      bodyHtml: ({ name, baseUrl }) => `
        <p style="font-size:14px;margin:0 0 16px;">Hi ${name},</p>
        <p style="font-size:14px;margin:0 0 16px;">Most MSP quotes are deliberately hard to compare. Score every quote you get on these 6 weighted dimensions and pick the highest score, not the lowest price:</p>
        <ol style="font-size:14px;color:#374151;line-height:1.6;padding-left:20px;margin:0 0 16px;">
          <li>SLA &amp; financial penalties (25%)</li>
          <li>Included security stack (20%)</li>
          <li>Onboarding plan (15%)</li>
          <li>Reporting cadence (15%)</li>
          <li>References in your industry (15%)</li>
          <li>True total cost (no surprise add-ons) (10%)</li>
        </ol>
        ${cta("Get our scored proposal — no obligation", `${baseUrl}/quote?source=nurture_buyers_d5`)}
      `,
    },
    {
      step: 3,
      delayDays: 10,
      subject: "Last note from the buyer's guide series",
      intro: "Ready when you are.",
      bodyHtml: ({ name, baseUrl }) => `
        <p style="font-size:14px;margin:0 0 16px;">Hi ${name},</p>
        <p style="font-size:14px;margin:0 0 16px;">This is the last automated note from the buyer's guide series. If we haven't connected yet, the easiest next step is a 30-minute call where we walk you through how Siebert would specifically handle your environment.</p>
        ${cta("Book a 30-minute consult", `${baseUrl}/contact?source=nurture_buyers_d10`)}
      `,
    },
  ],
};

// ─── Editor-managed step overrides ─────────────────────────────────────────

const PLACEHOLDER_RE = /\{\{\s*(name|baseUrl|unsubUrl)\s*\}\}/g;

function renderPlaceholders(template: string, ctx: { name: string; baseUrl: string; unsubUrl: string }): string {
  return template.replace(PLACEHOLDER_RE, (_, key: "name" | "baseUrl" | "unsubUrl") => ctx[key]);
}

function defaultBodyHtmlString(magnet: LeadMagnetKey, step: number): string {
  const def = SEQUENCES[magnet]?.find(s => s.step === step);
  if (!def) return "";
  const sample = { name: "{{name}}", baseUrl: "{{baseUrl}}", unsubUrl: "{{unsubUrl}}" };
  return def.bodyHtml(sample).trim();
}

function defaultStepView(magnet: LeadMagnetKey, step: number): { delayDays: number; subject: string; intro: string; bodyHtml: string } | null {
  const def = SEQUENCES[magnet]?.find(s => s.step === step);
  if (!def) return null;
  return {
    delayDays: def.delayDays,
    subject: def.subject,
    intro: def.intro,
    bodyHtml: defaultBodyHtmlString(magnet, step),
  };
}

/**
 * Returns one row per default step for the magnet, merged with any editor
 * overrides from `lead_magnet_sequence_steps`. Used by the admin editor UI.
 */
export async function loadStepViews(magnet: LeadMagnetKey): Promise<SequenceStepView[]> {
  const overrides = await db.select()
    .from(leadMagnetSequenceStepsTable)
    .where(eq(leadMagnetSequenceStepsTable.magnet, magnet));
  const overrideByStep = new Map(overrides.map(o => [o.step, o] as const));

  const defaults = SEQUENCES[magnet] ?? [];
  return defaults.map(def => {
    const defaultsView = {
      delayDays: def.delayDays,
      subject: def.subject,
      intro: def.intro,
      bodyHtml: defaultBodyHtmlString(magnet, def.step),
    };
    const o = overrideByStep.get(def.step);
    if (!o) {
      return { step: def.step, ...defaultsView, defaults: defaultsView, customized: false, updatedAt: null };
    }
    return {
      step: def.step,
      delayDays: o.delayDays,
      subject: o.subject,
      intro: o.intro,
      bodyHtml: o.bodyHtml,
      defaults: defaultsView,
      customized: true,
      updatedAt: o.updatedAt,
    };
  });
}

/** Returns the steps that should actually be sent to recipients of `magnet`. */
async function loadEffectiveSteps(magnet: LeadMagnetKey): Promise<SequenceStep[]> {
  const overrides = await db.select()
    .from(leadMagnetSequenceStepsTable)
    .where(eq(leadMagnetSequenceStepsTable.magnet, magnet));
  const overrideByStep = new Map(overrides.map(o => [o.step, o] as const));

  const defaults = SEQUENCES[magnet] ?? [];
  return defaults.map(def => {
    const o = overrideByStep.get(def.step);
    if (!o) return def;
    return {
      step: def.step,
      delayDays: o.delayDays,
      subject: o.subject,
      intro: o.intro,
      bodyHtml: (ctx) => renderPlaceholders(o.bodyHtml, ctx),
    };
  });
}

export async function upsertStepOverride(
  magnet: LeadMagnetKey,
  step: number,
  fields: { delayDays?: number; subject?: string; intro?: string; bodyHtml?: string },
): Promise<SequenceStepView | null> {
  const def = defaultStepView(magnet, step);
  if (!def) return null;

  const merged = {
    delayDays: fields.delayDays ?? def.delayDays,
    subject: (fields.subject ?? def.subject).trim(),
    intro: (fields.intro ?? def.intro).trim(),
    bodyHtml: (fields.bodyHtml ?? def.bodyHtml).trim(),
  };

  await db.insert(leadMagnetSequenceStepsTable).values({
    magnet, step,
    delayDays: merged.delayDays,
    subject: merged.subject,
    intro: merged.intro,
    bodyHtml: merged.bodyHtml,
  }).onConflictDoUpdate({
    target: [leadMagnetSequenceStepsTable.magnet, leadMagnetSequenceStepsTable.step],
    set: {
      delayDays: merged.delayDays,
      subject: merged.subject,
      intro: merged.intro,
      bodyHtml: merged.bodyHtml,
      updatedAt: new Date(),
    },
  });

  const views = await loadStepViews(magnet);
  return views.find(v => v.step === step) ?? null;
}

export async function resetStepOverride(magnet: LeadMagnetKey, step: number): Promise<SequenceStepView | null> {
  await db.delete(leadMagnetSequenceStepsTable).where(and(
    eq(leadMagnetSequenceStepsTable.magnet, magnet),
    eq(leadMagnetSequenceStepsTable.step, step),
  ));
  const views = await loadStepViews(magnet);
  return views.find(v => v.step === step) ?? null;
}

/** Used by the admin Preview button. Renders the merged step with sample tokens. */
export async function previewStep(
  magnet: LeadMagnetKey,
  step: number,
  ctx: { name: string; baseUrl: string; unsubUrl: string },
): Promise<RenderedSequenceStep | null> {
  const steps = await loadEffectiveSteps(magnet);
  const s = steps.find(x => x.step === step);
  if (!s) return null;
  return {
    step: s.step,
    delayDays: s.delayDays,
    subject: s.subject,
    intro: s.intro,
    html: s.bodyHtml(ctx),
  };
}

export const SEQUENCE_PAUSE_KEY = (magnet: LeadMagnetKey) => `lead_magnet_seq_paused_${magnet}`;

export async function isSequencePaused(magnet: LeadMagnetKey): Promise<boolean> {
  try {
    const rows = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, SEQUENCE_PAUSE_KEY(magnet)));
    return rows[0]?.value === "1";
  } catch {
    return false;
  }
}

export async function setSequencePaused(magnet: LeadMagnetKey, paused: boolean): Promise<void> {
  const key = SEQUENCE_PAUSE_KEY(magnet);
  const value = paused ? "1" : "0";
  await db.insert(siteSettingsTable).values({ key, value })
    .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value, updatedAt: new Date() } });
}

export async function getAllSequencePauseStates(): Promise<Record<LeadMagnetKey, boolean>> {
  const magnets: LeadMagnetKey[] = ["cybersecurity_assessment", "downtime_calculator", "hipaa_checklist", "buyers_guide"];
  const results = await Promise.all(magnets.map(async (m) => [m, await isSequencePaused(m)] as const));
  return Object.fromEntries(results) as Record<LeadMagnetKey, boolean>;
}

let _warnedMissingSecret = false;
function unsubscribeSecret(): string {
  const secret = process.env.LEAD_MAGNET_UNSUB_SECRET || process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("LEAD_MAGNET_UNSUB_SECRET (or SESSION_SECRET) must be configured in production to sign unsubscribe links");
  }
  if (!_warnedMissingSecret) {
    console.warn("[LeadMagnetSeq] No LEAD_MAGNET_UNSUB_SECRET / SESSION_SECRET set — using dev-only fallback. Set one of these in production.");
    _warnedMissingSecret = true;
  }
  return "siebert-lead-magnet-unsub-dev-fallback";
}

export function buildUnsubscribeToken(submissionId: number): string {
  const sig = crypto.createHmac("sha256", unsubscribeSecret())
    .update(String(submissionId))
    .digest("hex")
    .slice(0, 24);
  return `${submissionId}.${sig}`;
}

export function verifyUnsubscribeToken(token: string): number | null {
  const parts = String(token || "").split(".");
  if (parts.length !== 2) return null;
  const id = parseInt(parts[0], 10);
  if (!Number.isFinite(id) || id <= 0) return null;
  const expected = crypto.createHmac("sha256", unsubscribeSecret())
    .update(String(id))
    .digest("hex")
    .slice(0, 24);
  try {
    if (crypto.timingSafeEqual(Buffer.from(parts[1]), Buffer.from(expected))) return id;
  } catch {
    return null;
  }
  return null;
}

export function buildUnsubscribeUrl(baseUrl: string, submissionId: number): string {
  return `${baseUrl.replace(/\/$/, "")}/api/lead-magnets/unsubscribe?token=${encodeURIComponent(buildUnsubscribeToken(submissionId))}`;
}

export function unsubscribeFooterHtml(unsubUrl: string): string {
  return `
    <p style="font-size:11px;color:#9ca3af;margin:18px 0 0;border-top:1px solid #e5e7eb;padding-top:10px;line-height:1.5;">
      You're receiving this because you downloaded a Siebert Services resource. If you'd rather not get follow-up emails about it,
      <a href="${unsubUrl}" style="color:#6b7280;text-decoration:underline;">unsubscribe here</a>.
    </p>
  `;
}

const SCHEDULER_INTERVAL_MS = 15 * 60 * 1000;
let schedulerTimer: NodeJS.Timeout | null = null;
let schedulerRunning = false;

function defaultBaseUrl(): string {
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return "https://siebertrservices.com";
}

export async function processSequenceTick(now: Date = new Date()): Promise<{ scanned: number; sent: number; skipped: number }> {
  const baseUrl = defaultBaseUrl();
  const pauseStates = await getAllSequencePauseStates();

  // Pre-load effective (DB-overridden) steps for every magnet once per tick.
  const magnetKeys = Object.keys(SEQUENCES) as LeadMagnetKey[];
  const stepsByMagnet = new Map<LeadMagnetKey, SequenceStep[]>();
  for (const m of magnetKeys) {
    stepsByMagnet.set(m, await loadEffectiveSteps(m));
  }

  const allDelays = [...stepsByMagnet.values()].flat().map(s => s.delayDays);
  const maxDelay = allDelays.length ? Math.max(...allDelays) : 0;
  const earliest = new Date(now.getTime() - (maxDelay + 1) * 24 * 60 * 60 * 1000);

  const candidates = await db.select()
    .from(leadMagnetSubmissionsTable)
    .where(and(
      isNull(leadMagnetSubmissionsTable.unsubscribedAt),
      gte(leadMagnetSubmissionsTable.createdAt, earliest),
      lte(leadMagnetSubmissionsTable.createdAt, now),
    ));

  let scanned = 0;
  let sent = 0;
  let skipped = 0;

  for (const sub of candidates) {
    scanned++;
    const magnet = sub.magnet as LeadMagnetKey;
    if (pauseStates[magnet]) { skipped++; continue; }
    const steps = stepsByMagnet.get(magnet) || [];
    if (!steps.length) { skipped++; continue; }

    const sentRows = await db.select().from(leadMagnetSequenceSendsTable)
      .where(eq(leadMagnetSequenceSendsTable.submissionId, sub.id));
    const doneSteps = new Set(sentRows.map(r => r.step));

    for (const step of steps) {
      if (doneSteps.has(step.step)) continue;
      const dueAt = new Date(sub.createdAt.getTime() + step.delayDays * 24 * 60 * 60 * 1000);
      if (now < dueAt) continue;

      const unsubUrl = buildUnsubscribeUrl(baseUrl, sub.id);
      const html = step.bodyHtml({ name: sub.name, baseUrl, unsubUrl });
      try {
        await db.insert(leadMagnetSequenceSendsTable).values({
          submissionId: sub.id,
          step: step.step,
          status: "sending",
        });
      } catch {
        // unique constraint — already inserted in another tick
        continue;
      }

      const ok = await sendLeadMagnetFollowUpEmail(sub.email, step.subject, html, unsubUrl);
      await db.update(leadMagnetSequenceSendsTable)
        .set({ status: ok ? "sent" : "failed" })
        .where(and(
          eq(leadMagnetSequenceSendsTable.submissionId, sub.id),
          eq(leadMagnetSequenceSendsTable.step, step.step),
        ));
      if (ok) sent++;
      // only send one step per submission per tick
      break;
    }
  }

  return { scanned, sent, skipped };
}

export function startLeadMagnetSequenceScheduler(): void {
  if (schedulerTimer) return;
  const tick = async () => {
    if (schedulerRunning) return;
    schedulerRunning = true;
    try {
      const r = await processSequenceTick();
      if (r.sent > 0 || r.scanned > 0) {
        console.log(`[LeadMagnetSeq] tick scanned=${r.scanned} sent=${r.sent} skipped=${r.skipped}`);
      }
    } catch (err) {
      console.error("[LeadMagnetSeq] tick error:", err);
    } finally {
      schedulerRunning = false;
    }
  };
  // first tick after 60s to let server settle
  setTimeout(tick, 60_000);
  schedulerTimer = setInterval(tick, SCHEDULER_INTERVAL_MS);
}

export async function markUnsubscribed(submissionId: number): Promise<{ ok: boolean; email?: string }> {
  const [row] = await db.update(leadMagnetSubmissionsTable)
    .set({ unsubscribedAt: new Date() })
    .where(eq(leadMagnetSubmissionsTable.id, submissionId))
    .returning({ email: leadMagnetSubmissionsTable.email });
  if (!row) return { ok: false };
  return { ok: true, email: row.email };
}

export async function unsubscribeAllByEmail(email: string): Promise<number> {
  const res = await db.update(leadMagnetSubmissionsTable)
    .set({ unsubscribedAt: new Date() })
    .where(and(
      eq(sql`lower(${leadMagnetSubmissionsTable.email})`, email.trim().toLowerCase()),
      isNull(leadMagnetSubmissionsTable.unsubscribedAt),
    ))
    .returning({ id: leadMagnetSubmissionsTable.id });
  return res.length;
}
