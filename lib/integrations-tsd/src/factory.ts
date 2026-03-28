import type { TsdConnector, TsdProvider, TsdAuthCredentials } from "./types.js";
import { TelarusAdapter } from "./adapters/telarus.js";
import { IntelisysAdapter } from "./adapters/intelisys.js";

export function createTsdConnector(provider: TsdProvider, credentialRef: string): TsdConnector {
  switch (provider) {
    case "telarus": {
      const [apiKey, agentId] = credentialRef.split("::");
      return new TelarusAdapter({ type: "api_key", apiKey, agentId });
    }
    case "intelisys": {
      const [apiKey, partnerId] = credentialRef.split("::");
      return new IntelisysAdapter({ apiKey, partnerId });
    }
    default:
      throw new Error(`Unknown TSD provider: ${provider}`);
  }
}

export function createTsdConnectorWithAuth(provider: TsdProvider, credentials: TsdAuthCredentials): TsdConnector {
  switch (provider) {
    case "telarus":
      return new TelarusAdapter(credentials);
    case "intelisys":
      return new IntelisysAdapter({
        apiKey: credentials.apiKey || "",
        partnerId: credentials.partnerId,
      });
    default:
      throw new Error(`Unknown TSD provider: ${provider}`);
  }
}

export function resolveCredentialRef(provider: TsdProvider): string | null {
  switch (provider) {
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
