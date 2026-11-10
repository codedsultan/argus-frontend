# Argus Frontend

The customer storefront and operations console for the
[Argus agent](https://github.com/codedsultan/argus-ai).

Argus answers questions about **Argus Field Supply**, a fictional field-optics
shop. The customer site presents that as a product: a warm paper-and-forest
storefront, an assistant workspace with saved conversations, a catalog, and a
status page. The operations console is a separate, password-protected surface for
the trace and replay detail that customers never see.

The trace-first companion is
[`argus-agent-web`](https://github.com/codedsultan/argus-agent-web).

**Live:** [argus.xurl.fyi](https://argus.xurl.fyi) · **Operations:** [argus.xurl.fyi/admin/login](https://argus.xurl.fyi/admin/login)

## Two surfaces

**Customer**

- `/` — landing page and sample conversation
- `/assistant` — chat workspace with local conversation history
- `/catalog` — product catalog
- `/catalog/[id]` — product detail
- `/status` — customer-safe service status
- `/privacy`, `/terms` — policy pages
- branded 404, error, and loading states

The customer UI never shows trace IDs, tool calls, token metrics, replay/live
mode, Jaeger links, or operator detail.

**Operations**

- `/admin/login` — password login
- `/admin` — runtime status, recent traces, edge controls, open items
- `/admin/traces/[id]` — span waterfall, tool badges, timing, redacted tags
- `/admin/scenarios` — run a recorded prompt and jump to its trace

The console is protected by a shared password. A successful login sets an
HMAC-signed, HttpOnly session cookie. Both `ADMIN_PASSWORD` and
`ADMIN_SESSION_SECRET` must be set for the console to count as configured; if
either is missing, the admin routes refuse access.

## Architecture

```text
Browser
  │  POST /api/chat
  ▼
Next.js BFF ──► Argus public edge ──► agent ──► shop API
  │                  │
  │                  └──► OTLP collector ──► Jaeger
  ▼
Normalized customer data only

/admin ──► server-side Jaeger query ──► span waterfall
```

- **`/api/chat`** is the only customer backend route. It calls the agent and
  returns only the answer, product cards, promotions, currencies, and friendly
  source names.
- **`AGENT_URL`**, **`JAEGER_URL`**, and **`ARGUS_BFF_TOKEN`** are server-only.
  None of them appears in the customer bundle.
- The admin trace page fetches Jaeger server-side. The customer pages never
  receive a Jaeger URL.
- Product imagery is inline SVG artwork, so the site has no remote image
  dependency.

## Run it locally

Start the replay backend from the sibling `argus-ai` checkout:

```bash
cd ../argus-ai
docker compose -f platform/compose.core.yaml up -d --build
```

The local stack exposes the agent at `http://localhost:8012` and Jaeger at
`http://localhost:16686`. If those ports are taken, set `AGENT_PORT` and
`JAEGER_PORT` for Compose and the matching URLs for this app.

Then:

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Open <http://localhost:3000>. The operations console is at
<http://localhost:3000/admin>.

For local admin access, set `ADMIN_PASSWORD` to any value and
`ADMIN_SESSION_SECRET` to a long random string in `.env.local`.

The public demo is **replay-only**: the backend serves recorded LLM responses
and needs no provider key. It answers the three recorded prompts shown in the
assistant empty state. Use **New chat** between prompts; the public edge rejects
an arbitrary prompt or a non-empty history.

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `AGENT_URL` | `http://localhost:8012` | Server-only agent base URL |
| `JAEGER_URL` | `http://localhost:16686` | Server-only Jaeger API base for the console |
| `ARGUS_BFF_TOKEN` | empty | Optional bearer token shared with the public edge |
| `ADMIN_PASSWORD` | empty | Operations console password |
| `ADMIN_SESSION_SECRET` | empty | HMAC key for the admin session cookie |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical public URL for metadata, robots, and sitemap |

`AGENT_URL`, `JAEGER_URL`, `ARGUS_BFF_TOKEN`, `ADMIN_PASSWORD`, and
`ADMIN_SESSION_SECRET` are read only on the server. Do not prefix them with
`NEXT_PUBLIC_`.

The public edge can require a bearer token. When `PUBLIC_BFF_TOKEN` is set on
the backend, set the same value as `ARGUS_BFF_TOKEN` here. The BFF sends it on
server-side requests; the browser never sees it.

## Deploy

Deploy this app to Vercel and point it at the public Argus edge:

```text
AGENT_URL=https://argus-api.xurl.fyi
JAEGER_URL=https://argus-api.xurl.fyi/jaeger
ARGUS_BFF_TOKEN=<same value as PUBLIC_BFF_TOKEN>
ADMIN_PASSWORD=<operator password>
ADMIN_SESSION_SECRET=<long random value>
NEXT_PUBLIC_SITE_URL=https://argus.xurl.fyi
```

The backend repository includes a single-container public profile in
`deploy/public/` plus `fly.toml` and `render.yaml`. Keep the backend in replay
mode.

## Scripts

```bash
pnpm dev        # local development
pnpm build      # production build
pnpm start      # serve the production build
pnpm typecheck  # tsc --noEmit
```

## License

MIT
