export type TsdProvider = "telarus" | "intelisys";

export interface TsdAuthCredentials {
  type: "api_key" | "username_password";
  apiKey?: string;
  agentId?: string;
  partnerId?: string;
  username?: string;
  password?: string;
  mfaCode?: string;
  securityToken?: string;
}

export interface TsdDeal {
  externalId?: string;
  title: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  description?: string | null;
  estimatedValue?: string | null;
  stage?: string;
  products?: string[];
}

export interface TsdLead {
  externalId: string;
  companyName: string;
  contactName: string;
  email?: string;
  phone?: string;
  source?: string;
  interest?: string;
  status?: string;
}

export interface TsdCommission {
  externalId: string;
  dealReference?: string;
  amount: string;
  status: string;
  description?: string;
  paidAt?: Date;
  periodStart?: Date;
  periodEnd?: Date;
}

export interface TsdWebhookEvent {
  type: "deal_update" | "lead_assigned" | "commission_paid" | "unknown";
  provider: TsdProvider;
  payload: Record<string, unknown>;
  raw: string;
}

export interface TsdPushResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

export interface TsdLoginResult {
  success: boolean;
  sessionToken?: string;
  requiresMfa?: boolean;
  mfaMethod?: string;
  error?: string;
}

export interface TsdConnector {
  provider: TsdProvider;
  pushDeal(deal: TsdDeal): Promise<TsdPushResult>;
  pullLeads(since?: Date): Promise<TsdLead[]>;
  pullCommissions(since?: Date): Promise<TsdCommission[]>;
  handleWebhook(rawBody: string, signature: string, secret: string): Promise<TsdWebhookEvent>;
  testConnection(): Promise<{ ok: boolean; error?: string; requiresMfa?: boolean }>;
  login?(): Promise<TsdLoginResult>;
  isAuthenticated?(): boolean;
}
