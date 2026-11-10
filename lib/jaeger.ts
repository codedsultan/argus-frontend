export type JaegerTag = {
  key: string;
  type: string;
  value: unknown;
};

export type JaegerSpan = {
  traceID: string;
  spanID: string;
  operationName: string;
  references?: Array<{
    refType: string;
    traceID: string;
    spanID: string;
  }>;
  startTime: number;
  duration: number;
  tags?: JaegerTag[];
  logs?: unknown[];
  processID?: string;
  process?: {
    serviceName: string;
    tags?: JaegerTag[];
  };
};

export type JaegerTrace = {
  traceID: string;
  spans: JaegerSpan[];
  processes: Record<
    string,
    {
      serviceName: string;
      tags?: JaegerTag[];
    }
  >;
  warnings?: string[] | null;
};

export type TokenUsage = {
  input: number;
  output: number;
};

export function tagValue(
  span: JaegerSpan,
  key: string,
): string | number | boolean | undefined {
  const tag = span.tags?.find((candidate) => candidate.key === key);
  if (!tag) return undefined;
  const value = tag.value;
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  return undefined;
}

export function tagNumber(span: JaegerSpan, keys: string[]): number {
  for (const key of keys) {
    const value = tagValue(span, key);
    const number = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(number)) return number;
  }
  return 0;
}

export function spanService(span: JaegerSpan, trace: JaegerTrace): string {
  return (
    span.process?.serviceName ??
    (span.processID ? trace.processes[span.processID]?.serviceName : undefined) ??
    "unknown"
  );
}

export function spanStatus(span: JaegerSpan): "error" | "ok" {
  const error = tagValue(span, "error");
  if (error === true || error === "true") return "error";
  const statusCode = tagValue(span, "otel.status_code");
  if (statusCode === "ERROR") return "error";
  const status = tagValue(span, "status.code");
  if (status === "ERROR" || status === 2) return "error";
  return "ok";
}

export function traceStart(trace: JaegerTrace): number {
  if (trace.spans.length === 0) return 0;
  return Math.min(...trace.spans.map((span) => span.startTime));
}

export function traceDuration(trace: JaegerTrace): number {
  if (trace.spans.length === 0) return 0;
  const start = traceStart(trace);
  const end = Math.max(
    ...trace.spans.map((span) => span.startTime + span.duration),
  );
  return Math.max(0, end - start);
}

export function traceServices(trace: JaegerTrace): string[] {
  return [...new Set(trace.spans.map((span) => spanService(span, trace)))].sort();
}

export function traceErrorCount(trace: JaegerTrace): number {
  return trace.spans.filter((span) => spanStatus(span) === "error").length;
}

export function traceToolCallCount(trace: JaegerTrace): number {
  return trace.spans.filter(
    (span) =>
      tagValue(span, "gen_ai.operation.name") === "execute_tool" ||
      Boolean(tagValue(span, "gen_ai.tool.name")),
  ).length;
}

export function traceLlmCallCount(trace: JaegerTrace): number {
  return trace.spans.filter(
    (span) =>
      tagValue(span, "gen_ai.operation.name") === "chat" ||
      Boolean(tagValue(span, "gen_ai.request.model")) ||
      Boolean(tagValue(span, "gen_ai.system")),
  ).length;
}

export function traceTokenUsage(trace: JaegerTrace): TokenUsage {
  let input = 0;
  let output = 0;

  for (const span of trace.spans) {
    input += tagNumber(span, [
      "gen_ai.usage.input_tokens",
      "gen_ai.usage.prompt_tokens",
      "llm.token_count.prompt",
    ]);
    output += tagNumber(span, [
      "gen_ai.usage.output_tokens",
      "gen_ai.usage.completion_tokens",
      "llm.token_count.completion",
    ]);
  }

  return { input, output };
}

export function traceModel(trace: JaegerTrace): string | null {
  for (const span of trace.spans) {
    const model =
      tagValue(span, "gen_ai.request.model") ??
      tagValue(span, "gen_ai.response.model") ??
      tagValue(span, "llm.request.model");
    if (typeof model === "string" && model) return model;
  }
  return null;
}

export function formatDuration(microseconds: number): string {
  if (!Number.isFinite(microseconds) || microseconds <= 0) return "0 ms";
  if (microseconds < 1_000) return `${Math.round(microseconds)} µs`;
  if (microseconds < 1_000_000) {
    return `${(microseconds / 1_000).toFixed(1)} ms`;
  }
  return `${(microseconds / 1_000_000).toFixed(2)} s`;
}

export function formatTimestamp(microseconds: number): string {
  if (!microseconds) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(microseconds / 1_000));
}

export function formatRelative(microseconds: number): string {
  if (!microseconds) return "unknown";
  const deltaSeconds = Math.round((microseconds / 1_000 - Date.now()) / 1_000);
  const formatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
    ["second", 1],
  ];
  for (const [unit, seconds] of units) {
    if (Math.abs(deltaSeconds) >= seconds || unit === "second") {
      return formatter.format(Math.round(deltaSeconds / seconds), unit);
    }
  }
  return "just now";
}

export function shortTraceId(traceId: string): string {
  return traceId.length > 12 ? `${traceId.slice(0, 8)}…${traceId.slice(-4)}` : traceId;
}

export function spanOffset(span: JaegerSpan, trace: JaegerTrace): number {
  const start = traceStart(trace);
  return Math.max(0, span.startTime - start);
}

export function spanWidth(span: JaegerSpan, trace: JaegerTrace): number {
  const duration = traceDuration(trace);
  if (duration <= 0) return 100;
  return Math.max(0.8, Math.min(100, (span.duration / duration) * 100));
}
