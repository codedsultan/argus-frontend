import "server-only";

import type { AgentPromptResponse } from "./types";
import type { JaegerTrace } from "./jaeger";

const AGENT_URL = (process.env.AGENT_URL ?? "http://localhost:8012").replace(
  /\/$/,
  "",
);
const JAEGER_URL = (process.env.JAEGER_URL ?? "http://localhost:16686").replace(
  /\/$/,
  "",
);
const BFF_TOKEN = process.env.ARGUS_BFF_TOKEN?.trim() ?? "";

export type AgentHealth = {
  status?: string;
  service?: string;
  version?: string;
  tools?: string;
  public_mode?: boolean;
  mode?: string;
  replay_record_mode?: string;
  history_max_tokens?: number;
  edge?: {
    bff_auth?: boolean;
    rate_limit_per_minute?: number;
    max_concurrent?: number;
    max_prompt_bytes?: number;
  };
};

function authHeaders(): Record<string, string> {
  return BFF_TOKEN ? { authorization: `Bearer ${BFF_TOKEN}` } : {};
}

async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
  timeoutMs = 8_000,
): Promise<T | null> {
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        accept: "application/json",
        ...authHeaders(),
        ...(init.headers ?? {}),
      },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getAgentHealth(): Promise<AgentHealth | null> {
  return fetchJson<AgentHealth>(`${AGENT_URL}/healthz`, {}, 5_000);
}

export async function getRecentTraces(limit = 20): Promise<JaegerTrace[]> {
  const payload = await fetchJson<{ data?: JaegerTrace[] | null }>(
    `${JAEGER_URL}/api/traces?service=agent&limit=${limit}&lookback=24h`,
  );
  return payload?.data ?? [];
}

export async function getTrace(traceId: string): Promise<JaegerTrace | null> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const payload = await fetchJson<{ data?: JaegerTrace[] | null }>(
      `${JAEGER_URL}/api/traces/${encodeURIComponent(traceId)}`,
    );
    const trace = payload?.data?.[0];
    if (trace) return trace;
    await new Promise((resolve) => setTimeout(resolve, 600));
  }
  return null;
}

export async function runRecordedPrompt(
  message: string,
): Promise<{ traceId: string | null; response: AgentPromptResponse } | null> {
  try {
    const response = await fetch(`${AGENT_URL}/prompt`, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "admin-console",
        ...authHeaders(),
      },
      body: JSON.stringify({ message, history: [] }),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as AgentPromptResponse;
    return { traceId: payload.trace_id ?? null, response: payload };
  } catch {
    return null;
  }
}

export function backendSummary() {
  let agentHost = AGENT_URL;
  let jaegerHost = JAEGER_URL;
  try {
    agentHost = new URL(AGENT_URL).host;
  } catch {
    // Keep the raw value for local, non-URL configurations.
  }
  try {
    jaegerHost = new URL(JAEGER_URL).host;
  } catch {
    // Keep the raw value for local, non-URL configurations.
  }
  return {
    agentHost,
    jaegerHost,
    bffAuth: Boolean(BFF_TOKEN),
  };
}
