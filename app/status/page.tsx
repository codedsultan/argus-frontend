import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getAgentHealth } from "@/lib/backend";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Status",
  description:
    "Current status of the Argus Field Supply assistant and catalog preview.",
  alternates: {
    canonical: "/status",
  },
};

export const dynamic = "force-dynamic";

function statusLabel(health: Awaited<ReturnType<typeof getAgentHealth>>) {
  if (!health) {
    return {
      tone: "down" as const,
      label: "Unavailable",
      detail: "The assistant did not respond to the last health check.",
    };
  }
  if (health.mode === "replay") {
    return {
      tone: "up" as const,
      label: "Online",
      detail: "The curated replay preview is accepting recorded questions.",
    };
  }
  return {
    tone: "up" as const,
    label: "Online",
    detail: "The assistant is accepting questions.",
  };
}

export default async function StatusPage() {
  const health = await getAgentHealth();
  const status = statusLabel(health);
  const checkedAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden border-b border-line/70">
          <div className="pointer-events-none absolute inset-0 paper-noise" />
          <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
            <p className="eyebrow flex items-center gap-2 text-ink-soft/65">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              Service status
            </p>
            <h1 className="display mt-4 max-w-3xl text-5xl leading-[0.98] text-ink sm:text-6xl">
              A small service, checked honestly.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-ink-soft">
              The assistant and catalog preview are monitored separately from
              the customer workspace. This page shows what the preview can
              verify right now.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.5rem] border border-line/80 bg-paper p-6 card-shadow sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-ink-soft/55">Assistant</p>
                  <p className="display mt-2 text-3xl text-ink">
                    {status.label}
                  </p>
                </div>
                <span
                  className={
                    status.tone === "up"
                      ? "inline-flex items-center gap-2 rounded-full border border-moss/30 bg-moss/10 px-3 py-1.5 text-xs font-semibold text-forest"
                      : "inline-flex items-center gap-2 rounded-full border border-clay/30 bg-clay/10 px-3 py-1.5 text-xs font-semibold text-clay"
                  }
                >
                  <span
                    className={
                      status.tone === "up"
                        ? "h-1.5 w-1.5 rounded-full bg-moss"
                        : "h-1.5 w-1.5 rounded-full bg-clay"
                    }
                  />
                  {status.tone === "up" ? "Operational" : "Degraded"}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-ink-soft">
                {status.detail}
              </p>

              <dl className="mt-8 grid gap-4 border-t border-line/70 pt-6 sm:grid-cols-3">
                <div>
                  <dt className="eyebrow text-[0.52rem] text-ink-soft/50">
                    Mode
                  </dt>
                  <dd className="mt-1.5 text-sm font-medium text-ink">
                    {health?.mode === "replay"
                      ? "Replay preview"
                      : health?.mode === "live"
                        ? "Live model"
                        : "Unknown"}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-[0.52rem] text-ink-soft/50">
                    Catalog
                  </dt>
                  <dd className="mt-1.5 text-sm font-medium text-ink">
                    {health ? "Available" : "Not checked"}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-[0.52rem] text-ink-soft/50">
                    Checked
                  </dt>
                  <dd className="mt-1.5 text-sm font-medium text-ink">
                    {checkedAt}
                  </dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/assistant"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-paper transition-colors hover:bg-forest-deep"
                >
                  Open the assistant <ArrowIcon />
                </Link>
                <a
                  href={`mailto:${SITE.supportEmail}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-moss/60"
                >
                  Contact the field desk
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-line/80 bg-paper-deep/40 p-6">
                <p className="eyebrow text-ink-soft/55">What this checks</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-ink-soft">
                  <li className="flex items-start gap-2.5">
                    <CheckIcon />
                    The public assistant health endpoint.
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckIcon />
                    Whether the preview is in replay or live mode.
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckIcon />
                    The time of the most recent check.
                  </li>
                </ul>
              </div>

              <div className="rounded-[1.5rem] border border-amber/30 bg-amber/10 p-6">
                <p className="eyebrow text-[0.55rem] text-amber">
                  Preview boundary
                </p>
                <p className="mt-2 text-sm leading-6 text-ink">
                  This build answers three recorded questions. It does not run a
                  live model, place orders, or change cart state.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-line/80 bg-paper-deep/40 p-6">
                <p className="eyebrow text-ink-soft/55">Operator view</p>
                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  Runtime detail, trace inspection, and scenario controls live
                  in the separate operations console.
                </p>
                <Link
                  href="/admin"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-deep"
                >
                  Operations console <ArrowIcon />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="mt-1 h-3.5 w-3.5 shrink-0 text-moss"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
