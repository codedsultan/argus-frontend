import { ArgusMark } from "@/components/ArgusMark";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-paper">
      <ArgusMark className="h-12 w-12 animate-pulse text-forest" />
      <p className="eyebrow text-[0.58rem] text-ink-soft/55">
        Reading the field guide
      </p>
    </div>
  );
}
