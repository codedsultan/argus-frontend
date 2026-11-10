import Link from "next/link";

import { AdminNav } from "@/components/admin/AdminNav";
import { Badge } from "@/components/admin/ui";
import { ArgusMark } from "@/components/ArgusMark";
import { logout } from "@/app/admin/login/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { getAgentHealth } from "@/lib/backend";

export async function ConsoleShell({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const health = await getAgentHealth();
  const mode = health?.mode ?? "unknown";
  const modeTone =
    mode === "replay" ? "info" : mode === "live" ? "good" : "warn";

  return (
    <div className="flex min-h-screen bg-[#070b0f]">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-[#080d12] lg:flex">
        <div className="px-5 py-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <ArgusMark className="h-8 w-8 text-emerald-300" />
            <span className="leading-none">
              <span className="block text-sm font-semibold tracking-[0.18em] text-slate-100">
                ARGUS
              </span>
              <span className="mt-1 block font-mono text-[0.52rem] uppercase tracking-[0.2em] text-slate-500">
                Operations
              </span>
            </span>
          </Link>
        </div>

        <div className="px-3">
          <AdminNav />
        </div>

        <div className="mt-7 px-5">
          <p className="font-mono text-[0.52rem] uppercase tracking-[0.18em] text-slate-600">
            Runtime
          </p>
          <dl className="mt-3 space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-slate-500">Mode</dt>
              <dd>
                <Badge tone={modeTone}>{mode}</Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-slate-500">Public profile</dt>
              <dd className="text-slate-300">
                {health ? (health.public_mode ? "yes" : "no") : "unknown"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-slate-500">Version</dt>
              <dd className="font-mono text-[0.62rem] text-slate-400">
                {health?.version ?? "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-auto border-t border-white/10 p-4">
          <Link
            href="/"
            className="flex items-center justify-between rounded-lg px-2 py-2 text-xs text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-slate-200"
          >
            Customer site <span aria-hidden="true">↗</span>
          </Link>
          <form action={logout} className="mt-1">
            <button
              type="submit"
              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-slate-200"
            >
              Sign out
              <span className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-slate-600">
                session
              </span>
            </button>
          </form>
          <p className="mt-3 px-2 font-mono text-[0.5rem] uppercase tracking-[0.16em] text-slate-600">
            Protected · noindex
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070b0f]/85 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <ArgusMark className="h-7 w-7 shrink-0 text-emerald-300 lg:hidden" />
              <div className="min-w-0">
                <p className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-slate-500">
                  Argus
                </p>
                <p className="truncate text-sm font-semibold text-slate-100">
                  Operations console
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge tone={modeTone}>{mode}</Badge>
              <Link
                href="/"
                className="hidden rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-white/20 hover:text-slate-200 sm:inline-flex"
              >
                Customer site
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-white/20 hover:text-slate-200"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
          <div className="border-t border-white/5 px-4 pb-2 pt-2 sm:px-6 lg:hidden">
            <AdminNav orientation="horizontal" />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
