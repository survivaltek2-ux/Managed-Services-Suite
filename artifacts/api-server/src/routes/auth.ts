import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db, usersTable } from "@workspace/db";
import { loginCodesTable, partnersTable } from "@workspace/db/schema";
import { eq, and, gt, isNull, asc } from "drizzle-orm";
import { generateToken, requireAuth, requireAdmin, AuthRequest } from "../middlewares/auth.js";
import { Response } from "express";
import { sendLoginCode, sendUserRegistrationNotification, sendPasswordResetEmail } from "../lib/email.js";
import { inviteGuestUser } from "../lib/microsoft-graph.js";

function getAppBaseUrl(): string {
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI || "";
  const m = redirectUri.match(/^(https?:\/\/[^/]+)/);
  return m ? m[1] : "https://siebertrservices.com";
}

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
    sendUserRegistrationNotification({
      name: user.name,
      email: user.email,
      company: user.company,
      password,
    }).catch(err => console.error("[Email] User registration notification error:", err));
    const portalUrl = `${getAppBaseUrl()}/portal`;
    inviteGuestUser(
      user.email,
      user.name,
      portalUrl,
      `Hi ${user.name}, you've been invited to access the Siebert Services client portal. Click the link below to accept your invitation and sign in with Microsoft.`
    ).then(result => {
      if (result) {
        db.update(usersTable)
          .set({ msObjectId: result.msObjectId })
          .where(eq(usersTable.id, user.id))
          .catch(err => console.error("[Graph] Failed to store ms_object_id:", err));
      }
    }).catch(err => console.error("[Graph] Guest invite error:", err));
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
    await db.update(usersTable).set({ lastLoginAt: new Date() }).where(eq(usersTable.id, user.id));
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        phone: user.phone,
        role: user.role,
        mustChangePassword: user.mustChangePassword ?? false,
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
      mustChangePassword: user.mustChangePassword ?? false,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to get user" });
  }
});

router.put("/auth/me", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, company, phone } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (company) updates.company = company;
    if (phone !== undefined) updates.phone = phone || null;
    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.userId!)).returning();
    if (!user) { res.status(404).json({ error: "not_found" }); return; }
    res.json({
      id: user.id, name: user.name, email: user.email,
      company: user.company, phone: user.phone, role: user.role, createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to update profile" });
  }
});

router.post("/auth/change-password", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "validation_error", message: "currentPassword and newPassword are required" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!user) {
      res.status(404).json({ error: "not_found", message: "User not found" });
      return;
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      res.status(401).json({ error: "unauthorized", message: "Current password is incorrect" });
      return;
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(usersTable).set({ password: hashedPassword, mustChangePassword: false }).where(eq(usersTable.id, req.userId!));
    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to change password" });
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

router.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email: rawEmail } = req.body;
    const email = rawEmail?.trim().toLowerCase();
    if (!email) {
      res.status(400).json({ error: "validation_error", message: "email is required" });
      return;
    }
    // Respond immediately to prevent email enumeration
    res.json({ success: true, message: "If an account exists for this email, a reset link has been sent." });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) return;

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await db.update(usersTable).set({ resetToken: token, resetTokenExpires: expires }).where(eq(usersTable.id, user.id));

    const resetUrl = `${getAppBaseUrl()}/reset-password?token=${token}`;
    sendPasswordResetEmail(user.email, user.name, resetUrl).catch(err =>
      console.error("[Email] Password reset email error:", err)
    );
  } catch (err) {
    console.error("Forgot password error:", err);
  }
});

router.post("/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json({ error: "validation_error", message: "token and password are required" });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "validation_error", message: "Password must be at least 8 characters" });
      return;
    }
    const now = new Date();
    const [user] = await db.select().from(usersTable)
      .where(and(eq(usersTable.resetToken, token), gt(usersTable.resetTokenExpires, now)))
      .limit(1);
    if (!user) {
      res.status(400).json({ error: "invalid_token", message: "Reset link is invalid or has expired. Please request a new one." });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.update(usersTable).set({ password: hashedPassword, resetToken: null, resetTokenExpires: null })
      .where(eq(usersTable.id, user.id));
    res.json({ success: true, message: "Password reset successfully. You can now sign in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to reset password" });
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

router.post("/auth/set-password", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      res.status(400).json({ error: "validation_error", message: "newPassword is required" });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: "validation_error", message: "Password must be at least 8 characters" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!user) {
      res.status(404).json({ error: "not_found", message: "User not found" });
      return;
    }
    if (!user.mustChangePassword) {
      res.status(403).json({ error: "forbidden", message: "Password change not required for this account" });
      return;
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(usersTable).set({ password: hashedPassword, mustChangePassword: false }).where(eq(usersTable.id, req.userId!));
    res.json({ success: true, message: "Password set successfully" });
  } catch (err) {
    console.error("Set password error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to set password" });
  }
});

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  const bytes = crypto.randomBytes(10);
  for (let i = 0; i < 10; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return `Tmp@${password}`;
}

router.get("/admin/users", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const admins = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        mustChangePassword: usersTable.mustChangePassword,
        lastLoginAt: usersTable.lastLoginAt,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.role, "admin"))
      .orderBy(asc(usersTable.createdAt));
    res.json(admins);
  } catch (err) {
    console.error("List admin users error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to list admin users" });
  }
});

router.post("/admin/users", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email: rawEmail } = req.body;
    const email = rawEmail?.trim().toLowerCase();
    if (!name || !email) {
      res.status(400).json({ error: "validation_error", message: "name and email are required" });
      return;
    }

    const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "conflict", message: "An account with this email already exists" });
      return;
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const [user] = await db.insert(usersTable).values({
      name,
      email,
      password: hashedPassword,
      company: "Siebert Services",
      role: "admin" as const,
      mustChangePassword: true,
    }).returning();

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mustChangePassword: user.mustChangePassword,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      tempPassword,
    });
  } catch (err) {
    console.error("Create admin user error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to create admin user" });
  }
});

router.post("/admin/users/:id/reset-password", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (isNaN(targetId)) {
      res.status(400).json({ error: "validation_error", message: "Invalid user id" });
      return;
    }

    const [target] = await db.select({ id: usersTable.id, role: usersTable.role }).from(usersTable).where(eq(usersTable.id, targetId)).limit(1);
    if (!target) {
      res.status(404).json({ error: "not_found", message: "User not found" });
      return;
    }
    if (target.role !== "admin") {
      res.status(403).json({ error: "forbidden", message: "Can only reset passwords for admin accounts" });
      return;
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await db.update(usersTable)
      .set({ password: hashedPassword, mustChangePassword: true })
      .where(eq(usersTable.id, targetId));

    res.json({ tempPassword });
  } catch (err) {
    console.error("Reset admin password error:", err);
    res.status(500).json({ error: "server_error", message: "Failed to reset password" });
  }
});

export default router;
