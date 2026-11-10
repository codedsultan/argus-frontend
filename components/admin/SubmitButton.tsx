"use client";

import { useFormStatus } from "react-dom";

import { cx } from "@/lib/format";

export function SubmitButton({
  children,
  pendingLabel = "Working…",
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-3.5 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {pending ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
