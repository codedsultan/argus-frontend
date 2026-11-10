"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cx } from "@/lib/format";

const LINKS = [
  {
    href: "/admin",
    label: "Overview",
    matches: (pathname: string) =>
      pathname === "/admin" || pathname.startsWith("/admin/traces"),
  },
  {
    href: "/admin/scenarios",
    label: "Scenarios",
    matches: (pathname: string) => pathname.startsWith("/admin/scenarios"),
  },
] as const;

export function AdminNav({
  orientation = "vertical",
}: {
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();
  const horizontal = orientation === "horizontal";

  return (
    <nav
      aria-label="Operations"
      className={horizontal ? "flex gap-1 overflow-x-auto pb-1" : "space-y-1"}
    >
      {LINKS.map((link) => {
        const active = link.matches(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cx(
              "group flex items-center gap-2.5 rounded-lg font-medium transition-colors",
              horizontal
                ? "shrink-0 px-2.5 py-1.5 text-xs"
                : "px-3 py-2 text-sm",
              active
                ? "bg-emerald-400/10 text-emerald-200"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
            )}
          >
            <span
              className={cx(
                "h-1.5 w-1.5 rounded-full",
                active
                  ? "bg-emerald-400"
                  : "bg-slate-600 group-hover:bg-slate-400",
              )}
            />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
