import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db, usersTable, partnersTable, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sendPartnerSsoRegistrationNotification } from "../lib/email.js";

const router = Router();

const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || "";
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || "";
const TENANT_ID = process.env.MICROSOFT_TENANT_ID || "common";
const REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI || "";
const JWT_SECRET = process.env.JWT_SECRET || "siebert-services-secret-key-2024";



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

interface SsoDomainRule {
  domain: string;
  role: "client" | "admin";
}

function decodeIdTokenClaims(idToken: string): MicrosoftIdTokenClaims {
  try {
    const payload = idToken.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as MicrosoftIdTokenClaims;
  } catch {
    return {};
  }
}

async function getSsoDomainRules(): Promise<SsoDomainRule[]> {
  try {
    const [row] = await db
      .select({ value: siteSettingsTable.value })
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, "sso_domain_rules"))
      .limit(1);
    if (!row?.value) return [];
    return JSON.parse(row.value) as SsoDomainRule[];
  } catch {
    return [];
  }
}

function getRoleForEmail(email: string, rules: SsoDomainRule[]): "client" | "admin" | null {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;
  const exactMatch = rules.find(r => r.domain.toLowerCase() === domain);
  if (exactMatch) return exactMatch.role;
  const wildcardMatch = rules.find(r => r.domain === "*");
  return wildcardMatch ? wildcardMatch.role : null;
}

router.get("/auth/sso/microsoft", (req, res) => {
  const type = req.query.type === "partner" ? "partner" : "client";
  if (!CLIENT_ID || !REDIRECT_URI) {
    const loginPath = type === "partner" ? "/partners/login" : "/portal";
    res.redirect(`${loginPath}?sso_error=sso_not_configured`);
    return;
  }
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

    const domainRules = await getSsoDomainRules();

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

        if (adminUser && adminUser.role === "admin") {
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

        const companyName = profile.companyName || email.split("@")[1]?.split(".")[0] || "Unknown Company";
        const [newPartner] = await db.insert(partnersTable).values({
          companyName,
          contactName: name,
          email,
          password: await bcrypt.hash(ssoId + crypto.randomUUID(), 10),
          phone: null,
          website: null,
          businessType: "other",
          specializations: "[]",
          status: "pending",
          tier: "registered",
          ssoProvider: "microsoft",
          ssoId,
        }).returning();

        sendPartnerSsoRegistrationNotification({
          companyName,
          contactName: name,
          email,
        }).catch(err => console.error("[SSO] Partner registration notification error:", err));

        console.log(`[SSO] Created pending partner account for ${email} via SSO self-registration`);
        const pendingParams = new URLSearchParams({ company: companyName, email });
        res.redirect(`/partners/pending?${pendingParams}`);
        return;
      }

      if (!partner.ssoId) {
        await db
          .update(partnersTable)
          .set({ ssoProvider: "microsoft", ssoId })
          .where(eq(partnersTable.id, partner.id));
      }

      if (partner.status === "pending") {
        const pendingParams = new URLSearchParams({ company: partner.companyName, email: partner.email });
        res.redirect(`/partners/pending?${pendingParams}`);
        return;
      }
      if (partner.status === "rejected") {
        res.redirect(`/partners/login?sso_error=account_rejected`);
        return;
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
        const domainRole = getRoleForEmail(email, domainRules);
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
            role: domainRole ?? "client",
          })
          .returning();
        user = newUser;
        console.log(`[SSO] Created new client account for ${email} with role=${user.role}`);
      } else {
        if (!user.ssoId) {
          const domainRole = getRoleForEmail(email, domainRules);
          await db
            .update(usersTable)
            .set({
              ssoProvider: "microsoft",
              ssoId,
              ...(domainRole && user.role !== domainRole ? { role: domainRole } : {}),
            })
            .where(eq(usersTable.id, user.id));
          user = { ...user, ssoId, ssoProvider: "microsoft", role: domainRole ?? user.role };
        }
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

export default router;
