import { Router } from "express";
import { db } from "@workspace/db";
import { pageSectionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

type OpenAIClient = typeof import("@workspace/integrations-openai-ai-server").openai;
let _openai: OpenAIClient | null = null;
function getOpenAI(): OpenAIClient {
  if (!_openai) {
    _openai = require("@workspace/integrations-openai-ai-server").openai as OpenAIClient;
  }
  return _openai;
}

const router = Router();

router.get("/page-content/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const sections = await db
      .select()
      .from(pageSectionsTable)
      .where(eq(pageSectionsTable.pageSlug, slug));

    const contentMap: Record<string, string> = {};
    for (const s of sections) {
      contentMap[s.sectionKey] = s.content;
    }
    res.json(contentMap);
  } catch (err) {
    console.error("GET /page-content/:slug error:", err);
    res.status(500).json({ error: "Failed to fetch page content" });
  }
});

router.put("/page-content/:slug/:key", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { slug, key } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== "string") {
      res.status(400).json({ error: "content is required" });
      return;
    }

    const existing = await db
      .select()
      .from(pageSectionsTable)
      .where(and(eq(pageSectionsTable.pageSlug, slug), eq(pageSectionsTable.sectionKey, key)));

    if (existing.length > 0) {
      await db
        .update(pageSectionsTable)
        .set({ content, updatedAt: new Date() })
        .where(and(eq(pageSectionsTable.pageSlug, slug), eq(pageSectionsTable.sectionKey, key)));
    } else {
      await db.insert(pageSectionsTable).values({ pageSlug: slug, sectionKey: key, content });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("PUT /page-content/:slug/:key error:", err);
    res.status(500).json({ error: "Failed to update page content" });
  }
});

router.put("/page-content/:slug", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { slug } = req.params;
    const updates: Record<string, string> = req.body;

    if (!updates || typeof updates !== "object") {
      res.status(400).json({ error: "Body must be a key-value object" });
      return;
    }

    for (const [key, content] of Object.entries(updates)) {
      const existing = await db
        .select()
        .from(pageSectionsTable)
        .where(and(eq(pageSectionsTable.pageSlug, slug), eq(pageSectionsTable.sectionKey, key)));

      if (existing.length > 0) {
        await db
          .update(pageSectionsTable)
          .set({ content, updatedAt: new Date() })
          .where(and(eq(pageSectionsTable.pageSlug, slug), eq(pageSectionsTable.sectionKey, key)));
      } else {
        await db.insert(pageSectionsTable).values({ pageSlug: slug, sectionKey: key, content });
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("PUT /page-content/:slug error:", err);
    res.status(500).json({ error: "Failed to update page content" });
  }
});

router.post("/page-content/ai-suggest", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { pageSlug, pageName, currentContent, userRequest } = req.body;

    if (!userRequest) {
      res.status(400).json({ error: "userRequest is required" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const openai = getOpenAI();

    const systemPrompt = `You are an expert copywriter and web content editor for Siebert Services, a professional B2B Managed Service Provider (MSP) and technology reseller.

You help the admin update the text content of vendor/service pages on their website. When given current page content and a request for changes, you respond ONLY with a JSON object containing the updated content fields.

The tone should be:
- Professional and confident
- B2B focused (targeting business decision-makers)
- Clear and concise
- Benefit-focused (what does the customer get?)

You must respond with ONLY valid JSON. No markdown, no explanation, no preamble. Just the JSON object with the updated content fields that need to change.

Example response format:
{
  "heroTitle": "Updated Title Here",
  "heroSubtitle": "Updated subtitle text here"
}

Only include fields that should change based on the user's request. If a field should stay the same, omit it from your response.`;

    const userMessage = `Page: ${pageName} (slug: ${pageSlug})

Current content:
${JSON.stringify(currentContent, null, 2)}

Admin request: ${userRequest}

Return ONLY the JSON object with updated content fields.`;

    let fullResponse = "";

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true, fullResponse })}\n\n`);
    res.end();
  } catch (err) {
    console.error("POST /page-content/ai-suggest error:", err);
    res.write(`data: ${JSON.stringify({ error: "AI suggestion failed" })}\n\n`);
    res.end();
  }
});

export default router;
