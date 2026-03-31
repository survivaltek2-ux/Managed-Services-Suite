import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db, usersTable, partnersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || "";
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || "";
const TENANT_ID = process.env.MICROSOFT_TENANT_ID || "common";
const REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI || "";
const JWT_SECRET = process.env.JWT_SECRET || "siebert-services-secret-key-2024";

const OKTA_CLIENT_ID = process.env.OKTA_CLIENT_ID || "";
const OKTA_CLIENT_SECRET = process.env.OKTA_CLIENT_SECRET || "";
const OKTA_DOMAIN = process.env.OKTA_DOMAIN || "";
const OKTA_REDIRECT_URI = process.env.OKTA_REDIRECT_URI || "";

interface MicrosoftTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  id_token?: string;
}

interface MicrosoftIdTokenClaims {
  tid?: string;
  oid?: string;
  email?: string;
  preferred_username?: string;
}

interface MicrosoftProfile {
  id: string;
  displayName?: string;
  mail?: string;
  userPrincipalName?: string;
  companyName?: string;
}

function decodeIdTokenClaims(idToken: string): MicrosoftIdTokenClaims {
  try {
    const payload = idToken.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as MicrosoftIdTokenClaims;
  } catch {
    return {};
  }
}

router.get("/auth/sso/microsoft", (req, res) => {
  if (!CLIENT_ID || !REDIRECT_URI) {
    res.status(503).json({ error: "sso_not_configured", message: "Microsoft SSO is not configured." });
    return;
  }
  const type = req.query.type === "partner" ? "partner" : "client";
  const state = Buffer.from(JSON.stringify({ type })).toString("base64url");
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    response_mode: "query",
    scope: "openid email profile User.Read",
    state,
  });
  res.redirect(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?${params}`);
});

router.get("/auth/sso/microsoft/callback", async (req, res) => {
  const { code, state, error } = req.query;

  let type: "partner" | "client" = "client";
  try {
    const decoded = JSON.parse(Buffer.from(state as string, "base64url").toString());
    type = decoded.type === "partner" ? "partner" : "client";
  } catch {}

  const loginPath = type === "partner" ? "/partners/login" : "/portal";

  if (error || !code) {
    res.redirect(`${loginPath}?sso_error=access_denied`);
    return;
  }

  try {
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: code as string,
          redirect_uri: REDIRECT_URI,
          grant_type: "authorization_code",
          scope: "openid email profile User.Read",
        }),
      }
    );

    if (!tokenRes.ok) {
      console.error("[SSO] Token exchange failed:", await tokenRes.text());
      res.redirect(`${loginPath}?sso_error=token_failed`);
      return;
    }

    const tokenData = (await tokenRes.json()) as MicrosoftTokenResponse;

    if (TENANT_ID !== "common" && tokenData.id_token) {
      const claims = decodeIdTokenClaims(tokenData.id_token);
      if (claims.tid && claims.tid !== TENANT_ID) {
        console.warn(`[SSO] Tenant mismatch: expected ${TENANT_ID}, got ${claims.tid}`);
        res.redirect(`${loginPath}?sso_error=wrong_tenant`);
        return;
      }
    }

    const profileRes = await fetch(
      "https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName,companyName",
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );

    if (!profileRes.ok) {
      res.redirect(`${loginPath}?sso_error=profile_failed`);
      return;
    }

    const profile = (await profileRes.json()) as MicrosoftProfile;
    const email = (profile.mail || profile.userPrincipalName || "").toLowerCase().trim();
    const name = profile.displayName || email;
    const ssoId = profile.id;

    if (!email) {
      res.redirect(`${loginPath}?sso_error=no_email`);
      return;
    }

    if (type === "partner") {
      const [partner] = await db
        .select()
        .from(partnersTable)
        .where(eq(partnersTable.email, email))
        .limit(1);

      if (!partner) {
        const [adminUser] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);

        if (!adminUser || adminUser.role !== "admin") {
          res.redirect(`/partners/login?sso_error=no_account`);
          return;
        }

        if (!adminUser.ssoId) {
          await db
            .update(usersTable)
            .set({ ssoProvider: "microsoft", ssoId })
            .where(eq(usersTable.id, adminUser.id));
        }

        const token = jwt.sign({ userId: adminUser.id, role: adminUser.role }, JWT_SECRET, { expiresIn: "7d" });
        res.redirect(`/partners/login?sso_token=${token}`);
        return;
      }
      if (!partner.ssoId) {
        await db
          .update(partnersTable)
          .set({ ssoProvider: "microsoft", ssoId })
          .where(eq(partnersTable.id, partner.id));
      }
      const token = jwt.sign({ partnerId: partner.id }, JWT_SECRET, { expiresIn: "7d" });
      res.redirect(`/partners/login?sso_token=${token}`);
    } else {
      let [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      if (!user) {
        const randomPw = await bcrypt.hash(ssoId + crypto.randomUUID(), 10);
        const [newUser] = await db
          .insert(usersTable)
          .values({
            name,
            email,
            password: randomPw,
            company: profile.companyName || "Microsoft SSO User",
            ssoProvider: "microsoft",
            ssoId,
          })
          .returning();
        user = newUser;
      } else if (!user.ssoId) {
        await db
          .update(usersTable)
          .set({ ssoProvider: "microsoft", ssoId })
          .where(eq(usersTable.id, user.id));
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.redirect(`/portal?sso_token=${token}`);
    }
  } catch (err) {
    console.error("[SSO] Error:", err);
    res.redirect(`${loginPath}?sso_error=server_error`);
  }
});

router.get("/auth/sso/okta", (req, res) => {
  if (!OKTA_CLIENT_ID || !OKTA_CLIENT_SECRET || !OKTA_REDIRECT_URI || !OKTA_DOMAIN) {
    res.status(503).json({ error: "sso_not_configured", message: "Okta SSO is not configured." });
    return;
  }
  const type = req.query.type === "partner" ? "partner" : "client";
  const state = Buffer.from(JSON.stringify({ type })).toString("base64url");
  const params = new URLSearchParams({
    client_id: OKTA_CLIENT_ID,
    response_type: "code",
    redirect_uri: OKTA_REDIRECT_URI,
    scope: "openid email profile",
    state,
  });
  res.redirect(`https://${OKTA_DOMAIN}/oauth2/default/v1/authorize?${params}`);
});

router.get("/auth/sso/okta/callback", async (req, res) => {
  const { code, state, error } = req.query;

  let type: "partner" | "client" = "client";
  try {
    const decoded = JSON.parse(Buffer.from(state as string, "base64url").toString());
    type = decoded.type === "partner" ? "partner" : "client";
  } catch {}

  const loginPath = type === "partner" ? "/partners/login" : "/portal";

  if (error || !code) {
    res.redirect(`${loginPath}?sso_error=access_denied`);
    return;
  }

  try {
    const tokenRes = await fetch(
      `https://${OKTA_DOMAIN}/oauth2/default/v1/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: OKTA_CLIENT_ID,
          client_secret: OKTA_CLIENT_SECRET,
          code: code as string,
          redirect_uri: OKTA_REDIRECT_URI,
          grant_type: "authorization_code",
        }),
      }
    );

    if (!tokenRes.ok) {
      console.error("[Okta SSO] Token exchange failed:", await tokenRes.text());
      res.redirect(`${loginPath}?sso_error=token_failed`);
      return;
    }

    const tokenData = (await tokenRes.json()) as { access_token: string; id_token?: string };

    const profileRes = await fetch(
      `https://${OKTA_DOMAIN}/oauth2/default/v1/userinfo`,
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );

    if (!profileRes.ok) {
      res.redirect(`${loginPath}?sso_error=profile_failed`);
      return;
    }

    const profile = (await profileRes.json()) as {
      sub: string;
      email?: string;
      name?: string;
      given_name?: string;
      family_name?: string;
    };

    const email = (profile.email || "").toLowerCase().trim();
    const name = profile.name || profile.given_name || email;
    const ssoId = profile.sub;

    if (!email) {
      res.redirect(`${loginPath}?sso_error=no_email`);
      return;
    }

    if (type === "partner") {
      const [partner] = await db
        .select()
        .from(partnersTable)
        .where(eq(partnersTable.email, email))
        .limit(1);

      if (!partner) {
        const [adminUser] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);

        if (!adminUser || adminUser.role !== "admin") {
          res.redirect(`/partners/login?sso_error=no_account`);
          return;
        }

        if (!adminUser.ssoId) {
          await db
            .update(usersTable)
            .set({ ssoProvider: "okta", ssoId })
            .where(eq(usersTable.id, adminUser.id));
        }

        const token = jwt.sign({ userId: adminUser.id, role: adminUser.role }, JWT_SECRET, { expiresIn: "7d" });
        res.redirect(`/partners/login?sso_token=${token}`);
        return;
      }

      if (!partner.ssoId) {
        await db
          .update(partnersTable)
          .set({ ssoProvider: "okta", ssoId })
          .where(eq(partnersTable.id, partner.id));
      }
      const token = jwt.sign({ partnerId: partner.id }, JWT_SECRET, { expiresIn: "7d" });
      res.redirect(`/partners/login?sso_token=${token}`);
    } else {
      let [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      if (!user) {
        const randomPw = await bcrypt.hash(ssoId + crypto.randomUUID(), 10);
        const [newUser] = await db
          .insert(usersTable)
          .values({
            name,
            email,
            password: randomPw,
            company: "Okta SSO User",
            ssoProvider: "okta",
            ssoId,
          })
          .returning();
        user = newUser;
      } else if (!user.ssoId) {
        await db
          .update(usersTable)
          .set({ ssoProvider: "okta", ssoId })
          .where(eq(usersTable.id, user.id));
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.redirect(`/portal?sso_token=${token}`);
    }
  } catch (err) {
    console.error("[Okta SSO] Error:", err);
    res.redirect(`${loginPath}?sso_error=server_error`);
  }
});

export default router;
