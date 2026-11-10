"use server";

import { redirect } from "next/navigation";

import {
  adminConfigured,
  clearAdminCookie,
  setAdminCookie,
  verifyPassword,
} from "@/lib/admin-auth";

export type LoginState = {
  error?: string;
};

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!adminConfigured()) {
    return {
      error:
        "The operations console is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.",
    };
  }

  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) {
    return { error: "That password did not match." };
  }

  await setAdminCookie();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await clearAdminCookie();
  redirect("/admin/login");
}
