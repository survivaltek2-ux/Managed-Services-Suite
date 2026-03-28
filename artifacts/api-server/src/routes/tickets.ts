import { Router, type IRouter } from "express";
import { db, ticketsTable, ticketMessagesTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";
import { Response } from "express";
import { sendClientTicketNotification } from "../lib/email.js";

const router: IRouter = Router();

router.get("/tickets", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await db.select().from(ticketsTable)
      .where(eq(ticketsTable.userId, req.userId!))
      .orderBy(desc(ticketsTable.createdAt));
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
        { name: user.name, email: user.email },
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

    const messages = await db.select().from(ticketMessagesTable)
      .where(eq(ticketMessagesTable.ticketId, id))
      .orderBy(ticketMessagesTable.createdAt);

    res.json({ ...ticket, messages });
  } catch (err) {
    console.error("Get ticket error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to get ticket" });
  }
});

router.post("/tickets/:id/messages", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id as string);
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: "validation_error", message: "message is required" });
      return;
    }

    const [ticket] = await db.select().from(ticketsTable)
      .where(eq(ticketsTable.id, ticketId))
      .limit(1);

    if (!ticket || ticket.userId !== req.userId) {
      res.status(404).json({ error: "not_found", message: "Ticket not found" });
      return;
    }

    if (ticket.status === "closed") {
      res.status(400).json({ error: "ticket_closed", message: "Cannot reply to a closed ticket" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);

    const [msg] = await db.insert(ticketMessagesTable).values({
      ticketId,
      senderType: "client",
      senderName: user?.name || "Client",
      message,
    }).returning();

    if (ticket.status === "resolved") {
      await db.update(ticketsTable).set({ status: "open", updatedAt: new Date() }).where(eq(ticketsTable.id, ticketId));
    }

    res.status(201).json(msg);
  } catch (err) {
    console.error("Send ticket message error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to send message" });
  }
});

export default router;
