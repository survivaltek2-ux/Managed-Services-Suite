import { Router, type IRouter } from "express";
import { db, quotesTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/quotes", async (req, res) => {
  try {
    const { name, email, phone, company, companySize, services, budget, timeline, details } = req.body;
    if (!name || !email || !company || !services || !Array.isArray(services) || services.length === 0) {
      res.status(400).json({ error: "validation_error", message: "name, email, company, and services are required" });
      return;
    }

    const [quote] = await db.insert(quotesTable).values({
      name,
      email,
      phone: phone || null,
      company,
      companySize: companySize || null,
      services: JSON.stringify(services),
      budget: budget || null,
      timeline: timeline || null,
      details: details || null,
    }).returning();

    res.status(201).json({
      ...quote,
      services: JSON.parse(quote.services),
    });
  } catch (err) {
    console.error("Quote error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to submit quote request" });
  }
});

export default router;
