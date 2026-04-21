const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || "";
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || "";
const TENANT_ID = process.env.MICROSOFT_TENANT_ID || "";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAppOnlyToken(): Promise<string | null> {
  if (!CLIENT_ID || !CLIENT_SECRET || !TENANT_ID || TENANT_ID === "common") {
    if (TENANT_ID === "common") {
      console.warn("[Graph] MICROSOFT_TENANT_ID must be a specific tenant ID for app-only tokens. Guest provisioning skipped.");
    }
    return null;
  }
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }
  try {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "https://graph.microsoft.com/.default",
    });
    const res = await fetch(
      `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
      { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body }
    );
    if (!res.ok) {
      const err = await res.text();
      console.error("[Graph] Token acquisition failed:", err);
      return null;
    }
    const data = await res.json() as { access_token: string; expires_in: number };
    cachedToken = {
      value: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    };
    return cachedToken.value;
  } catch (err) {
    console.error("[Graph] Token acquisition error:", err);
    return null;
  }
}

export interface GuestInviteResult {
  msObjectId: string;
  inviteRedeemUrl: string;
}

export async function inviteGuestUser(
  email: string,
  displayName: string,
  redirectUrl: string,
  customMessage?: string
): Promise<GuestInviteResult | null> {
  const token = await getAppOnlyToken();
  if (!token) return null;

  try {
    const body = {
      invitedUserEmailAddress: email,
      invitedUserDisplayName: displayName,
      inviteRedirectUrl: redirectUrl,
      sendInvitationMessage: true,
      invitedUserMessageInfo: customMessage
        ? { customizedMessageBody: customMessage }
        : undefined,
    };

    const res = await fetch("https://graph.microsoft.com/v1.0/invitations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[Graph] Guest invite failed for ${email}:`, err);
      return null;
    }

    const data = await res.json() as {
      invitedUser: { id: string };
      inviteRedeemUrl: string;
    };

    console.log(`[Graph] Guest invited: ${email} → objectId=${data.invitedUser.id}`);
    return {
      msObjectId: data.invitedUser.id,
      inviteRedeemUrl: data.inviteRedeemUrl,
    };
  } catch (err) {
    console.error(`[Graph] Guest invite error for ${email}:`, err);
    return null;
  }
}
