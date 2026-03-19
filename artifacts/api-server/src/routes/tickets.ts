import { Router, type IRouter } from "express";
import { db, ticketsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";
import { Response } from "express";
import { sendClientTicketNotification } from "../lib/email.js";

const router: IRouter = Router();

router.get("/tickets", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await db.select().from(ticketsTable).where(eq(ticketsTable.userId, req.userId!));
    res.json(tickets);
  } catch (err) {
    console.error("List tickets error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to list tickets" });
  }
});

router.post("/tickets", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { subject, description, priority, category } = req.body;
    if (!subject || !description || !priority || !category) {
      res.status(400).json({ error: "validation_error", message: "subject, description, priority, and category are required" });
      return;
    }

    const [ticket] = await db.insert(ticketsTable).values({
      subject,
      description,
      priority,
      category,
      userId: req.userId!,
    }).returning();

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (user) {
      sendClientTicketNotification(
        { subject, description, priority, category },
        user.email, user.name,
      ).catch(err => console.error("[Email] Client ticket notification error:", err));
    }

    res.status(201).json(ticket);
  } catch (err) {
    console.error("Create ticket error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to create ticket" });
  }
});

router.get("/tickets/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const [ticket] = await db.select().from(ticketsTable)
      .where(eq(ticketsTable.id, id))
      .limit(1);

    if (!ticket || ticket.userId !== req.userId) {
      res.status(404).json({ error: "not_found", message: "Ticket not found" });
      return;
    }

    res.json(ticket);
  } catch (err) {
    console.error("Get ticket error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to get ticket" });
  }
});

export default router;
