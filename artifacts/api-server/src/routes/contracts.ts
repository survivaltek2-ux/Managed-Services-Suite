import { Router, type IRouter, type Response } from "express";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/auth.js";
import { generateMSAContract, type ContractParams } from "../lib/contract.js";

const router: IRouter = Router();

const ALLOWED_PLAN_SLUGS = ["essentials", "business", "enterprise"] as const;
const ALLOWED_BILLING = ["monthly", "annual"] as const;

const PLAN_LABEL: Record<string, string> = {
  essentials: "Essentials",
  business: "Business",
  enterprise: "Enterprise",
};

router.post(
  "/admin/contracts/generate-msa",
  requireAuth,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
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
        subscriptionId,
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

      const params: ContractParams = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        companyName: companyName.trim(),
        planName: PLAN_LABEL[slug] ?? slug,
        planSlug: slug,
        billingCycle: cycle,
        pricePerUser: priceNum,
        seats: seatsNum,
        subscriptionId:
          typeof subscriptionId === "string" && subscriptionId.trim()
            ? subscriptionId.trim()
            : `draft_${Date.now().toString(36)}`,
        effectiveDate: effective,
      };

      const pdf = await generateMSAContract(params);

      const safeCompany = (params.companyName || "client")
        .replace(/[^a-z0-9-]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase()
        .slice(0, 60) || "client";
      const filename = `siebert-msa-${safeCompany}-${effective.toISOString().slice(0, 10)}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", pdf.length.toString());
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).end(pdf);
    } catch (err) {
      console.error("[contracts] generate-msa failed:", err);
      return res.status(500).json({ error: "Failed to generate MSA" });
    }
  }
);

export default router;
