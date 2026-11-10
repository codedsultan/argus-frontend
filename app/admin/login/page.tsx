import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArgusMark } from "@/components/ArgusMark";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Operations login",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) {
    redirect("/admin");
  }

  const configured = adminConfigured();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b0f] px-5 py-12">
      <div className="pointer-events-none absolute inset-0 admin-grid opacity-40" />
      <div className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b1117]/90 shadow-2xl backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border-b border-white/10 p-8 sm:p-10 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <ArgusMark className="h-10 w-10 text-emerald-300" />
            <div className="leading-none">
              <p className="text-sm font-semibold tracking-[0.18em] text-slate-100">
                ARGUS
              </p>
              <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-slate-500">
                Operations
              </p>
            </div>
          </div>

          <p className="mt-10 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-emerald-300/80">
            Protected surface
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            The operator view.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
            Runtime status, recent traces, tool activity, and the recorded
            scenario runner live here. The customer workspace never sees this
            surface.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              Trace inspection with timing, services, and token counts.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              Hardening controls and public-edge configuration.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              Server-side scenario runs against the replay boundary.
            </li>
          </ul>

          <Link
            href="/"
            className="mt-10 inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-slate-500 transition-colors hover:text-slate-300"
          >
            ← Back to the customer site
          </Link>
        </div>

        <div className="p-8 sm:p-10">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-slate-500">
            Sign in
          </p>
          <h2 className="mt-3 text-xl font-semibold text-slate-100">
            Operations console
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Enter the operator password to continue. This console is separate
            from the customer assistant.
          </p>

          <div className="mt-7">
            <LoginForm configured={configured} />
          </div>

          <div className="mt-7 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-slate-500">
              Configuration
            </p>
            <p className="mt-1.5 text-xs leading-5 text-slate-400">
              The console requires{" "}
              <code className="font-mono text-slate-300">ADMIN_PASSWORD</code>{" "}
              and{" "}
              <code className="font-mono text-slate-300">
                ADMIN_SESSION_SECRET
              </code>
              . The session is signed with HMAC-SHA256 and stored in an HttpOnly
              cookie.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
