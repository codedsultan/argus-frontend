import Link from "next/link";

import { ArgusMark } from "@/components/ArgusMark";
import { FOOTER_LINKS, SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line/70 bg-paper-deep/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <ArgusMark className="h-9 w-9 text-forest" />
            <span className="leading-none">
              <span className="display block text-[1.05rem] font-semibold tracking-[0.16em] text-ink">
                ARGUS
              </span>
              <span className="eyebrow mt-1 block text-[0.58rem] text-ink-soft/70">
                Field Supply
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-ink-soft">
            Field intelligence for better gear decisions. Ask about the
            catalog, compare optics, and get an answer grounded in the store.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-xs text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
            {SITE.previewLabel} · no account required
          </p>
        </div>

        <div>
          <p className="eyebrow text-ink-soft/60">Product</p>
          <ul className="mt-4 space-y-3 text-sm">
            {FOOTER_LINKS.product.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-ink-soft transition-colors hover:text-forest"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-ink-soft/60">Company</p>
          <ul className="mt-4 space-y-3 text-sm">
            {FOOTER_LINKS.company.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-ink-soft transition-colors hover:text-forest"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-ink-soft/70 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} {SITE.name}. A fictional field-supply
            storefront.
          </p>
          <p className="font-mono tracking-wide">
            Curated preview · replay-grounded answers
          </p>
        </div>
      </div>
    </footer>
  );
}
