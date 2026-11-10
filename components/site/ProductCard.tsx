import Link from "next/link";

import type { ProductCard as ProductCardData } from "@/lib/types";
import { ProductArtwork } from "./ProductArtwork";

export function ProductCard({
  product,
  variant = "catalog",
}: {
  product: ProductCardData;
  variant?: "catalog" | "compact";
}) {
  if (variant === "compact") {
    return (
      <Link
        href={product.href}
        className="group flex items-center gap-3 rounded-2xl border border-line/80 bg-paper/80 p-2.5 transition-all hover:-translate-y-0.5 hover:border-moss/50 hover:bg-paper"
      >
        <ProductArtwork
          art={product.art}
          label={product.name}
          className="h-16 w-16 shrink-0 rounded-xl"
        />
        <span className="min-w-0 flex-1">
          <span className="eyebrow block text-[0.58rem] text-ink-soft/60">
            {product.categoryLabel}
          </span>
          <span className="mt-1 block truncate text-sm font-semibold text-ink group-hover:text-forest">
            {product.name}
          </span>
          <span className="mt-0.5 block text-xs text-ink-soft">
            {product.price}
          </span>
        </span>
        <span className="mr-1 text-ink-soft/50 transition-transform group-hover:translate-x-0.5 group-hover:text-forest">
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={product.href}
      className="group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-line/80 bg-paper/80 transition-all duration-300 hover:-translate-y-1 hover:border-moss/50 hover:shadow-[0_24px_60px_-36px_rgba(23,36,29,0.55)]"
    >
      <ProductArtwork
        art={product.art}
        label={product.name}
        className="aspect-[4/3] w-full"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="eyebrow text-[0.58rem] text-ink-soft/60">
            {product.categoryLabel}
          </span>
          <span className="font-mono text-xs text-ink-soft">
            {product.price}
          </span>
        </div>
        <h3 className="mt-3 text-lg font-semibold leading-snug text-ink group-hover:text-forest">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-soft">
          {product.description}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-forest">
          View details
          <svg
            aria-hidden="true"
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
