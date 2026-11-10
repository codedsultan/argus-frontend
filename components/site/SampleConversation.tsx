import { ArgusMark } from "@/components/ArgusMark";
import { PRODUCTS_BY_ID, toProductCard } from "@/lib/catalog";
import { ProductArtwork } from "./ProductArtwork";

export function SampleConversation() {
  const product = PRODUCTS_BY_ID.get("2ZYFJ3GM2N");
  const card = product ? toProductCard(product) : null;

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-forest/5 blur-3xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-line/80 bg-paper shadow-[0_40px_100px_-50px_rgba(23,36,29,0.6)]">
        <div className="flex items-center justify-between border-b border-line/70 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <ArgusMark className="h-7 w-7 text-forest" />
            <div className="leading-tight">
              <p className="text-xs font-semibold tracking-wide text-ink">
                Argus assistant
              </p>
              <p className="text-[0.62rem] text-ink-soft/60">
                Field catalog · grounded answers
              </p>
            </div>
          </div>
          <span className="rounded-full border border-amber/30 bg-amber/10 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-amber">
            Preview
          </span>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="ml-auto max-w-[86%] rounded-2xl rounded-br-sm bg-forest px-4 py-3 text-sm leading-6 text-paper">
            What current promotions are available on binoculars?
          </div>

          <div className="flex gap-3">
            <ArgusMark className="mt-0.5 h-7 w-7 shrink-0 text-forest" />
            <div className="min-w-0 space-y-3">
              <p className="text-sm leading-6 text-ink">
                The Ridgeview 8x42 binoculars are 50% off this week. It is a
                balanced low-light binocular with a wide field of view and a
                close focus that works for birds, ridgelines, and the night
                sky.
              </p>

              <div className="rounded-xl border border-amber/30 bg-amber/10 p-3">
                <p className="eyebrow text-[0.55rem] text-amber">
                  Current offer
                </p>
                <p className="mt-1 text-sm font-medium leading-5 text-ink">
                  Ridgeview 8x42 binoculars are 50% off this week.
                </p>
              </div>

              {card ? (
                <div className="flex items-center gap-3 rounded-xl border border-line/80 bg-paper-deep/40 p-2.5">
                  <ProductArtwork
                    art={card.art}
                    label={card.name}
                    className="h-14 w-14 shrink-0 rounded-lg"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-ink">
                      {card.name}
                    </p>
                    <p className="mt-0.5 text-[0.68rem] text-ink-soft">
                      {card.price} · {card.categoryLabel}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center gap-1.5 text-[0.62rem] text-ink-soft/65">
                <svg
                  aria-hidden="true"
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Checked catalog · promotions
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-line/70 p-3">
          <div className="flex items-center justify-between rounded-full border border-line bg-paper-deep/40 px-4 py-2.5 text-xs text-ink-soft/55">
            <span>Ask about the field catalog…</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-paper">
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
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-line bg-paper px-4 py-3 shadow-[0_18px_40px_-24px_rgba(23,36,29,0.5)] sm:block">
        <p className="eyebrow text-[0.55rem] text-ink-soft/60">Grounded in</p>
        <p className="mt-1 text-sm font-semibold text-forest">
          10 field-tested products
        </p>
      </div>
    </div>
  );
}
