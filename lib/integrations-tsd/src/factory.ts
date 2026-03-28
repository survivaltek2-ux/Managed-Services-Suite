import type { TsdConnector, TsdProvider, TsdAuthCredentials } from "./types.js";
import { AvantAdapter } from "./adapters/avant.js";
import { TelarusAdapter } from "./adapters/telarus.js";
import { IntelisysAdapter } from "./adapters/intelisys.js";

export function createTsdConnector(provider: TsdProvider, credentialRef: string): TsdConnector {
  switch (provider) {
    case "avant": {
      const [username, password] = credentialRef.split("::");
      return new AvantAdapter({ username: username || "", password: password || "" });
    }
    case "telarus": {
      const [apiKey, agentId] = credentialRef.split("::");
      return new TelarusAdapter({ type: "api_key", apiKey, agentId });
    }
    case "intelisys": {
      const [username, password] = credentialRef.split("::");
      return new IntelisysAdapter({ username: username || "", password: password || "" });
    }
    default:
      throw new Error(`Unknown TSD provider: ${provider}`);
  }
}

export function createTsdConnectorWithAuth(provider: TsdProvider, credentials: TsdAuthCredentials): TsdConnector {
  switch (provider) {
    case "avant":
      return new AvantAdapter({
        username: credentials.username || "",
        password: credentials.password || "",
      });
    case "telarus":
      return new TelarusAdapter(credentials);
    case "intelisys":
      return new IntelisysAdapter({
        username: credentials.username || "",
        password: credentials.password || "",
      });
    default:
      throw new Error(`Unknown TSD provider: ${provider}`);
  }
}

export function resolveCredentialRef(provider: TsdProvider): string | null {
  switch (provider) {
    case "avant": {
      const username = process.env.AVANT_USERNAME;
      const password = process.env.AVANT_PASSWORD;
      return username && password ? `${username}::${password}` : null;
    }
    case "telarus": {
      const key = process.env.TELARUS_API_KEY;
      const agentId = process.env.TELARUS_AGENT_ID || "";
      return key ? `${key}::${agentId}` : null;
    }
    case "intelisys": {
      const username = process.env.INTELISYS_USERNAME;
      const password = process.env.INTELISYS_PASSWORD;
      return username && password ? `${username}::${password}` : null;
    }
    default:
      return null;
  }
}
