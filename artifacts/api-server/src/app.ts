import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { existsSync } from "fs";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import router from "./routes/index.js";

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
