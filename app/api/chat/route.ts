import { NextResponse } from "next/server";

import { normalizeAgentResponse } from "@/lib/chat";
import { isPreviewPrompt } from "@/lib/prompts";
import type { AgentPromptResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const AGENT_URL = (process.env.AGENT_URL ?? "http://localhost:8012").replace(
  /\/$/,
  "",
);
const BFF_TOKEN = process.env.ARGUS_BFF_TOKEN?.trim() ?? "";
const MAX_MESSAGE_LENGTH = 500;

type ChatBody = {
  message?: unknown;
  history?: unknown;
};

function errorResponse(
  status: number,
  error: string,
  message: string,
  headers?: Record<string, string>,
) {
  return NextResponse.json(
    { error, message },
    {
      status,
      headers: {
        "cache-control": "no-store",
        ...(headers ?? {}),
      },
    },
  );
}

export async function POST(request: Request) {
  let body: ChatBody;

  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return errorResponse(
      400,
      "invalid-json",
      "The request could not be read. Please try again.",
    );
  }

  if (typeof body.message !== "string" || !body.message.trim()) {
    return errorResponse(
      400,
      "invalid-message",
      "Enter a question to send to Argus.",
    );
  }

  if (body.message.length > MAX_MESSAGE_LENGTH) {
    return errorResponse(
      413,
      "message-too-long",
      "That message is too long for this preview. Try a shorter question.",
    );
  }

  if (Array.isArray(body.history) && body.history.length > 0) {
    return errorResponse(
      400,
      "preview-only",
      "This preview answers one recorded question per conversation. Start a new conversation to ask another.",
    );
  }

  const message = body.message.trim();
  if (!isPreviewPrompt(message)) {
    return errorResponse(
      400,
      "preview-only",
      "This curated preview answers three recorded questions. Pick one of the suggestions or start a new conversation.",
    );
  }

  const forwardedFor =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "";

  let upstream: Response;
  try {
    upstream = await fetch(`${AGENT_URL}/prompt`, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        ...(BFF_TOKEN ? { authorization: `Bearer ${BFF_TOKEN}` } : {}),
        ...(forwardedFor ? { "x-forwarded-for": forwardedFor } : {}),
      },
      body: JSON.stringify({ message, history: [] }),
    });
  } catch {
    return errorResponse(
      503,
      "unavailable",
      "Argus is temporarily unavailable. Please try again in a moment.",
    );
  }

  if (upstream.status === 401) {
    console.error("argus bff: upstream rejected the BFF token");
    return errorResponse(
      503,
      "configuration",
      "Argus is not configured to accept requests right now.",
    );
  }

  if (upstream.status === 429) {
    const retryAfter = upstream.headers.get("retry-after") ?? "30";
    return errorResponse(
      429,
      "rate-limited",
      "Argus is receiving a lot of preview requests. Please try again in a moment.",
      { "retry-after": retryAfter },
    );
  }

  if (upstream.status === 413) {
    return errorResponse(
      413,
      "message-too-long",
      "That request is too large for this preview.",
    );
  }

  if (upstream.status === 400) {
    const payload = (await upstream.json().catch(() => null)) as {
      error?: string;
    } | null;
    if (payload?.error === "replay-only") {
      return errorResponse(
        400,
        "preview-only",
        "This preview answers three recorded questions. Pick one of the suggestions or start a new conversation.",
      );
    }
    return errorResponse(
      400,
      "invalid-request",
      "That question cannot be answered in this preview.",
    );
  }

  if (!upstream.ok) {
    return errorResponse(
      503,
      "unavailable",
      "Argus is temporarily unavailable. Please try again in a moment.",
    );
  }

  let payload: AgentPromptResponse;
  try {
    payload = (await upstream.json()) as AgentPromptResponse;
  } catch {
    return errorResponse(
      502,
      "bad-response",
      "Argus returned an answer that could not be read. Please try again.",
    );
  }

  if (!payload.response?.messages?.length) {
    return errorResponse(
      502,
      "empty-response",
      "Argus did not return an answer. Please try again.",
    );
  }

  return NextResponse.json(normalizeAgentResponse(payload), {
    headers: {
      "cache-control": "no-store",
    },
  });
}
