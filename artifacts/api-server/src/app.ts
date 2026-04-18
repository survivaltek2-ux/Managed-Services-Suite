import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { existsSync } from "fs";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import router from "./routes/index.js";
import seoRouter from "./routes/seo.js";

declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

const app: Express = express();
const workspaceRoot = process.cwd();
const marketingDist = path.resolve(workspaceRoot, "artifacts", "siebert-services", "dist", "public");
const partnerDist = path.resolve(workspaceRoot, "artifacts", "partner-portal", "dist", "public");
const marketingIndex = path.join(marketingDist, "index.html");
const partnerIndex = path.join(partnerDist, "index.html");
const staticOptions = {
  index: false,
  extensions: ["html"],
};

app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());

const WEBHOOK_MAX_BYTES = 1 * 1024 * 1024;

function captureRawBody(req: Request, _res: Response, buf: Buffer): void {
  if (
    req.path.startsWith("/api/webhooks/tsd/") ||
    req.path.startsWith("/api/webhooks/zoom/")
  ) {
    req.rawBody = Buffer.from(buf);
  }
}

app.use(express.json({ limit: "15mb", verify: captureRawBody }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.use((req: Request, res: Response, next: NextFunction) => {
  if (
    req.rawBody &&
    (req.path.startsWith("/api/webhooks/tsd/") || req.path.startsWith("/api/webhooks/zoom/")) &&
    req.rawBody.length > WEBHOOK_MAX_BYTES
  ) {
    res.status(413).json({ error: "payload_too_large" });
    return;
  }
  next();
});
app.use(authMiddleware);

app.use("/api", router);

// SEO routes served at the site root (sitemap.xml, robots.txt)
app.use(seoRouter);

if (existsSync(partnerIndex)) {
  app.use("/partners", express.static(partnerDist, staticOptions));
  app.get(/^\/partners(\/.*)?$/, (_req, res) => {
    res.sendFile(partnerIndex);
  });
}

if (existsSync(marketingIndex)) {
  app.use(express.static(marketingDist, staticOptions));
  app.get(/^\/(admin|portal|blog|services|zoom|about|contact|quote)(\/.*)?$/, (_req, res) => {
    res.sendFile(marketingIndex);
  });
  app.get(/^\/proposal\/.*$/, (_req, res) => {
    res.sendFile(marketingIndex);
  });
  app.get("/", (_req, res) => {
    res.sendFile(marketingIndex);
  });
}

export default app;
