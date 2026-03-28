import type { TsdConnector, TsdProvider } from "./types.js";
import { AvantAdapter } from "./adapters/avant.js";
import { TelarusAdapter } from "./adapters/telarus.js";
import { IntelisysAdapter } from "./adapters/intelisys.js";

export function createTsdConnector(provider: TsdProvider, credentialRef: string): TsdConnector {
  switch (provider) {
    case "avant":
      return new AvantAdapter(credentialRef);
    case "telarus": {
      const [apiKey, agentId] = credentialRef.split("::");
      return new TelarusAdapter({ apiKey, agentId });
    }
    case "intelisys": {
      const [apiKey, partnerId] = credentialRef.split("::");
      return new IntelisysAdapter({ apiKey, partnerId });
    }
    default:
      throw new Error(`Unknown TSD provider: ${provider}`);
  }
}

export function resolveCredentialRef(provider: TsdProvider): string | null {
  switch (provider) {
    case "avant":
      return process.env.AVANT_API_KEY || null;
    case "telarus": {
      const key = process.env.TELARUS_API_KEY;
      const agentId = process.env.TELARUS_AGENT_ID || "";
      return key ? `${key}::${agentId}` : null;
    }
    case "intelisys": {
      const key = process.env.INTELISYS_API_KEY;
      const partnerId = process.env.INTELISYS_PARTNER_ID || "";
      return key ? `${key}::${partnerId}` : null;
    }
    default:
      return null;
  }
}
