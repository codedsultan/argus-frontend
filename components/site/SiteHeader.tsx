"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ArgusMark } from "@/components/ArgusMark";
import { NAV_LINKS, SITE } from "@/lib/site";
import { cx } from "@/lib/format";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <ArgusMark className="h-9 w-9 text-forest transition-transform duration-300 group-hover:rotate-6" />
          <span className="leading-none">
            <span className="display block text-[1.15rem] font-semibold tracking-[0.16em] text-ink">
              ARGUS
            </span>
            <span className="eyebrow mt-1 block text-[0.58rem] text-ink-soft/70">
              Field Supply
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cx(
                "text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "text-forest"
                  : "text-ink-soft hover:text-forest",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/assistant"
            className="hidden items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-forest-deep sm:inline-flex"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
            Ask Argus
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink lg:hidden"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">Menu</span>
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-line/70 bg-paper px-5 pb-5 pt-3 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cx(
                  "border-b border-line/50 py-3 text-base font-medium",
                  isActive(link.href) ? "text-forest" : "text-ink-soft",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/assistant"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-paper"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              Ask Argus
            </Link>
            <p className="mt-4 text-xs text-ink-soft/70">
              {SITE.previewLabel} · no account required
            </p>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
