import { Badge } from "@/components/admin/ui";
import { cx } from "@/lib/format";
import {
  formatDuration,
  spanOffset,
  spanService,
  spanStatus,
  spanWidth,
  tagNumber,
  tagValue,
  traceDuration,
  traceServices,
  type JaegerSpan,
  type JaegerTrace,
} from "@/lib/jaeger";

const SENSITIVE_KEY_FRAGMENTS = [
  "prompt",
  "completion",
  "content",
  "message",
  "instruction",
  "arguments",
  "definition",
  "description",
  "result",
  "task.input",
  "task.output",
  "input.value",
  "output.value",
  "entity.input",
  "entity.output",
  "http.request.body",
  "http.response.body",
  "db.statement",
  "authorization",
  "cookie",
  "api_key",
  "apikey",
  "secret",
  "password",
  "bearer",
];

type JaegerLog = {
  timestamp?: number;
  fields?: Array<{ key: string; value: unknown }>;
};

function isSensitiveTag(key: string): boolean {
  const normalized = key.toLowerCase();
  return SENSITIVE_KEY_FRAGMENTS.some((fragment) =>
    normalized.includes(fragment),
  );
}

function formatTagValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") {
    return value.length > 220 ? `${value.slice(0, 220)}…` : value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    const json = JSON.stringify(value);
    return json.length > 220 ? `${json.slice(0, 220)}…` : json;
  } catch {
    return String(value);
  }
}

function logEventName(log: JaegerLog): string {
  const event = log.fields?.find((field) => field.key === "event");
  return event ? formatTagValue(event.value) : "log event";
}

function spanDepth(span: JaegerSpan, spanById: Map<string, JaegerSpan>): number {
  let depth = 0;
  let current = span;
  const seen = new Set<string>();

  while (depth < 6) {
    const reference = current.references?.find(
      (candidate) => candidate.refType === "CHILD_OF",
    );
    if (!reference || seen.has(reference.spanID)) break;
    seen.add(reference.spanID);
    const parent = spanById.get(reference.spanID);
    if (!parent) break;
    depth += 1;
    current = parent;
  }

  return depth;
}

function serviceColor(service: string) {
  if (service === "agent") {
    return {
      dot: "bg-emerald-400",
      bar: "bg-emerald-400/70",
      text: "text-emerald-300",
    };
  }
  if (service === "shop-api") {
    return {
      dot: "bg-sky-400",
      bar: "bg-sky-400/70",
      text: "text-sky-300",
    };
  }
  return {
    dot: "bg-amber-400",
    bar: "bg-amber-400/70",
    text: "text-amber-300",
  };
}

export function TraceWaterfall({ trace }: { trace: JaegerTrace }) {
  const spanById = new Map(trace.spans.map((span) => [span.spanID, span]));
  const ordered = [...trace.spans].sort(
    (left, right) =>
      left.startTime - right.startTime || right.duration - left.duration,
  );
  const services = traceServices(trace);
  const total = traceDuration(trace);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {services.map((service) => (
          <span
            key={service}
            className="inline-flex items-center gap-1.5 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-slate-500"
          >
            <span
              className={cx(
                "h-1.5 w-1.5 rounded-full",
                serviceColor(service).dot,
              )}
            />
            {service}
          </span>
        ))}
        <span className="ml-auto font-mono text-[0.55rem] uppercase tracking-[0.12em] text-slate-600">
          {trace.spans.length} spans · {formatDuration(total)}
        </span>
      </div>

      <div className="mt-4 space-y-1">
        {ordered.map((span) => {
          const service = spanService(span, trace);
          const colors = serviceColor(service);
          const depth = spanDepth(span, spanById);
          const offset = total > 0 ? (spanOffset(span, trace) / total) * 100 : 0;
          const width = spanWidth(span, trace);
          const tool = tagValue(span, "gen_ai.tool.name");
          const operation = tagValue(span, "gen_ai.operation.name");
          const model =
            tagValue(span, "gen_ai.request.model") ??
            tagValue(span, "gen_ai.response.model");
          const inputTokens = tagNumber(span, [
            "gen_ai.usage.input_tokens",
            "gen_ai.usage.prompt_tokens",
          ]);
          const outputTokens = tagNumber(span, [
            "gen_ai.usage.output_tokens",
            "gen_ai.usage.completion_tokens",
          ]);
          const tags = (span.tags ?? []).filter(
            (tag) => !isSensitiveTag(tag.key),
          );
          const hiddenTags = (span.tags ?? []).length - tags.length;
          const logs = (span.logs ?? []) as JaegerLog[];

          return (
            <details
              key={span.spanID}
              className="group rounded-lg border border-white/5 bg-white/[0.015] open:border-white/10 open:bg-white/[0.03]"
            >
              <summary className="flex cursor-pointer list-none flex-col gap-2 px-3 py-2.5 [&::-webkit-details-marker]:hidden sm:flex-row sm:items-center">
                <div
                  className="flex min-w-0 flex-1 items-center gap-2"
                  style={{ paddingLeft: `${depth * 16}px` }}
                >
                  <span
                    className={cx(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      colors.dot,
                    )}
                  />
                  <span className="shrink-0 font-mono text-[0.52rem] uppercase tracking-[0.1em] text-slate-500">
                    {service}
                  </span>
                  <span className="truncate text-xs text-slate-200">
                    {span.operationName}
                  </span>
                  {tool ? (
                    <Badge tone="info" className="shrink-0">
                      tool
                    </Badge>
                  ) : null}
                  {model ? (
                    <Badge tone="neutral" className="hidden shrink-0 sm:inline-flex">
                      llm
                    </Badge>
                  ) : null}
                  {operation === "execute_tool" ? (
                    <Badge tone="info" className="hidden shrink-0 sm:inline-flex">
                      exec
                    </Badge>
                  ) : null}
                  {spanStatus(span) === "error" ? (
                    <Badge tone="bad" className="shrink-0">
                      error
                    </Badge>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-3 pl-4 sm:pl-0">
                  {inputTokens + outputTokens > 0 ? (
                    <span className="font-mono text-[0.55rem] text-slate-500">
                      {inputTokens}/{outputTokens} tok
                    </span>
                  ) : null}
                  <span className="w-20 text-right font-mono text-[0.62rem] text-slate-400">
                    {formatDuration(span.duration)}
                  </span>
                </div>
              </summary>

              <div className="border-t border-white/5 px-3 py-3">
                <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.04]">
                  <div
                    className={cx(
                      "absolute top-0 h-full rounded-full",
                      colors.bar,
                    )}
                    style={{ left: `${offset}%`, width: `${width}%` }}
                  />
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.55rem] text-slate-500">
                  <span>span {span.spanID}</span>
                  <span>start +{formatDuration(spanOffset(span, trace))}</span>
                  {span.references?.length ? (
                    <span>parent {span.references[0].spanID}</span>
                  ) : (
                    <span>root</span>
                  )}
                  {hiddenTags > 0 ? (
                    <span className="text-amber-300/70">
                      {hiddenTags} content tags hidden
                    </span>
                  ) : null}
                </div>

                {tags.length > 0 ? (
                  <dl className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                    {tags.map((tag) => (
                      <div
                        key={tag.key}
                        className="flex min-w-0 items-baseline justify-between gap-3 border-b border-white/5 py-1"
                      >
                        <dt className="shrink-0 font-mono text-[0.55rem] text-slate-500">
                          {tag.key}
                        </dt>
                        <dd
                          className="truncate text-right font-mono text-[0.58rem] text-slate-300"
                          title={formatTagValue(tag.value)}
                        >
                          {formatTagValue(tag.value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-3 text-[0.65rem] leading-5 text-slate-500">
                    No displayable tags on this span.
                  </p>
                )}

                {logs.length > 0 ? (
                  <div className="mt-3">
                    <p className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-slate-600">
                      Log events
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {logs.map((log, index) => (
                        <li
                          key={`${span.spanID}-log-${index}`}
                          className="font-mono text-[0.58rem] text-slate-400"
                        >
                          {logEventName(log)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
