import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/site/ProductCard";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  CATALOG_CATEGORIES,
  PRODUCTS,
  productsInCategory,
  toProductCard,
} from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Catalog",
  description:
    "Browse the Argus Field Supply catalog: binoculars, travel telescopes, field guides, lighting, and optics care.",
  alternates: {
    canonical: "/catalog",
  },
};

type CatalogPageProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const requested =
    typeof params.category === "string" ? params.category : "all";
  const activeCategory = CATALOG_CATEGORIES.some(
    (category) => category.id === requested,
  )
    ? requested
    : "all";
  const products = productsInCategory(activeCategory).map(toProductCard);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden border-b border-line/70">
          <div className="pointer-events-none absolute inset-0 paper-noise" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-72 field-grid opacity-60" />
          <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
            <p className="eyebrow flex items-center gap-2 text-ink-soft/65">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              The field catalog
            </p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h1 className="display max-w-3xl text-5xl leading-[0.98] text-ink sm:text-6xl">
                  Gear for the trail, the ridge, and the night sky.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-ink-soft">
                  {PRODUCTS.length} products across optics, field guides, and
                  essentials. Ask Argus for a recommendation or browse the
                  shelf at your own pace.
                </p>
              </div>
              <Link
                href="/assistant"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-forest-deep"
              >
                Ask Argus <ArrowIcon />
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
          <div className="flex flex-wrap items-center gap-2">
            {CATALOG_CATEGORIES.map((category) => {
              const active = category.id === activeCategory;
              return (
                <Link
                  key={category.id}
                  href={
                    category.id === "all"
                      ? "/catalog"
                      : `/catalog?category=${category.id}`
                  }
                  className={
                    active
                      ? "rounded-full bg-forest px-4 py-2 text-xs font-semibold text-paper"
                      : "rounded-full border border-line bg-paper/70 px-4 py-2 text-xs font-semibold text-ink-soft transition-colors hover:border-moss/60 hover:text-forest"
                  }
                >
                  {category.label}
                </Link>
              );
            })}
            <span className="ml-auto text-xs text-ink-soft/60">
              {products.length} {products.length === 1 ? "product" : "products"}
            </span>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {products.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-line bg-paper-deep/40 p-8 text-center">
              <p className="display text-2xl text-ink">Nothing in this aisle yet.</p>
              <p className="mt-2 text-sm text-ink-soft">
                Try another category or browse the full catalog.
              </p>
              <Link
                href="/catalog"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest"
              >
                Browse all gear <ArrowIcon />
              </Link>
            </div>
          ) : null}
        </section>

        <section className="border-t border-line/70 bg-paper-deep/40">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-12 sm:px-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-ink-soft/60">Not sure where to start?</p>
              <p className="display mt-2 text-2xl text-ink">
                Ask Argus to narrow the field.
              </p>
            </div>
            <Link
              href="/assistant"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-forest-deep"
            >
              Open the assistant <ArrowIcon />
            </Link>
          </div>
        </section>
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
