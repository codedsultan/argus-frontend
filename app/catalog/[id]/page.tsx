import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductArtwork } from "@/components/site/ProductArtwork";
import { ProductCard } from "@/components/site/ProductCard";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  PRODUCTS,
  categoryLabel,
  formatPrice,
  getProduct,
  relatedProducts,
  toProductCard,
} from "@/lib/catalog";
import type { Product } from "@/lib/types";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ id: product.id }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) {
    return { title: "Product not found" };
  }
  return {
    title: product.name,
    description: product.description,
    alternates: {
      canonical: `/catalog/${product.id}`,
    },
    openGraph: {
      title: `${product.name} · Argus Field Supply`,
      description: product.description,
      url: `/catalog/${product.id}`,
    },
  };
}

const FIELD_NOTES: Record<string, string[]> = {
  binoculars: [
    "Low-light glass with a wide field of view.",
    "Close focus works for birds, ridgelines, and the night sky.",
    "A balanced everyday optic for a day pack.",
  ],
  telescopes: [
    "Built for lunar, planetary, and deep-sky viewing.",
    "Ships with the eyepieces and mount you need to start.",
    "A good first step before a larger optical tube.",
  ],
  accessories: [
    "Keeps the rest of the kit working in the field.",
    "Small enough to live in a jacket pocket or pack lid.",
    "A practical add-on rather than a duplicate.",
  ],
  books: [
    "Seasonal charts for planning a night outside.",
    "A short observing log for notes and sketches.",
    "Pocket-sized for the pack.",
  ],
  flashlights: [
    "Red light preserves night vision.",
    "Low and high settings for charts and camp tasks.",
    "Clips to a pack strap for hands-free use.",
  ],
  travel: [
    "Sized for a day pack or carry-on.",
    "A light kit for quick trips to a dark site.",
    "Easy to set up without a permanent mount.",
  ],
};

function fieldNotes(product: Product): string[] {
  for (const category of product.categories) {
    if (FIELD_NOTES[category]) return FIELD_NOTES[category];
  }
  return FIELD_NOTES.accessories;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const related = relatedProducts(product).map(toProductCard);
  const label = categoryLabel(product.categories);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="border-b border-line/70">
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs text-ink-soft/60"
            >
              <Link href="/catalog" className="hover:text-forest">
                Catalog
              </Link>
              <span aria-hidden="true">/</span>
              <span className="truncate text-ink-soft">{product.name}</span>
            </nav>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16">
          <div>
            <ProductArtwork
              art={toProductCard(product).art}
              label={product.name}
              className="aspect-[4/3] w-full rounded-[1.75rem] border border-line/70 card-shadow"
            />
            <div className="mt-4 grid grid-cols-3 gap-3">
              {["Field-ready", "Catalog item", "Preview"].map((note) => (
                <div
                  key={note}
                  className="rounded-xl border border-line/70 bg-paper-deep/35 px-3 py-2.5 text-center"
                >
                  <p className="eyebrow text-[0.52rem] text-ink-soft/55">
                    {note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:pt-2">
            <p className="eyebrow text-ink-soft/60">{label}</p>
            <h1 className="display mt-3 text-4xl leading-tight text-ink sm:text-5xl">
              {product.name}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="display text-3xl text-forest">
                {formatPrice(product)}
              </span>
              <span className="rounded-full border border-line bg-paper-deep/50 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-soft">
                USD
              </span>
            </div>

            <p className="mt-6 text-base leading-7 text-ink-soft">
              {product.description}
            </p>

            <div className="mt-7 rounded-2xl border border-line/80 bg-paper-deep/35 p-5">
              <p className="eyebrow text-[0.55rem] text-ink-soft/55">
                In the field
              </p>
              <ul className="mt-3 space-y-2.5">
                {fieldNotes(product).map((note) => (
                  <li
                    key={note}
                    className="flex items-start gap-2.5 text-sm leading-6 text-ink-soft"
                  >
                    <CheckIcon />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/assistant"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-forest-deep"
              >
                Ask Argus about the catalog <ArrowIcon />
              </Link>
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-paper px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-moss/60"
              >
                Back to catalog
              </Link>
            </div>

            <p className="mt-4 text-xs leading-5 text-ink-soft/55">
              Preview catalog. Checkout and cart actions are not enabled in this
              build.
            </p>

            <dl className="mt-8 grid gap-3 border-t border-line/70 pt-6 text-xs sm:grid-cols-2">
              <div>
                <dt className="eyebrow text-[0.52rem] text-ink-soft/50">
                  Item ID
                </dt>
                <dd className="mt-1 font-mono text-ink-soft">{product.id}</dd>
              </div>
              <div>
                <dt className="eyebrow text-[0.52rem] text-ink-soft/50">
                  Categories
                </dt>
                <dd className="mt-1 text-ink-soft">
                  {product.categories.join(" · ")}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {related.length > 0 ? (
          <section className="border-t border-line/70 bg-paper-deep/35">
            <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="eyebrow text-ink-soft/55">Pairs well with</p>
                  <h2 className="display mt-2 text-3xl text-ink sm:text-4xl">
                    Build a kit around it.
                  </h2>
                </div>
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-forest-deep"
                >
                  Browse the catalog <ArrowIcon />
                </Link>
              </div>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((candidate) => (
                  <ProductCard key={candidate.id} product={candidate} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
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
