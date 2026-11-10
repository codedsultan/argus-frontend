import type { Metadata } from "next";
import Link from "next/link";

import { ConsoleShell } from "@/components/admin/ConsoleShell";
import { CopyButton } from "@/components/admin/CopyButton";
import { TraceWaterfall } from "@/components/admin/TraceWaterfall";
import {
  Badge,
  PageHeader,
  Panel,
  StatCard,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { getTrace } from "@/lib/backend";
import {
  formatDuration,
  formatTimestamp,
  shortTraceId,
  spanService,
  spanStatus,
  tagValue,
  traceDuration,
  traceErrorCount,
  traceLlmCallCount,
  traceModel,
  traceServices,
  traceStart,
  traceTokenUsage,
  traceToolCallCount,
} from "@/lib/jaeger";

type TracePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: TracePageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Trace ${shortTraceId(id)}`,
  };
}

export const dynamic = "force-dynamic";

export default async function TraceDetailPage({ params }: TracePageProps) {
  await requireAdmin();
  const { id } = await params;
  const trace = await getTrace(id);

  if (!trace) {
    return (
      <ConsoleShell>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Trace"
            title="Trace not found"
          description="Jaeger did not return a trace for this identifier. It may have expired, or the replay run may still be flushing spans."
          actions={
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-lg border border-white/10 px-3.5 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-white/20 hover:text-slate-200"
            >
              Back to overview
            </Link>
          }
        />
        <Panel title="What to check">
          <p className="text-xs leading-5 text-slate-400">
            Confirm the trace identifier, then refresh the overview. The scenario
            runner redirects to a trace after the agent responds, so a new trace
            can take a moment to appear.
          </p>
          <p className="mt-3 break-all rounded-lg border border-white/10 bg-black/20 px-3 py-2 font-mono text-[0.62rem] text-slate-300">
            {id}
          </p>
        </Panel>
        </div>
      </ConsoleShell>
    );
  }

  const services = traceServices(trace);
  const duration = traceDuration(trace);
  const start = traceStart(trace);
  const errors = traceErrorCount(trace);
  const toolCalls = traceToolCallCount(trace);
  const llmCalls = traceLlmCallCount(trace);
  const tokens = traceTokenUsage(trace);
  const model = traceModel(trace) ?? "—";
  const serviceStats = services.map((service) => {
    const spans = trace.spans.filter(
      (span) => spanService(span, trace) === service,
    );
    return {
      service,
      spans: spans.length,
      duration: spans.reduce((sum, span) => sum + span.duration, 0),
    };
  });
  const toolSpans = trace.spans.filter(
    (span) =>
      Boolean(tagValue(span, "gen_ai.tool.name")) ||
      tagValue(span, "gen_ai.operation.name") === "execute_tool",
  );

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Trace"
          title={shortTraceId(trace.traceID)}
        description={`${formatTimestamp(start)} · ${services.join(" → ")}`}
        actions={
          <>
            <CopyButton value={trace.traceID} label="Copy trace ID" />
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-lg border border-white/10 px-3.5 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-white/20 hover:text-slate-200"
            >
              Back to overview
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          label="Duration"
          value={formatDuration(duration)}
          detail="wall clock"
        />
        <StatCard
          label="Spans"
          value={trace.spans.length}
          detail={`${services.length} services`}
        />
        <StatCard
          label="Errors"
          value={errors}
          detail="span status"
          tone={errors > 0 ? "bad" : "good"}
        />
        <StatCard
          label="Tool calls"
          value={toolCalls}
          detail="recorded tool spans"
        />
        <StatCard
          label="LLM calls"
          value={llmCalls}
          detail="chat spans"
        />
        <StatCard
          label="Tokens"
          value={tokens.input + tokens.output}
          detail={`${tokens.input} in · ${tokens.output} out`}
          mono
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.3fr_0.7fr]">
        <div className="space-y-5">
          <Panel title="Trace metadata">
            <dl className="space-y-3 text-xs">
              <MetaRow label="Trace ID">
                <span className="break-all font-mono text-[0.62rem] text-slate-300">
                  {trace.traceID}
                </span>
              </MetaRow>
              <MetaRow label="Started">
                <span className="text-slate-300">
                  {formatTimestamp(start)}
                </span>
              </MetaRow>
              <MetaRow label="Duration">
                <span className="font-mono text-slate-300">
                  {formatDuration(duration)}
                </span>
              </MetaRow>
              <MetaRow label="Model">
                <span className="font-mono text-slate-300">{model}</span>
              </MetaRow>
              <MetaRow label="Services">
                <span className="text-slate-300">{services.join(", ")}</span>
              </MetaRow>
            </dl>
          </Panel>

          <Panel
            title="Redaction"
            actions={<Badge tone="good">content hidden</Badge>}
          >
            <p className="text-xs leading-5 text-slate-400">
              Prompt, completion, tool arguments, tool results, and system
              instructions are removed before trace storage. The waterfall shows
              timing, service, tool names, and token counts.
            </p>
            <p className="mt-3 text-[0.65rem] leading-5 text-slate-500">
              The customer workspace never displays trace identifiers, tool
              calls, or runtime metrics.
            </p>
          </Panel>

          <Panel title="Service breakdown">
            <ul className="space-y-3">
              {serviceStats.map((stat) => (
                <li key={stat.service}>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="inline-flex items-center gap-2 font-mono text-[0.6rem] text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      {stat.service}
                    </span>
                    <span className="font-mono text-[0.58rem] text-slate-500">
                      {stat.spans} spans · {formatDuration(stat.duration)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-slate-400/60"
                      style={{
                        width: `${Math.min(
                          100,
                          (stat.duration / Math.max(1, duration)) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Tool activity">
            {toolSpans.length > 0 ? (
              <ul className="space-y-2">
                {toolSpans.map((span) => (
                  <li
                    key={span.spanID}
                    className="flex items-start justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[0.62rem] text-slate-200">
                        {String(
                          tagValue(span, "gen_ai.tool.name") ??
                            span.operationName,
                        )}
                      </p>
                      <p className="mt-0.5 font-mono text-[0.52rem] text-slate-600">
                        {spanService(span, trace)} · {spanStatus(span)}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[0.58rem] text-slate-500">
                      {formatDuration(span.duration)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs leading-5 text-slate-500">
                No tool calls in this trace.
              </p>
            )}
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel
            title="Span waterfall"
            description="Sorted by start time. Expand a span for tags, timing offset, and parent references."
          >
            <TraceWaterfall trace={trace} />
          </Panel>

          {trace.warnings && trace.warnings.length > 0 ? (
            <Panel title="Jaeger warnings">
              <ul className="space-y-1 text-xs leading-5 text-amber-200">
                {trace.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </div>
      </div>
      </div>
    </ConsoleShell>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="min-w-0 text-right">{children}</dd>
    </div>
  );
}
