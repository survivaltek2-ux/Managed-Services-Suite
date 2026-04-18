import { Router, type Request, type Response } from "express";
import { verifyZoomWebhook, verifyZoomWebhookSignature, handleSmsReceived } from "../lib/zoomSms.js";

const router = Router();

router.post("/webhooks/zoom/sms", async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (body.event === "endpoint.url_validation") {
      const plainToken = body.payload?.plainToken;
      if (!plainToken) {
        res.status(400).json({ error: "Missing plainToken" });
        return;
      }
      const response = verifyZoomWebhook(plainToken);
      res.status(200).json(response);
      return;
    }

    const timestamp = req.headers["x-zm-request-timestamp"] as string;
    const signature = req.headers["x-zm-signature"] as string;

    if (!timestamp || !signature) {
      console.warn("[Zoom Webhook] Missing signature headers — rejecting request");
      res.status(401).json({ error: "Missing authentication headers" });
      return;
    }

    const rawBody = req.rawBody
      ? req.rawBody.toString("utf8")
      : (typeof req.body === "string" ? req.body : JSON.stringify(req.body));
    if (!verifyZoomWebhookSignature(rawBody, timestamp, signature)) {
      console.warn("[Zoom Webhook] Invalid signature — rejecting request");
      res.status(401).json({ error: "Invalid webhook signature" });
      return;
    }

    const requestAge = Math.abs(Date.now() / 1000 - parseInt(timestamp));
    if (requestAge > 300) {
      console.warn(`[Zoom Webhook] Request too old (${Math.round(requestAge)}s) — rejecting`);
      res.status(401).json({ error: "Request timestamp expired" });
      return;
    }

    if (body.event === "phone.sms_received") {
      const code = await handleSmsReceived(body);
      res.status(200).json({ received: true, codeExtracted: !!code });
      return;
    }

    console.log(`[Zoom Webhook] Unhandled event: ${body.event}`);
    res.status(200).json({ received: true });
  } catch (err) {
    console.error("[Zoom Webhook] Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
