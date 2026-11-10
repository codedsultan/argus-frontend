import type { Metadata } from "next";
import Link from "next/link";

import { ConsoleShell } from "@/components/admin/ConsoleShell";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Badge, PageHeader, Panel } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { PREVIEW_PROMPTS } from "@/lib/prompts";

import { runScenario } from "./actions";

export const metadata: Metadata = {
  title: "Scenarios",
};

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  "unknown-scenario": "The selected scenario is not in the recorded set.",
  "request-failed":
    "The public assistant did not accept the run. Check the backend health and the BFF token.",
  "no-trace":
    "The assistant responded, but no trace ID was returned. Check Jaeger and the agent's trace exporter.",
};

const SCENARIO_DETAIL: Record<string, { tool: string; result: string }> = {
  catalog: {
    tool: "list_products",
    result: "product cards, prices, and categories",
  },
  currencies: {
    tool: "get_supported_currencies",
    result: "the supported currency list",
  },
  promotions: {
    tool: "get_ads",
    result: "the current binocular promotion",
  },
};

type ScenariosPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ScenariosPage({
  searchParams,
}: ScenariosPageProps) {
  await requireAdmin();
  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Scenarios"
          title="Recorded scenario runner"
        description="Runs one of the three recorded prompts through the public proxy and opens the resulting trace. The request is sent server-side; the BFF token never reaches the browser."
        actions={
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-lg border border-white/10 px-3.5 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-white/20 hover:text-slate-200"
          >
            Back to overview
          </Link>
        }
      />

      {errorMessage ? (
        <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-xs leading-5 text-rose-200">
          {errorMessage}
        </div>
      ) : null}

      <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-amber-100/90">
            Each run consumes one public request. The runner shares the same
            allowlist, body cap, and per-client budget as the customer
            assistant.
          </p>
          <Badge tone="warn" className="shrink-0">
            replay only
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {PREVIEW_PROMPTS.map((scenario) => {
          const detail = SCENARIO_DETAIL[scenario.id];
          return (
            <Panel
              key={scenario.id}
              title={scenario.title}
              description={scenario.description}
              actions={<Badge tone="info">{scenario.label}</Badge>}
            >
              <div className="rounded-lg border border-white/10 bg-black/25 p-3">
                <p className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-slate-600">
                  Recorded prompt
                </p>
                <p className="mt-1.5 break-words font-mono text-[0.65rem] leading-5 text-slate-300">
                  {scenario.prompt}
                </p>
              </div>

              {detail ? (
                <dl className="mt-4 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <dt className="shrink-0 text-slate-500">Tool</dt>
                    <dd className="text-right font-mono text-[0.62rem] text-slate-300">
                      {detail.tool}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="shrink-0 text-slate-500">Returns</dt>
                    <dd className="text-right text-slate-300">
                      {detail.result}
                    </dd>
                  </div>
                </dl>
              ) : null}

              <form action={runScenario} className="mt-5">
                <input type="hidden" name="scenario" value={scenario.id} />
                <SubmitButton
                  pendingLabel="Running…"
                  className="w-full"
                >
                  Run scenario
                </SubmitButton>
              </form>
            </Panel>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="What happens next">
          <ol className="space-y-3 text-xs leading-5 text-slate-400">
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] font-mono text-[0.55rem] text-slate-500">
                1
              </span>
              The server action posts the recorded prompt with an empty history.
            </li>
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] font-mono text-[0.55rem] text-slate-500">
                2
              </span>
              The public proxy checks the prompt allowlist, body cap, and request
              budget.
            </li>
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] font-mono text-[0.55rem] text-slate-500">
                3
              </span>
              The agent replays the cassette, calls the read-only tool, and
              exports spans to Jaeger.
            </li>
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] font-mono text-[0.55rem] text-slate-500">
                4
              </span>
              The console polls Jaeger for the trace and redirects to the span
              waterfall.
            </li>
          </ol>
        </Panel>

        <Panel title="Boundary">
          <ul className="space-y-3 text-xs leading-5 text-slate-400">
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              No live model provider is called.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              Cart, checkout, and cart-read tools are removed in public mode.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              Non-empty history and unrecorded prompts are rejected at the edge.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              Prompt and completion content is removed before trace storage.
            </li>
          </ul>
          <p className="mt-4 text-[0.65rem] leading-5 text-slate-500">
            If a run fails, the console returns here with an operator-readable
            error instead of exposing the upstream response.
          </p>
        </Panel>
      </div>
      </div>
    </ConsoleShell>
  );
}
