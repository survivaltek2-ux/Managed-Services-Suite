import { Router, type IRouter, type Request, type Response } from "express";
import { db, blogPostsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

const STATIC_ROUTES: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/services", changefreq: "weekly", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/quote", changefreq: "monthly", priority: "0.8" },
  { path: "/blog", changefreq: "daily", priority: "0.8" },
  { path: "/recommended", changefreq: "weekly", priority: "0.7" },
  { path: "/internet-plans", changefreq: "weekly", priority: "0.6" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  // Vendor / partner pages
  { path: "/zoom", changefreq: "monthly", priority: "0.6" },
  { path: "/ringcentral", changefreq: "monthly", priority: "0.6" },
  { path: "/microsoft-365", changefreq: "monthly", priority: "0.6" },
  { path: "/8x8", changefreq: "monthly", priority: "0.6" },
  { path: "/cisco-meraki", changefreq: "monthly", priority: "0.6" },
  { path: "/fortinet", changefreq: "monthly", priority: "0.6" },
  { path: "/palo-alto-networks", changefreq: "monthly", priority: "0.6" },
  { path: "/extreme-networks", changefreq: "monthly", priority: "0.6" },
  { path: "/juniper-networks", changefreq: "monthly", priority: "0.6" },
  { path: "/hp", changefreq: "monthly", priority: "0.6" },
  { path: "/dell", changefreq: "monthly", priority: "0.6" },
  { path: "/vivint", changefreq: "monthly", priority: "0.6" },
  { path: "/adt-business", changefreq: "monthly", priority: "0.6" },
  { path: "/comcast-business", changefreq: "monthly", priority: "0.6" },
  { path: "/spectrum-business", changefreq: "monthly", priority: "0.6" },
  { path: "/att-business", changefreq: "monthly", priority: "0.6" },
  { path: "/verizon-business", changefreq: "monthly", priority: "0.6" },
  { path: "/cox-business", changefreq: "monthly", priority: "0.6" },
  { path: "/altice", changefreq: "monthly", priority: "0.6" },
  { path: "/lumen", changefreq: "monthly", priority: "0.6" },
  { path: "/t-mobile-business", changefreq: "monthly", priority: "0.6" },
];

// Strip any chars not allowed in a hostname per RFC1123/RFC3986 hostname grammar.
// Defends against header-injection / weird host header values.
function safeHost(raw: string | undefined): string | null {
  if (!raw) return null;
  const host = raw.split(",")[0].trim();
  return /^[A-Za-z0-9.\-:]{1,253}$/.test(host) ? host : null;
}

function siteOrigin(req: Request): string {
  // Prefer explicit canonical origin from env (production-safe).
  const canonical = process.env.SITE_CANONICAL_ORIGIN;
  if (canonical && /^https?:\/\/[A-Za-z0-9.\-:]{1,253}\/?$/.test(canonical)) {
    return canonical.replace(/\/$/, "");
  }
  const proto = ((req.headers["x-forwarded-proto"] as string) || req.protocol || "https").split(",")[0].trim();
  const safeProto = proto === "http" || proto === "https" ? proto : "https";
  const host =
    safeHost(req.headers["x-forwarded-host"] as string | undefined) ||
    safeHost(req.headers.host) ||
    "siebertservices.com";
  return `${safeProto}://${host}`;
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Slugs in URLs should already be URL-safe; encode defensively then escape for XML.
function safeUrl(origin: string, path: string): string {
  return xmlEscape(`${origin}${path}`);
}

router.get("/sitemap.xml", async (req: Request, res: Response) => {
  try {
    const origin = siteOrigin(req);
    const today = new Date().toISOString().split("T")[0];

    let posts: { slug: string; updatedAt: Date | null; publishedAt: Date | null }[] = [];
    try {
      posts = await db
        .select({
          slug: blogPostsTable.slug,
          updatedAt: blogPostsTable.updatedAt,
          publishedAt: blogPostsTable.publishedAt,
        })
        .from(blogPostsTable)
        .where(eq(blogPostsTable.status, "published"))
        .orderBy(desc(blogPostsTable.publishedAt));
    } catch {
      // continue without posts
    }

    const urls: string[] = [];
    for (const r of STATIC_ROUTES) {
      urls.push(
        `<url><loc>${safeUrl(origin, r.path)}</loc><lastmod>${today}</lastmod><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`
      );
    }
    for (const p of posts) {
      // Filter to URL-safe slugs only — guards against malformed slugs producing invalid XML.
      if (!p.slug || !/^[a-zA-Z0-9_-]+$/.test(p.slug)) continue;
      const lastmod = (p.updatedAt || p.publishedAt || new Date()).toISOString().split("T")[0];
      urls.push(
        `<url><loc>${safeUrl(origin, `/blog/${p.slug}`)}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`
      );
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (err) {
    console.error("sitemap error", err);
    res.status(500).type("text/plain").send("sitemap error");
  }
});

router.get("/robots.txt", (req: Request, res: Response) => {
  const origin = siteOrigin(req);
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /portal",
    "Disallow: /api/",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.set("Cache-Control", "public, max-age=86400");
  res.send(body);
});

export default router;
