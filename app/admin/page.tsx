import type { Metadata } from "next";
import Link from "next/link";

import { ConsoleShell } from "@/components/admin/ConsoleShell";
import {
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  StatCard,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { backendSummary, getAgentHealth, getRecentTraces } from "@/lib/backend";
import {
  HARDENING_CONTROLS,
  HARDENING_OPEN_ITEMS,
  hardeningCounts,
} from "@/lib/hardening";
import {
  formatDuration,
  formatRelative,
  formatTimestamp,
  shortTraceId,
  traceDuration,
  traceErrorCount,
  traceLlmCallCount,
  traceModel,
  traceServices,
  traceStart,
  traceTokenUsage,
  traceToolCallCount,
} from "@/lib/jaeger";

export const metadata: Metadata = {
  title: { absolute: "Overview · Argus Operations" },
};

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const [health, traces] = await Promise.all([
    getAgentHealth(),
    getRecentTraces(20),
  ]);
  const backend = backendSummary();
  const counts = hardeningCounts();

  const errorTraces = traces.filter(
    (trace) => traceErrorCount(trace) > 0,
  ).length;
  const totalSpans = traces.reduce((sum, trace) => sum + trace.spans.length, 0);
  const totalToolCalls = traces.reduce(
    (sum, trace) => sum + traceToolCallCount(trace),
    0,
  );
  const totalLlmCalls = traces.reduce(
    (sum, trace) => sum + traceLlmCallCount(trace),
    0,
  );
  const tokens = traces.reduce(
    (total, trace) => {
      const usage = traceTokenUsage(trace);
      total.input += usage.input;
      total.output += usage.output;
      return total;
    },
    { input: 0, output: 0 },
  );
  const durations = traces
    .map(traceDuration)
    .filter((duration) => duration > 0)
    .sort((left, right) => left - right);
  const p95 = durations.length
    ? durations[Math.min(durations.length - 1, Math.floor(durations.length * 0.95))]
    : 0;
  const model = traces.map(traceModel).find(Boolean) ?? "—";
  const modeTone =
    health?.mode === "replay"
      ? "info"
      : health?.mode === "live"
        ? "good"
        : "warn";
  const healthTone = health ? "good" : "bad";

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <PageHeader
        eyebrow="Operations"
        title="Runtime overview"
        description="A protected view of the public assistant, its trace store, and the controls that keep the replay boundary closed."
        actions={
          <>
            <Link
              href="/admin/scenarios"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-400 px-3.5 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-300"
            >
              Run a scenario
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-lg border border-white/10 px-3.5 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-white/20 hover:text-slate-200"
            >
              Refresh
            </Link>
          </>
        }
      />

      {!health ? (
        <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-xs leading-5 text-rose-200">
          The assistant health endpoint did not respond at{" "}
          <span className="font-mono text-rose-100">{backend.agentHost}</span>.
          Trace data may still be available below.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Runtime"
          value={health ? (health.status ?? "online") : "unreachable"}
          detail={`${health?.mode ?? "unknown"} mode · v${health?.version ?? "—"}`}
          tone={healthTone}
        />
        <StatCard
          label="Recent traces"
          value={traces.length}
          detail="Last 24 hours · 20 max"
        />
        <StatCard
          label="Error traces"
          value={errorTraces}
          detail={`${totalSpans} spans across the window`}
          tone={errorTraces > 0 ? "bad" : "good"}
        />
        <StatCard
          label="p95 duration"
          value={formatDuration(p95)}
          detail={`${totalToolCalls} tool calls · ${totalLlmCalls} LLM calls`}
        />
        <StatCard
          label="Tokens"
          value={tokens.input + tokens.output}
          detail={`${tokens.input} in · ${tokens.output} out`}
          mono
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel
          title="Recent traces"
          description="Agent traces from the last 24 hours. Open a trace to inspect the span waterfall, service timing, tool activity, and token counts."
          actions={
            <Link
              href="/admin/scenarios"
              className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-emerald-300/80 transition-colors hover:text-emerald-200"
            >
              Scenarios →
            </Link>
          }
          bodyClassName="p-0"
        >
          {traces.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="No traces yet"
                description="Run one of the recorded scenarios to create a trace, then refresh this page."
                action={
                  <Link
                    href="/admin/scenarios"
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-400 px-3.5 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-300"
                  >
                    Open scenario runner
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto admin-scroll">
              <table className="w-full min-w-[860px] text-left text-xs">
                <thead className="border-b border-white/10 text-[0.55rem] uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Trace</th>
                    <th className="px-3 py-3 font-medium">When</th>
                    <th className="px-3 py-3 font-medium">Services</th>
                    <th className="px-3 py-3 text-right font-medium">Spans</th>
                    <th className="px-3 py-3 text-right font-medium">
                      Duration
                    </th>
                    <th className="px-3 py-3 text-right font-medium">Errors</th>
                    <th className="px-3 py-3 text-right font-medium">Tools</th>
                    <th className="px-5 py-3 text-right font-medium">Tokens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {traces.map((trace) => {
                    const usage = traceTokenUsage(trace);
                    const errors = traceErrorCount(trace);
                    const services = traceServices(trace);
                    return (
                      <tr
                        key={trace.traceID}
                        className="transition-colors hover:bg-white/[0.025]"
                      >
                        <td className="px-5 py-3">
                          <Link
                            href={`/admin/traces/${trace.traceID}`}
                            className="font-mono text-[0.68rem] text-emerald-300 transition-colors hover:text-emerald-200"
                            title={trace.traceID}
                          >
                            {shortTraceId(trace.traceID)}
                          </Link>
                          <p className="mt-0.5 font-mono text-[0.55rem] text-slate-600">
                            {traceModel(trace) ?? "model n/a"}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-slate-400">
                          <span
                            title={formatTimestamp(traceStart(trace))}
                            className="whitespace-nowrap"
                          >
                            {formatRelative(traceStart(trace))}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1">
                            {services.map((service) => (
                              <span
                                key={service}
                                className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[0.55rem] text-slate-400"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-300">
                          {trace.spans.length}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-300">
                          {formatDuration(traceDuration(trace))}
                        </td>
                        <td className="px-3 py-3 text-right">
                          {errors > 0 ? (
                            <Badge tone="bad">{errors}</Badge>
                          ) : (
                            <span className="font-mono text-slate-600">0</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-300">
                          {traceToolCallCount(trace)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="font-mono text-slate-300">
                            {usage.input + usage.output}
                          </span>
                          <p className="mt-0.5 font-mono text-[0.55rem] text-slate-600">
                            {usage.input}/{usage.output}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <div className="space-y-5">
          <Panel title="Runtime">
            <dl className="space-y-3 text-xs">
              <RuntimeRow label="Status">
                <Badge tone={healthTone}>
                  {health ? (health.status ?? "online") : "unreachable"}
                </Badge>
              </RuntimeRow>
              <RuntimeRow label="Mode">
                <Badge tone={modeTone}>{health?.mode ?? "unknown"}</Badge>
              </RuntimeRow>
              <RuntimeRow label="Public profile">
                <Badge tone={health?.public_mode ? "good" : "neutral"}>
                  {health ? (health.public_mode ? "enabled" : "local") : "unknown"}
                </Badge>
              </RuntimeRow>
              <RuntimeRow label="Record mode">
                <span className="font-mono text-slate-300">
                  {health?.replay_record_mode ?? "—"}
                </span>
              </RuntimeRow>
              <RuntimeRow label="Version">
                <span className="font-mono text-slate-300">
                  {health?.version ?? "—"}
                </span>
              </RuntimeRow>
              <RuntimeRow label="Model">
                <span className="font-mono text-slate-300">{model}</span>
              </RuntimeRow>
              <RuntimeRow label="History cap">
                <span className="font-mono text-slate-300">
                  {health?.history_max_tokens ?? "—"} tokens
                </span>
              </RuntimeRow>
            </dl>
            <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-slate-600">
                Tool profile
              </p>
              <p className="mt-1.5 break-words font-mono text-[0.62rem] leading-5 text-slate-400">
                {health?.tools ?? "No tool profile reported."}
              </p>
            </div>
          </Panel>

          <Panel title="Public edge">
            <dl className="space-y-3 text-xs">
              <RuntimeRow label="Agent host">
                <span className="font-mono text-[0.62rem] text-slate-300">
                  {backend.agentHost}
                </span>
              </RuntimeRow>
              <RuntimeRow label="Jaeger host">
                <span className="font-mono text-[0.62rem] text-slate-300">
                  {backend.jaegerHost}
                </span>
              </RuntimeRow>
              <RuntimeRow label="BFF auth">
                <Badge tone={backend.bffAuth ? "good" : "warn"}>
                  {backend.bffAuth ? "enabled" : "not configured"}
                </Badge>
              </RuntimeRow>
              <RuntimeRow label="Rate limit">
                <span className="font-mono text-slate-300">
                  {health?.edge?.rate_limit_per_minute ?? "—"}/min
                </span>
              </RuntimeRow>
              <RuntimeRow label="Max concurrent">
                <span className="font-mono text-slate-300">
                  {health?.edge?.max_concurrent ?? "—"}
                </span>
              </RuntimeRow>
              <RuntimeRow label="Max prompt">
                <span className="font-mono text-slate-300">
                  {health?.edge?.max_prompt_bytes ?? "—"} B
                </span>
              </RuntimeRow>
            </dl>
            <p className="mt-4 text-[0.65rem] leading-5 text-slate-500">
              The browser never receives these hosts or the BFF token. Trace and
              Jaeger reads happen server-side.
            </p>
          </Panel>

          <Panel title="Hardening">
            <div className="flex flex-wrap gap-2">
              <Badge tone="good">{counts.implemented} implemented</Badge>
              <Badge tone="warn">{counts.partial} partial</Badge>
              <Badge>{counts.planned} planned</Badge>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{
                  width: `${
                    (counts.implemented /
                      Math.max(
                        1,
                        counts.implemented + counts.partial + counts.planned,
                      )) *
                    100
                  }%`,
                }}
              />
            </div>
            <p className="mt-3 text-[0.65rem] leading-5 text-slate-500">
              {HARDENING_OPEN_ITEMS.length} open items remain before a live,
              production deployment. The full control list is below.
            </p>
            <a
              href="#hardening"
              className="mt-3 inline-flex font-mono text-[0.58rem] uppercase tracking-[0.12em] text-emerald-300/80 transition-colors hover:text-emerald-200"
            >
              View controls →
            </a>
          </Panel>
        </div>
      </div>

      <Panel
        title="Hardening controls"
        description="Implemented in the public profile. The customer surface never displays these details."
        className="scroll-mt-24"
      >
        <div id="hardening" className="grid gap-3 md:grid-cols-2">
          {HARDENING_CONTROLS.map((control) => {
            const tone =
              control.status === "implemented"
                ? "good"
                : control.status === "partial"
                  ? "warn"
                  : "neutral";
            return (
              <div
                key={control.id}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-slate-500">
                    {control.id}
                  </span>
                  <Badge tone={tone}>{control.status}</Badge>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-slate-100">
                  {control.title}
                </h3>
                <p className="mt-1.5 text-xs leading-5 text-slate-400">
                  {control.summary}
                </p>
                <p className="mt-2 text-[0.65rem] leading-5 text-slate-500">
                  {control.detail}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-amber-300/80">
            Open items
          </p>
          <ul className="mt-3 grid gap-2 text-xs leading-5 text-slate-300 md:grid-cols-2">
            {HARDENING_OPEN_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400/70" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Panel>
      </div>
    </ConsoleShell>
  );
}

function RuntimeRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
