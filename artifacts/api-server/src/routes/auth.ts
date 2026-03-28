import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { loginCodesTable, partnersTable } from "@workspace/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { generateToken, requireAuth, AuthRequest } from "../middlewares/auth.js";
import { Response } from "express";
import { sendLoginCode } from "../lib/email.js";

const router: IRouter = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email: rawEmail, password, company, phone } = req.body;
    const email = rawEmail?.trim().toLowerCase();
    if (!name || !email || !password || !company) {
      res.status(400).json({ error: "validation_error", message: "name, email, password, and company are required" });
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "conflict", message: "An account with this email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      name,
      email,
      password: hashedPassword,
      company,
      phone: phone || null,
    }).returning();

    const token = generateToken(user.id, user.role);
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "server_error", message: "Registration failed" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;
    const email = rawEmail?.trim().toLowerCase();
    if (!email || !password) {
      res.status(400).json({ error: "validation_error", message: "email and password are required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ error: "unauthorized", message: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "unauthorized", message: "Invalid credentials" });
      return;
    }

    const token = generateToken(user.id, user.role);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "server_error", message: "Login failed" });
  }
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!user) {
      res.status(404).json({ error: "not_found", message: "User not found" });
      return;
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to get user" });
  }
});

router.post("/auth/request-code", async (req, res) => {
  try {
    const { email: rawEmail, type } = req.body;
    const email = rawEmail?.trim().toLowerCase();
    if (!email || !type) {
      res.status(400).json({ message: "email and type are required" });
      return;
    }

    const table = type === "partner" ? partnersTable : usersTable;
    const [account] = await db.select().from(table as typeof usersTable).where(eq((table as typeof usersTable).email, email)).limit(1);
    if (!account) {
      res.json({ sent: true });
      return;
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.insert(loginCodesTable).values({ email, code, type, expiresAt });
    const sent = await sendLoginCode(email, code, type as "user" | "partner");
    if (!sent) {
      res.status(503).json({ message: "Email could not be sent. The email service may not be configured yet. Please contact support or use password login." });
      return;
    }

    res.json({ sent: true });
  } catch (err) {
    console.error("request-code error:", err);
    res.status(500).json({ message: "Failed to send code" });
  }
});

router.post("/auth/verify-code", async (req, res) => {
  try {
    const { email: rawEmail, code, type } = req.body;
    const email = rawEmail?.trim().toLowerCase();
    if (!email || !code || !type) {
      res.status(400).json({ message: "email, code, and type are required" });
      return;
    }

    const now = new Date();
    const [record] = await db
      .select()
      .from(loginCodesTable)
      .where(
        and(
          eq(loginCodesTable.email, email),
          eq(loginCodesTable.code, code),
          eq(loginCodesTable.type, type),
          gt(loginCodesTable.expiresAt, now),
          isNull(loginCodesTable.usedAt),
        )
      )
      .limit(1);

    if (!record) {
      res.status(401).json({ message: "Invalid or expired code" });
      return;
    }

    await db.update(loginCodesTable).set({ usedAt: now }).where(eq(loginCodesTable.id, record.id));

    const table = type === "partner" ? partnersTable : usersTable;
    const [account] = await db.select().from(table as typeof usersTable).where(eq((table as typeof usersTable).email, email)).limit(1);
    if (!account) {
      res.status(401).json({ message: "Account not found" });
      return;
    }

    const token = generateToken(account.id, (account as any).role ?? "partner");
    res.json({
      token,
      user: {
        id: account.id,
        name: (account as any).name ?? (account as any).contactName,
        email: account.email,
        company: (account as any).company ?? (account as any).companyName,
        phone: account.phone ?? null,
        role: (account as any).role ?? "partner",
        createdAt: account.createdAt,
      },
    });
  } catch (err) {
    console.error("verify-code error:", err);
    res.status(500).json({ message: "Failed to verify code" });
  }
});

export default router;
