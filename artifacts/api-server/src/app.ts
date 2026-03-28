import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { existsSync } from "fs";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import router from "./routes/index.js";

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

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith("/api/webhooks/tsd/")) {
    let totalBytes = 0;
    let data: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes > WEBHOOK_MAX_BYTES) {
        res.status(413).json({ error: "payload_too_large" });
        req.destroy();
        return;
      }
      data.push(chunk);
    });
    req.on("end", () => {
      req.rawBody = Buffer.concat(data);
      express.json()(req, res, next);
    });
    req.on("error", next);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use("/api", router);

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
