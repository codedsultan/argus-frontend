import { previewTitle } from "./prompts";
import type { Conversation, ConversationMessage } from "./types";

export const CONVERSATIONS_KEY = "argus.conversations.v1";
export const MAX_CONVERSATIONS = 20;

function id(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createConversation(): Conversation {
  const now = Date.now();
  return {
    id: id(),
    title: "New conversation",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function createUserMessage(content: string): ConversationMessage {
  return {
    id: id(),
    role: "user",
    content,
    products: [],
    promotions: [],
    currencies: [],
    sources: [],
    createdAt: Date.now(),
    feedback: null,
  };
}

export function createAssistantMessage(
  message: Omit<ConversationMessage, "id" | "role" | "createdAt">,
): ConversationMessage {
  return {
    id: id(),
    role: "assistant",
    createdAt: Date.now(),
    ...message,
  };
}

export function titleForPrompt(prompt: string): string {
  return previewTitle(prompt);
}

export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Conversation => {
        if (!item || typeof item !== "object") return false;
        const record = item as Record<string, unknown>;
        return (
          typeof record.id === "string" &&
          typeof record.title === "string" &&
          Array.isArray(record.messages)
        );
      })
      .slice(0, MAX_CONVERSATIONS);
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      CONVERSATIONS_KEY,
      JSON.stringify(conversations.slice(0, MAX_CONVERSATIONS)),
    );
  } catch {
    // Storage can be unavailable in private mode. The in-memory session still works.
  }
}

export function clearConversations(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CONVERSATIONS_KEY);
  } catch {
    // Ignore storage errors.
  }
}
