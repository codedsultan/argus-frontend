import Link from "next/link";

import { ArgusMark } from "@/components/ArgusMark";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 paper-noise" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 field-grid opacity-60" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center sm:px-8 lg:py-32">
          <ArgusMark className="h-14 w-14 text-forest" />
          <p className="eyebrow mt-6 text-[0.58rem] text-ink-soft/55">
            404 · off the trail
          </p>
          <h1 className="display mt-4 text-5xl leading-[0.98] text-ink sm:text-6xl">
            This trail ends here.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-ink-soft">
            The page you were looking for is not in the field guide. Head back to
            the catalog or ask Argus a recorded question.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-forest-deep"
            >
              Back to the field guide
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-paper px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-moss/60"
            >
              Browse the catalog
            </Link>
          </div>
          <Link
            href="/assistant"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-forest-deep"
          >
            Open the assistant <ArrowIcon />
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
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
