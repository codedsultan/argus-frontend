import { cx } from "@/lib/format";

export type BadgeTone = "neutral" | "good" | "warn" | "bad" | "info";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "border-white/10 bg-white/[0.04] text-slate-300",
  good: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  warn: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  bad: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  info: "border-sky-400/30 bg-sky-400/10 text-sky-300",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.12em]",
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-emerald-300/70">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cx(
        "overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]",
        className,
      )}
    >
      {title || actions ? (
        <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? (
              <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}
      <div className={cx("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  detail,
  tone = "neutral",
  mono = false,
}: {
  label: string;
  value: string | number;
  detail?: string;
  tone?: BadgeTone;
  mono?: boolean;
}) {
  const valueTone: Record<BadgeTone, string> = {
    neutral: "text-slate-100",
    good: "text-emerald-300",
    warn: "text-amber-300",
    bad: "text-rose-300",
    info: "text-sky-300",
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <p className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p
        className={cx(
          "mt-2 text-2xl font-semibold tracking-tight",
          valueTone[tone],
          mono && "font-mono text-xl",
        )}
      >
        {value}
      </p>
      {detail ? (
        <p className="mt-1.5 text-xs leading-5 text-slate-500">{detail}</p>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.015] px-6 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-500">
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2.5 2.5" />
        </svg>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-200">{title}</p>
      <p className="mt-1.5 max-w-md text-xs leading-5 text-slate-500">
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
