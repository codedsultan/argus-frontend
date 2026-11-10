import Link from "next/link";

import { ArgusMark } from "@/components/ArgusMark";
import { ProductCard } from "@/components/site/ProductCard";
import { SampleConversation } from "@/components/site/SampleConversation";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { PRODUCTS_BY_ID, toProductCard } from "@/lib/catalog";
import { PREVIEW_PROMPTS } from "@/lib/prompts";

const featuredIds = [
  "2ZYFJ3GM2N",
  "66VCHSJNUP",
  "1YMWWN1N4O",
  "HQTGWGPNH4",
];

const steps = [
  {
    number: "01",
    title: "Ask in plain language",
    detail:
      "Start with the decision in front of you: a first telescope, a lighter pack, or a better pair of binoculars.",
  },
  {
    number: "02",
    title: "Argus checks the catalog",
    detail:
      "Before it answers, Argus looks up products, prices, categories, currencies, and current offers in the field catalog.",
  },
  {
    number: "03",
    title: "Get a grounded answer",
    detail:
      "You get a concise recommendation with the products and offers that support it. No open tabs, no guesswork.",
  },
];

const principles = [
  {
    title: "Answers with receipts",
    detail:
      "Every answer is tied to the catalog, so prices and offers are checked instead of remembered.",
  },
  {
    title: "A quiet workspace",
    detail:
      "The assistant keeps the conversation, the products, and the next step together. Operator telemetry stays in the operations console.",
  },
  {
    title: "A human off-ramp",
    detail:
      "When a question needs a person, the handoff is one click away. No dead ends, no fake escalation.",
  },
];

export default function Home() {
  const featured = featuredIds
    .map((id) => PRODUCTS_BY_ID.get(id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product))
    .map(toProductCard);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 paper-noise" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] field-grid opacity-60" />
          <div className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-24">
            <div className="animate-rise">
              <p className="eyebrow flex items-center gap-2 text-ink-soft/70">
                <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                Argus Field Supply · AI field guide
              </p>
              <h1 className="display mt-6 max-w-2xl text-[3.4rem] leading-[0.95] text-ink sm:text-[4.4rem] lg:text-[5.2rem]">
                Know the field
                <span className="block italic text-forest">before you go.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-ink-soft sm:text-lg">
                Ask about optics, field essentials, and current offers. Argus
                checks the catalog before it answers, so you can spend less
                time comparing tabs and more time outside.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/assistant"
                  className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-forest-deep"
                >
                  Ask Argus
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
                </Link>
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-paper/70 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-moss/60 hover:bg-paper"
                >
                  Browse the catalog
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-soft/75">
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon /> Catalog-grounded
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon /> No account required
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon /> Curated preview
                </span>
              </div>
            </div>

            <div className="animate-fade lg:pl-4">
              <SampleConversation />
            </div>
          </div>
        </section>

        <section className="border-y border-line/70 bg-paper-deep/45">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-5 sm:px-8 lg:grid-cols-4">
            {[
              ["10", "field-tested products"],
              ["6", "catalog categories"],
              ["3", "curated scenarios"],
              ["0", "accounts required"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="border-line/60 px-2 py-7 text-center lg:border-l lg:first:border-l-0"
              >
                <p className="display text-3xl text-forest sm:text-4xl">
                  {value}
                </p>
                <p className="mt-1 text-xs text-ink-soft/75">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-24 border-b border-line/70"
        >
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <p className="eyebrow text-ink-soft/60">How Argus works</p>
                <h2 className="display mt-4 text-4xl leading-tight text-ink sm:text-5xl">
                  A field guide that checks the shelf.
                </h2>
                <p className="mt-5 max-w-md text-sm leading-7 text-ink-soft">
                  Argus is not a search box with a personality. It is a small
                  agent that reads the catalog, checks the details, and then
                  writes the answer.
                </p>
                <div className="mt-8 rounded-2xl border border-line/80 bg-paper-deep/40 p-5">
                  <p className="eyebrow text-[0.58rem] text-ink-soft/60">
                    This preview
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">
                    The public preview answers three recorded scenarios. Start
                    a new conversation between questions to keep the transcript
                    clean.
                  </p>
                  <div className="mt-4 space-y-2">
                    {PREVIEW_PROMPTS.map((prompt) => (
                      <Link
                        key={prompt.id}
                        href="/assistant"
                        className="flex items-center justify-between gap-3 rounded-xl border border-line/70 bg-paper px-3 py-2.5 text-xs font-medium text-ink transition-colors hover:border-moss/60 hover:text-forest"
                      >
                        <span>{prompt.title}</span>
                        <ArrowIcon />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className="group grid gap-4 rounded-[1.35rem] border border-line/80 bg-paper/70 p-6 transition-colors hover:border-moss/50 sm:grid-cols-[auto_1fr] sm:p-7"
                  >
                    <span className="display text-3xl text-amber/80">
                      {step.number}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-ink">
                        {step.title}
                      </h3>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-line/70">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-ink-soft/60">The field catalog</p>
                <h2 className="display mt-4 max-w-2xl text-4xl leading-tight text-ink sm:text-5xl">
                  Gear for the trail, the ridge, and the night sky.
                </h2>
              </div>
              <Link
                href="/catalog"
                className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-forest hover:text-forest-deep"
              >
                Browse all 10 products <ArrowIcon />
              </Link>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line/70 bg-forest text-paper">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-28">
            <div>
              <p className="eyebrow text-paper/50">Built for the field</p>
              <h2 className="display mt-4 text-4xl leading-tight text-paper sm:text-5xl">
                The answer is the product. The machinery stays out of the way.
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-paper/70">
                Argus is designed like a good field tool: quiet, legible, and
                focused on the decision. The trace, tool calls, and runtime
                controls live in a separate operations console for the people
                who run the service.
              </p>
              <Link
                href="/assistant"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-amber-soft"
              >
                Open the assistant <ArrowIcon />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {principles.map((principle) => (
                <div
                  key={principle.title}
                  className="rounded-2xl border border-paper/10 bg-paper/[0.04] p-5"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-amber/30 bg-amber/10 text-amber">
                    <ArgusMark className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="mt-5 text-sm font-semibold text-paper">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-paper/65">
                    {principle.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 paper-noise" />
          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
            <div className="grid gap-8 rounded-[2rem] border border-line/80 bg-paper-deep/50 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="eyebrow text-ink-soft/60">Pack smarter</p>
                <h2 className="display mt-3 max-w-2xl text-4xl leading-tight text-ink sm:text-5xl">
                  Bring a better question to the trailhead.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-ink-soft">
                  Ask Argus about the catalog, compare a few options, or check
                  the current offers before you commit.
                </p>
              </div>
              <Link
                href="/assistant"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-7 py-4 text-sm font-semibold text-paper transition-colors hover:bg-forest-deep"
              >
                Ask Argus <ArrowIcon />
              </Link>
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
      className="h-3.5 w-3.5 text-moss"
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
