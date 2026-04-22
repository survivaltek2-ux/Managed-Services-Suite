import { Router, type IRouter, type Response } from "express";
import { spawn } from "node:child_process";
import { existsSync, promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/auth.js";
import { ObjectStorageService } from "../lib/objectStorage.js";
import { db, documentsTable } from "@workspace/db";

const router: IRouter = Router();

const ALLOWED_PLAN_SLUGS = ["essentials", "business", "enterprise"] as const;
const ALLOWED_BILLING = ["monthly", "annual"] as const;

const PLAN_TIER_LABEL: Record<string, string> = {
  essentials: "Essentials",
  business: "Business",
  enterprise: "Enterprise",
};

// scripts/generate-msa-pdf.cjs lives at the monorepo root.
// We resolve its absolute path lazily (and the api-server's node_modules)
// at request time. This is CJS-safe because we rely only on process.cwd()
// and well-known repo-relative paths — esbuild's CJS output leaves
// import.meta empty, so we deliberately avoid it here.
//
// In dev (tsx filter run): cwd = artifacts/api-server/
// In production (built index.cjs run from package dir): cwd = artifacts/api-server/
// We probe a small set of candidate locations to be robust either way.
function resolveExisting(candidates: string[], label: string): string {
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  throw new Error(
    `[contracts] Could not locate ${label}. Tried: ${candidates.join(", ")}`
  );
}

function findScriptPath(): string {
  const cwd = process.cwd();
  return resolveExisting(
    [
      path.resolve(cwd, "..", "..", "scripts", "generate-msa-pdf.cjs"),
      path.resolve(cwd, "scripts", "generate-msa-pdf.cjs"),
      path.resolve(cwd, "..", "..", "..", "scripts", "generate-msa-pdf.cjs"),
    ],
    "scripts/generate-msa-pdf.cjs"
  );
}

function findApiServerNodeModules(): string {
  const cwd = process.cwd();
  return resolveExisting(
    [
      // Dev or built artifact running from artifacts/api-server/
      path.resolve(cwd, "node_modules", "pdfkit"),
      // Running from the workspace root
      path.resolve(cwd, "artifacts", "api-server", "node_modules", "pdfkit"),
    ],
    "pdfkit (api-server node_modules)"
  ).replace(/[\/\\]pdfkit$/, "");
}

function formatLongDate(d: Date): string {
  // Use UTC accessors so a date-only input ("YYYY-MM-DD" parsed as UTC midnight)
  // never drifts by one day in negative-offset server timezones.
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Build the placeholder substitution map consumed by
 * scripts/generate-msa-pdf.cjs (via MSA_VALUES_FILE env var).
 * Keys are the bracketed placeholder text used inside the canonical
 * template (without the surrounding brackets).
 */
function buildPlaceholderMap(input: {
  companyName: string;
  customerName: string;
  customerEmail: string;
  planSlug: string;
  billingCycle: string;
  pricePerUser: number;
  seats: number;
  effectiveDate: Date;
  // optional template fields
  entityType?: string;
  customerAddress?: string;
  signerTitle?: string;
  billingPhone?: string;
  initialTerm?: string;
  noticePeriod?: string;
  customerNotice?: string;
  changeApprovalThreshold?: string;
}): Record<string, string> {
  const tierLabel = PLAN_TIER_LABEL[input.planSlug] ?? input.planSlug;
  const monthlyTotal = input.pricePerUser * input.seats;
  const cycleLabel = input.billingCycle === "annual" ? "Annual" : "Monthly";

  const map: Record<string, string> = {
    "CUSTOMER LEGAL NAME": input.companyName,
    "EFFECTIVE DATE": formatLongDate(input.effectiveDate),
    "NUMBER OF SEATS": String(input.seats),
    "ESSENTIALS / BUSINESS / ENTERPRISE": tierLabel,
    "TIER NAME": tierLabel,
    "TIER": tierLabel,
    "# SEATS": String(input.seats),
    "MONTHLY FEE": formatCurrency(monthlyTotal),
    "MONTHLY TOTAL": formatCurrency(monthlyTotal),
    "MONTHLY RATE": formatCurrency(input.pricePerUser),
    "ANNUAL RATE": formatCurrency(input.pricePerUser),
    "Monthly / Annual": cycleLabel,
    "Monthly or Annual Invoice": `${cycleLabel} invoice`,
    "BILLING CONTACT NAME": input.customerName,
    "BILLING EMAIL": input.customerEmail,
    // Note: contracts/notice email placeholder is intentionally left
    // unsubstituted so legal can confirm the correct address before sending.
  };

  if (input.entityType) map["ENTITY TYPE AND STATE OF FORMATION"] = input.entityType;
  if (input.customerAddress) map["CUSTOMER ADDRESS"] = input.customerAddress;
  if (input.billingPhone) map["BILLING PHONE"] = input.billingPhone;
  if (input.initialTerm) map["INITIAL TERM, e.g., twelve (12) months"] = input.initialTerm;
  if (input.noticePeriod) map["NOTICE PERIOD, e.g., sixty (60) days"] = input.noticePeriod;
  if (input.customerNotice) map["CUSTOMER NOTICE ADDRESS AND EMAIL"] = input.customerNotice;
  if (input.changeApprovalThreshold) {
    map["CHANGE EMAIL THRESHOLD, e.g., two (2) hours"] = input.changeApprovalThreshold;
  }
  if (input.signerTitle) {
    // Used in signature block context; surfaced as-is when present.
    map["SIGNER TITLE"] = input.signerTitle;
  }

  return map;
}

function runMsaGenerator(outputPath: string, valuesPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let scriptPath: string;
    let nodeModulesPath: string;
    try {
      scriptPath = findScriptPath();
      nodeModulesPath = findApiServerNodeModules();
    } catch (e) {
      return reject(e);
    }

    // NODE_PATH fallback so the script (at workspace root) can resolve
    // `require("pdfkit")` from the api-server's installed node_modules.
    const existingNodePath = process.env.NODE_PATH;
    const nodePath = existingNodePath
      ? `${nodeModulesPath}${path.delimiter}${existingNodePath}`
      : nodeModulesPath;

    const child = spawn("node", [scriptPath, outputPath], {
      env: {
        ...process.env,
        MSA_VALUES_FILE: valuesPath,
        NODE_PATH: nodePath,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", (b) => { stderr += b.toString(); });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`generate-msa-pdf.cjs exited ${code}: ${stderr.slice(0, 500)}`));
    });
  });
}

router.post(
  "/admin/contracts/generate-msa",
  requireAuth,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    const tempDir = tmpdir();
    const token = randomBytes(8).toString("hex");
    const valuesPath = path.join(tempDir, `msa-values-${token}.json`);
    const pdfPath = path.join(tempDir, `msa-${token}.pdf`);

    try {
      const {
        customerName,
        customerEmail,
        companyName,
        planSlug,
        billingCycle,
        pricePerUser,
        seats,
        effectiveDate,
        entityType,
        customerAddress,
        signerTitle,
        billingPhone,
        initialTerm,
        noticePeriod,
        customerNotice,
      } = req.body ?? {};

      const errors: string[] = [];
      if (!customerName || typeof customerName !== "string") errors.push("customerName is required");
      if (!customerEmail || typeof customerEmail !== "string") errors.push("customerEmail is required");
      if (!companyName || typeof companyName !== "string") errors.push("companyName is required");

      const slug = String(planSlug ?? "").toLowerCase();
      if (!ALLOWED_PLAN_SLUGS.includes(slug as typeof ALLOWED_PLAN_SLUGS[number])) {
        errors.push(`planSlug must be one of: ${ALLOWED_PLAN_SLUGS.join(", ")}`);
      }

      const cycle = String(billingCycle ?? "").toLowerCase();
      if (!ALLOWED_BILLING.includes(cycle as typeof ALLOWED_BILLING[number])) {
        errors.push(`billingCycle must be one of: ${ALLOWED_BILLING.join(", ")}`);
      }

      const priceNum = Number(pricePerUser);
      if (!Number.isFinite(priceNum) || priceNum < 0) errors.push("pricePerUser must be a non-negative number");

      const seatsNum = Number(seats);
      if (!Number.isInteger(seatsNum) || seatsNum < 1) errors.push("seats must be a positive integer");

      const effective = effectiveDate ? new Date(effectiveDate) : new Date();
      if (Number.isNaN(effective.getTime())) errors.push("effectiveDate is invalid");

      if (errors.length) {
        return res.status(400).json({ error: "Validation failed", details: errors });
      }

      const cleanString = (v: unknown) =>
        typeof v === "string" && v.trim() ? v.trim() : undefined;

      const placeholders = buildPlaceholderMap({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        companyName: companyName.trim(),
        planSlug: slug,
        billingCycle: cycle,
        pricePerUser: priceNum,
        seats: seatsNum,
        effectiveDate: effective,
        entityType: cleanString(entityType),
        customerAddress: cleanString(customerAddress),
        signerTitle: cleanString(signerTitle),
        billingPhone: cleanString(billingPhone),
        initialTerm: cleanString(initialTerm),
        noticePeriod: cleanString(noticePeriod),
        customerNotice: cleanString(customerNotice),
      });

      await fs.writeFile(valuesPath, JSON.stringify(placeholders), "utf8");
      await runMsaGenerator(pdfPath, valuesPath);
      const pdf = await fs.readFile(pdfPath);

      const safeCompany = (companyName as string)
        .replace(/[^a-z0-9-]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase()
        .slice(0, 60) || "client";
      const filename = `siebert-msa-${safeCompany}-${effective.toISOString().slice(0, 10)}.pdf`;

      // Save to App Storage and create a documents record (non-blocking — don't fail the download if storage fails)
      try {
        const objStorage = new ObjectStorageService();
        const storagePath = await objStorage.uploadBuffer(pdf, filename, "application/pdf");
        await db.insert(documentsTable).values({
          name: `MSA — ${companyName.trim()} (${effective.toISOString().slice(0, 10)})`,
          description: `Generated Master Services Agreement for ${companyName.trim()}`,
          filename,
          mimeType: "application/pdf",
          size: pdf.length,
          content: null,
          storagePath,
          category: "agreement",
          customerCompany: companyName.trim(),
          uploadedBy: "system",
          tags: JSON.stringify(["msa", "generated", slug]),
        });
      } catch (storageErr) {
        console.error("[contracts] Failed to save MSA to App Storage (download still proceeding):", storageErr);
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", pdf.length.toString());
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).end(pdf);
    } catch (err) {
      console.error("[contracts] generate-msa failed:", err);
      return res.status(500).json({ error: "Failed to generate MSA" });
    } finally {
      // Best-effort cleanup of temp files
      fs.unlink(valuesPath).catch(() => undefined);
      fs.unlink(pdfPath).catch(() => undefined);
    }
  }
);

export default router;
