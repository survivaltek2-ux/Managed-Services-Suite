import crypto from "crypto";

const SIGNWELL_BASE = "https://www.signwell.com/api/v1";

function getApiKey(): string | null {
  return process.env.SIGNWELL_API_KEY || null;
}

function isTestMode(): boolean {
  return process.env.SIGNWELL_TEST_MODE !== "false";
}

export interface EsignSigner {
  id: string;
  name: string;
  email: string;
  role?: string;
  signingOrder: number;
}

export interface CreateEnvelopeParams {
  documentName: string;
  fileBase64: string;
  fileName: string;
  signers: EsignSigner[];
  subject?: string;
  message?: string;
}

export interface EnvelopeResult {
  providerEnvelopeId: string;
  signingUrl?: string;
  status: string;
}

async function signwellRequest(method: string, path: string, body?: object): Promise<any> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("SIGNWELL_API_KEY not configured");

  const res = await fetch(`${SIGNWELL_BASE}${path}`, {
    method,
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`SignWell API error ${res.status}: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

export async function createAndSendEnvelope(params: CreateEnvelopeParams): Promise<EnvelopeResult> {
  const recipients = params.signers.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    signing_order: s.signingOrder,
    ...(s.role ? { placeholder_name: s.role } : {}),
  }));

  const body: any = {
    test_mode: isTestMode(),
    name: params.documentName,
    files: [{ file_base64: params.fileBase64, file_name: params.fileName }],
    recipients,
    draft: false,
    reminders: true,
    apply_signing_order: params.signers.length > 1,
  };

  if (params.subject) body.subject = params.subject;
  if (params.message) body.message = params.message;

  const data = await signwellRequest("POST", "/documents", body);

  return {
    providerEnvelopeId: data.id,
    status: data.status || "sent",
    signingUrl: data.signing_url,
  };
}

export async function getEnvelopeStatus(providerEnvelopeId: string): Promise<{
  status: string;
  recipients: Array<{ email: string; name: string; status: string; signedAt?: string; viewedAt?: string }>;
  completedAt?: string;
}> {
  const data = await signwellRequest("GET", `/documents/${providerEnvelopeId}`);

  const recipients = (data.recipients || []).map((r: any) => ({
    email: r.email,
    name: r.name,
    status: r.status || "pending",
    signedAt: r.signed_at,
    viewedAt: r.viewed_at,
  }));

  return {
    status: data.status,
    recipients,
    completedAt: data.completed_at,
  };
}

export async function downloadCompletedPdf(providerEnvelopeId: string): Promise<Buffer> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("SIGNWELL_API_KEY not configured");

  const res = await fetch(`${SIGNWELL_BASE}/documents/${providerEnvelopeId}/completed_pdf`, {
    headers: { "X-Api-Key": apiKey },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SignWell download error ${res.status}: ${text}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  if (!secret) return true;
  try {
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature || ""), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function isSignwellConfigured(): boolean {
  return !!getApiKey();
}
