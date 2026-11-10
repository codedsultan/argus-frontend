import Link from "next/link";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SITE } from "@/lib/site";

export function LegalPage({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden border-b border-line/70">
          <div className="pointer-events-none absolute inset-0 paper-noise" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 field-grid opacity-50" />
          <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
            <p className="eyebrow flex items-center gap-2 text-ink-soft/65">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              {eyebrow}
            </p>
            <h1 className="display mt-4 max-w-3xl text-5xl leading-[0.98] text-ink sm:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-ink-soft">
              {intro}
            </p>
            <p className="mt-5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-soft/50">
              Last updated {updated}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:py-20">
          <div className="prose-editorial">{children}</div>

          <div className="mt-12 rounded-2xl border border-line/80 bg-paper-deep/40 p-5">
            <p className="text-sm leading-6 text-ink-soft">
              Questions about this page?{" "}
              <a
                href={`mailto:${SITE.supportEmail}`}
                className="font-semibold text-forest underline decoration-forest/30 underline-offset-4 hover:text-forest-deep"
              >
                Contact the field desk
              </a>
              .
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/privacy"
              className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink-soft transition-colors hover:border-moss/60 hover:text-forest"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink-soft transition-colors hover:border-moss/60 hover:text-forest"
            >
              Terms
            </Link>
            <Link
              href="/status"
              className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink-soft transition-colors hover:border-moss/60 hover:text-forest"
            >
              Status
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
