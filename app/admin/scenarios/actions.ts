"use server";

import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin-auth";
import { runRecordedPrompt } from "@/lib/backend";
import { PREVIEW_PROMPTS } from "@/lib/prompts";

export async function runScenario(formData: FormData): Promise<void> {
  await requireAdmin();
  const scenarioId = String(formData.get("scenario") ?? "");
  const scenario = PREVIEW_PROMPTS.find((item) => item.id === scenarioId);

  if (!scenario) {
    redirect("/admin/scenarios?error=unknown-scenario");
  }

  const result = await runRecordedPrompt(scenario.prompt);

  if (!result) {
    redirect("/admin/scenarios?error=request-failed");
  }

  if (!result.traceId) {
    redirect("/admin/scenarios?error=no-trace");
  }

  redirect(`/admin/traces/${result.traceId}`);
}
