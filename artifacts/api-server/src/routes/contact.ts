import { Router, type IRouter } from "express";
import { db, contactsTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, company, service, message } = req.body;
    if (!name || !email || !message) {
      res.status(400).json({ error: "validation_error", message: "name, email, and message are required" });
      return;
    }

    const [contact] = await db.insert(contactsTable).values({
      name,
      email,
      phone: phone || null,
      company: company || null,
      service: service || null,
      message,
    }).returning();

    res.status(201).json(contact);
  } catch (err) {
    console.error("Contact error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to submit contact form" });
  }
});

export default router;
