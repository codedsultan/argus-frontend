export type HardeningStatus = "implemented" | "partial" | "planned";

export type HardeningControl = {
  id: string;
  title: string;
  status: HardeningStatus;
  summary: string;
  detail: string;
};

export const HARDENING_CONTROLS: HardeningControl[] = [
  {
    id: "H1",
    title: "Authenticated edge",
    status: "implemented",
    summary:
      "The public proxy can require a bearer token shared only with the Next.js BFF. The operations console uses a password and an HMAC-signed, HttpOnly session cookie.",
    detail:
      "Set PUBLIC_BFF_TOKEN on the backend and ARGUS_BFF_TOKEN on the frontend to enforce the edge token. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET to enable the console.",
  },
  {
    id: "H2",
    title: "Fail-closed replay",
    status: "implemented",
    summary:
      "The public container runs with VCR_RECORD_MODE=none. A cassette miss raises instead of attempting a provider request.",
    detail:
      "The agent refuses to start in public mode unless USE_VCR=true and VCR_RECORD_MODE=none.",
  },
  {
    id: "H3",
    title: "Read-only public tools",
    status: "implemented",
    summary:
      "Public mode removes add_to_cart, checkout, empty_cart, and get_cart. The recorded scenarios only need catalog and promotion reads.",
    detail:
      "The full local lab keeps the mutating tools for intentional operator testing.",
  },
  {
    id: "H4",
    title: "Trace content redaction",
    status: "implemented",
    summary:
      "TRACELOOP_TRACE_CONTENT=false plus collector transforms remove prompt, completion, and entity payload attributes before storage.",
    detail:
      "The operations console shows span timing, service, tool names, and token counts, not user or model content.",
  },
  {
    id: "H5",
    title: "Request budgets",
    status: "implemented",
    summary:
      "The proxy allowlists the recorded prompts, rejects non-empty history, caps bodies at 16 KiB, limits each client to a per-minute budget, and caps concurrent prompts.",
    detail:
      "The BFF also validates the prompt before it reaches the proxy. The limits are intentionally small because the public surface is a curated preview.",
  },
  {
    id: "H6",
    title: "Single public port",
    status: "implemented",
    summary:
      "Only the proxy binds to the public port. The agent, shop API, collector, and Jaeger bind to localhost inside the container.",
    detail:
      "Jaeger is reachable only through the authenticated proxy path and is rendered by the operations console server-side.",
  },
  {
    id: "H7",
    title: "Live-mode gate",
    status: "implemented",
    summary:
      "Public mode cannot start in live mode. Live operation remains an explicit local/operator profile.",
    detail:
      "A production live deployment still needs provider-key custody, spend caps, per-user identity, and an incident runbook.",
  },
];

export const HARDENING_OPEN_ITEMS = [
  "Per-user identity and session isolation",
  "Distributed rate limiting and spend caps for live models",
  "Audit-log retention and alerting for the operations console",
  "Secret rotation and managed identity for the BFF token",
  "Live-provider evaluation and incident response runbook",
];

export function hardeningCounts() {
  return HARDENING_CONTROLS.reduce(
    (counts, control) => {
      counts[control.status] += 1;
      return counts;
    },
    { implemented: 0, partial: 0, planned: 0 },
  );
}
