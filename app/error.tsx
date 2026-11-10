"use client";

import Link from "next/link";
import { useEffect } from "react";

import { ArgusMark } from "@/components/ArgusMark";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("argus: customer route error", error);
  }, [error]);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 paper-noise" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center sm:px-8 lg:py-32">
          <ArgusMark className="h-14 w-14 text-forest" />
          <p className="eyebrow mt-6 text-[0.58rem] text-ink-soft/55">
            Something went off the trail
          </p>
          <h1 className="display mt-4 text-5xl leading-[0.98] text-ink sm:text-6xl">
            We lost the path for a moment.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-ink-soft">
            The page could not finish loading. Try again, or head back to the
            field guide and start from a known marker.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-forest-deep"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-paper px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-moss/60"
            >
              Back to the field guide
            </Link>
          </div>
          {error.digest ? (
            <p className="mt-6 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-soft/45">
              Reference {error.digest}
            </p>
          ) : null}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
