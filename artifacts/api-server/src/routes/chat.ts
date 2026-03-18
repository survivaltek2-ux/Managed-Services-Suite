import { Router, type IRouter } from "express";
import { db, chatMessagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/chat/messages", async (req, res) => {
  try {
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      res.status(400).json({ error: "validation_error", message: "sessionId is required" });
      return;
    }

    const messages = await db.select().from(chatMessagesTable)
      .where(eq(chatMessagesTable.sessionId, sessionId));

    res.json(messages);
  } catch (err) {
    console.error("Get chat messages error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to get messages" });
  }
});

router.post("/chat/messages", async (req, res) => {
  try {
    const { sessionId, message, name, email } = req.body;
    if (!sessionId || !message) {
      res.status(400).json({ error: "validation_error", message: "sessionId and message are required" });
      return;
    }

    const [userMsg] = await db.insert(chatMessagesTable).values({
      sessionId,
      sender: "user",
      message,
      name: name || null,
      email: email || null,
    }).returning();

    // Auto agent response
    const agentReplies = [
      "Thanks for reaching out to Siebert Services! An agent will be with you shortly. Our typical response time is under 2 hours during business hours.",
      "Hi there! We received your message. One of our IT specialists will follow up with you shortly. If this is urgent, please call us directly.",
      "Thank you for contacting Siebert Services! We'll review your inquiry and get back to you as soon as possible. For immediate assistance, please call our helpdesk.",
    ];
    const agentReply = agentReplies[Math.floor(Math.random() * agentReplies.length)];

    await db.insert(chatMessagesTable).values({
      sessionId,
      sender: "agent",
      message: agentReply,
      name: null,
      email: null,
    });

    res.status(201).json(userMsg);
  } catch (err) {
    console.error("Send chat message error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to send message" });
  }
});

export default router;
