import { Router, type Request, type Response } from "express";
import { verifyZoomWebhook, handleSmsReceived } from "../lib/zoomSms.js";

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
