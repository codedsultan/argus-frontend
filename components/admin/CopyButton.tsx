"use client";

import { useState } from "react";

export function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1_500);
        } catch {
          // Clipboard access can be denied. The value remains selectable.
        }
      }}
      className="rounded-md border border-white/10 px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-slate-400 transition-colors hover:border-white/20 hover:text-slate-200"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
