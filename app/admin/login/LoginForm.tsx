"use client";

import { useActionState } from "react";

import { login, type LoginState } from "./actions";

const INITIAL_STATE: LoginState = {};

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState(login, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="password"
          className="block font-mono text-[0.62rem] uppercase tracking-[0.16em] text-slate-400"
        >
          Operations password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={!configured || pending}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter the operator password"
        />
      </div>

      {!configured ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs leading-5 text-amber-200">
          This console is not configured. Set{" "}
          <code className="font-mono text-amber-100">ADMIN_PASSWORD</code> and{" "}
          <code className="font-mono text-amber-100">ADMIN_SESSION_SECRET</code>{" "}
          in the frontend environment.
        </div>
      ) : null}

      {state.error ? (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-xs leading-5 text-rose-200"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!configured || pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
            Checking
          </>
        ) : (
          "Enter operations console"
        )}
      </button>

      <p className="text-center font-mono text-[0.58rem] uppercase tracking-[0.14em] text-slate-500">
        Session expires after 8 hours · HttpOnly cookie
      </p>
    </form>
  );
}
