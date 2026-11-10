"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import { ArgusMark } from "@/components/ArgusMark";
import { ProductCard } from "@/components/site/ProductCard";
import { CATALOG_CATEGORIES } from "@/lib/catalog";
import {
  clearConversations,
  createAssistantMessage,
  createConversation,
  createUserMessage,
  loadConversations,
  saveConversations,
  titleForPrompt,
} from "@/lib/conversations";
import { cx, formatRelativeTime } from "@/lib/format";
import { PREVIEW_PROMPTS, isPreviewPrompt } from "@/lib/prompts";
import { SITE } from "@/lib/site";
import type {
  ChatErrorPayload,
  ChatResponse,
  Conversation,
  ConversationMessage,
} from "@/lib/types";

const MAX_MESSAGE_LENGTH = 500;

export function AssistantApp() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const active = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) ?? null,
    [conversations, activeId],
  );
  const hasMessages = Boolean(active && active.messages.length > 0);

  useEffect(() => {
    const stored = loadConversations();
    setConversations(stored);
    setActiveId(stored[0]?.id ?? null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveConversations(conversations);
  }, [conversations, hydrated]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, pending]);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "0px";
    element.style.height = `${Math.min(element.scrollHeight, 160)}px`;
  }, [input]);

  useEffect(() => {
    if (!hydrated) return;
    if (active && active.messages.length === 0) {
      textareaRef.current?.focus();
    }
  }, [hydrated, activeId, active]);

  const startNewConversation = useCallback(() => {
    setSidebarOpen(false);
    setError(null);
    if (active && active.messages.length === 0) {
      textareaRef.current?.focus();
      return;
    }
    const conversation = createConversation();
    setConversations((previous) => [conversation, ...previous].slice(0, 20));
    setActiveId(conversation.id);
    setInput("");
    window.setTimeout(() => textareaRef.current?.focus(), 40);
  }, [active]);

  const deleteConversation = useCallback(
    (id: string, event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const next = conversations.filter((conversation) => conversation.id !== id);
      setConversations(next);
      if (activeId === id) {
        setActiveId(next[0]?.id ?? null);
      }
    },
    [activeId, conversations],
  );

  const clearHistory = useCallback(() => {
    if (!window.confirm("Clear all local conversations? This cannot be undone.")) {
      return;
    }
    clearConversations();
    setConversations([]);
    setActiveId(null);
    setInput("");
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (rawMessage: string, options?: { forceNew?: boolean }) => {
      if (pending) return;
      const message = rawMessage.trim();
      if (!message) return;

      if (!isPreviewPrompt(message)) {
        setError(
          "This curated preview answers three recorded questions. Pick one of the suggestions or start a new conversation.",
        );
        return;
      }

      if (!options?.forceNew && active && active.messages.length > 0) {
        setError(
          "This preview answers one question per conversation. Start a new conversation to ask another.",
        );
        return;
      }

      const shouldCreate =
        !active ||
        active.messages.length > 0 ||
        (options?.forceNew && active.messages.length > 0);
      const base = shouldCreate ? createConversation() : active;
      const userMessage = createUserMessage(message);
      const updated: Conversation = {
        ...base,
        title: titleForPrompt(message),
        updatedAt: Date.now(),
        messages: [...base.messages, userMessage],
      };

      setConversations((previous) => {
        const exists = previous.some(
          (conversation) => conversation.id === base.id,
        );
        const rest = exists
          ? previous.filter((conversation) => conversation.id !== base.id)
          : previous;
        return [updated, ...rest].slice(0, 20);
      });
      setActiveId(base.id);
      setInput("");
      setError(null);
      setPending(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message }),
        });
        const payload = (await response.json().catch(() => null)) as
          | ChatResponse
          | ChatErrorPayload
          | null;

        if (response.ok && payload && "answer" in payload) {
          const assistantMessage = createAssistantMessage({
            content: payload.answer,
            products: payload.products ?? [],
            promotions: payload.promotions ?? [],
            currencies: payload.currencies ?? [],
            sources: payload.sources ?? [],
            feedback: null,
          });
          setConversations((previous) =>
            previous.map((conversation) =>
              conversation.id === base.id
                ? {
                    ...conversation,
                    updatedAt: Date.now(),
                    messages: [...conversation.messages, assistantMessage],
                  }
                : conversation,
            ),
          );
          return;
        }

        const detail =
          payload && "message" in payload && payload.message
            ? payload.message
            : "Argus could not answer that question. Please try again.";
        const errorMessage = createAssistantMessage({
          content: detail,
          products: [],
          promotions: [],
          currencies: [],
          sources: [],
          feedback: null,
          isError: true,
        });
        setConversations((previous) =>
          previous.map((conversation) =>
            conversation.id === base.id
              ? {
                  ...conversation,
                  updatedAt: Date.now(),
                  messages: [...conversation.messages, errorMessage],
                }
              : conversation,
          ),
        );
      } catch {
        const errorMessage = createAssistantMessage({
          content:
            "Argus is temporarily unavailable. Please try again in a moment.",
          products: [],
          promotions: [],
          currencies: [],
          sources: [],
          feedback: null,
          isError: true,
        });
        setConversations((previous) =>
          previous.map((conversation) =>
            conversation.id === base.id
              ? {
                  ...conversation,
                  updatedAt: Date.now(),
                  messages: [...conversation.messages, errorMessage],
                }
              : conversation,
          ),
        );
      } finally {
        setPending(false);
      }
    },
    [active, pending],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  const handleSuggestion = (prompt: string) => {
    void sendMessage(prompt, { forceNew: true });
  };

  const copyMessage = async (message: ConversationMessage) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);
      window.setTimeout(() => setCopiedId(null), 1_500);
    } catch {
      // Clipboard access can be denied. The answer is still selectable.
    }
  };

  const setFeedback = (messageId: string, value: "up" | "down") => {
    if (!active) return;
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === active.id
          ? {
              ...conversation,
              messages: conversation.messages.map((message) =>
                message.id === messageId
                  ? {
                      ...message,
                      feedback: message.feedback === value ? null : value,
                    }
                  : message,
              ),
            }
          : conversation,
      ),
    );
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-paper">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close conversations"
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-50 flex w-[19rem] shrink-0 flex-col bg-forest text-paper transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <ArgusMark className="h-8 w-8 text-amber" />
            <span className="leading-none">
              <span className="display block text-[0.98rem] font-semibold tracking-[0.18em] text-paper">
                ARGUS
              </span>
              <span className="eyebrow mt-1 block text-[0.52rem] text-paper/45">
                Field Supply
              </span>
            </span>
          </Link>
          <button
            type="button"
            aria-label="Close conversations"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-paper/15 text-paper/70 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="px-4">
          <button
            type="button"
            onClick={startNewConversation}
            className="flex w-full items-center justify-between gap-3 rounded-xl bg-amber px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-amber-soft"
          >
            New conversation
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        <div className="mt-7 flex-1 overflow-y-auto px-3 admin-scroll">
          <p className="eyebrow px-2 text-[0.55rem] text-paper/35">History</p>
          {conversations.length === 0 ? (
            <p className="mt-3 px-2 text-xs leading-5 text-paper/45">
              Your conversations will appear here. They stay in this browser.
            </p>
          ) : (
            <ul className="mt-3 space-y-1">
              {conversations.map((conversation) => (
                <li key={conversation.id}>
                  <div
                    className={cx(
                      "group flex w-full items-start gap-2 rounded-xl px-2.5 py-2.5 transition-colors",
                      conversation.id === activeId
                        ? "bg-paper/10"
                        : "hover:bg-paper/[0.06]",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveId(conversation.id);
                        setSidebarOpen(false);
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span
                        className={cx(
                          "block truncate text-xs font-medium",
                          conversation.id === activeId
                            ? "text-paper"
                            : "text-paper/75",
                        )}
                      >
                        {conversation.title}
                      </span>
                      <span className="mt-1 block text-[0.6rem] text-paper/35">
                        {formatRelativeTime(conversation.updatedAt)}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${conversation.title}`}
                      onClick={(event) =>
                        deleteConversation(conversation.id, event)
                      }
                      className="mt-0.5 hidden h-6 w-6 shrink-0 items-center justify-center rounded-md text-paper/35 hover:bg-paper/10 hover:text-paper group-hover:flex"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      >
                        <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-1 border-t border-paper/10 p-4">
          <Link
            href="/catalog"
            className="flex items-center justify-between rounded-lg px-2 py-2 text-xs text-paper/60 transition-colors hover:bg-paper/[0.06] hover:text-paper"
          >
            Browse the catalog <ArrowIcon />
          </Link>
          <Link
            href="/#how-it-works"
            className="flex items-center justify-between rounded-lg px-2 py-2 text-xs text-paper/60 transition-colors hover:bg-paper/[0.06] hover:text-paper"
          >
            How Argus works <ArrowIcon />
          </Link>
          <Link
            href="/privacy"
            className="flex items-center justify-between rounded-lg px-2 py-2 text-xs text-paper/60 transition-colors hover:bg-paper/[0.06] hover:text-paper"
          >
            Privacy <ArrowIcon />
          </Link>
          <button
            type="button"
            onClick={clearHistory}
            className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs text-paper/45 transition-colors hover:bg-paper/[0.06] hover:text-paper/75"
          >
            Clear local history
            <span className="font-mono text-[0.55rem] uppercase tracking-wider">
              reset
            </span>
          </button>
          <p className="px-2 pt-2 text-[0.58rem] leading-4 text-paper/30">
            {SITE.previewLabel} · conversations stay in this browser.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-line/70 bg-paper/85 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open conversations"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <div className="min-w-0">
              <p className="eyebrow text-[0.52rem] text-ink-soft/55">
                Argus assistant
              </p>
              <h1 className="truncate text-sm font-semibold text-ink">
                {active?.title ?? "New conversation"}
              </h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden rounded-full border border-amber/30 bg-amber/10 px-2.5 py-1 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-amber sm:inline">
              Preview
            </span>
            <Link
              href="/catalog"
              className="hidden rounded-full border border-line px-3 py-2 text-xs font-semibold text-ink-soft transition-colors hover:border-moss/60 hover:text-forest sm:inline-flex"
            >
              Catalog
            </Link>
            <button
              type="button"
              onClick={startNewConversation}
              className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3.5 py-2 text-xs font-semibold text-paper transition-colors hover:bg-forest-deep"
            >
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="hidden sm:inline">New chat</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <main className="flex min-w-0 flex-1 flex-col">
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              {!active || active.messages.length === 0 ? (
                <EmptyState onSuggestion={handleSuggestion} />
              ) : (
                <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 sm:py-9">
                  <div className="space-y-7">
                    {active.messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        copied={copiedId === message.id}
                        onCopy={() => void copyMessage(message)}
                        onFeedback={(value) => setFeedback(message.id, value)}
                        onNewConversation={startNewConversation}
                      />
                    ))}
                    {pending ? <PendingMessage /> : null}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-line/70 bg-paper/90 px-4 py-4 sm:px-6">
              <div className="mx-auto max-w-3xl">
                {hasMessages ? (
                  <div className="mb-3 flex flex-col gap-2 rounded-xl border border-amber/30 bg-amber/10 px-3.5 py-3 text-xs text-ink sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      This preview answers one question per conversation.
                    </span>
                    <button
                      type="button"
                      onClick={startNewConversation}
                      className="shrink-0 font-semibold text-forest underline decoration-forest/30 underline-offset-4 hover:text-forest-deep"
                    >
                      Start a new conversation
                    </button>
                  </div>
                ) : null}

                <form
                  onSubmit={handleSubmit}
                  className="flex items-end gap-2 rounded-2xl border border-line bg-paper p-2 shadow-[0_18px_40px_-32px_rgba(23,36,29,0.55)] transition-colors focus-within:border-moss/60"
                >
                  <textarea
                    ref={textareaRef}
                    value={input}
                    rows={1}
                    maxLength={MAX_MESSAGE_LENGTH}
                    disabled={pending || hasMessages}
                    onChange={(event) => {
                      setInput(event.target.value);
                      if (error) setError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      hasMessages
                        ? "Start a new conversation to ask another question."
                        : "Ask about the field catalog…"
                    }
                    className="max-h-40 min-h-[2.75rem] flex-1 resize-none bg-transparent px-2.5 py-2 text-sm leading-6 text-ink outline-none placeholder:text-ink-soft/45 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={pending || hasMessages || !input.trim()}
                    aria-label="Send message"
                    className="mb-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest text-paper transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    {pending ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
                    ) : (
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                    )}
                  </button>
                </form>

                <div className="mt-2 flex items-center justify-between gap-3 px-1 text-[0.62rem] text-ink-soft/55">
                  <span>Enter to send · Shift + Enter for a new line</span>
                  <span className="hidden sm:inline">
                    Grounded in the field catalog
                  </span>
                </div>
                {error ? (
                  <p className="mt-2 px-1 text-xs leading-5 text-clay">
                    {error}
                  </p>
                ) : null}
              </div>
            </div>
          </main>

          <aside className="hidden w-72 shrink-0 border-l border-line/70 bg-paper-deep/30 xl:block">
            <div className="space-y-6 p-5">
              <div>
                <p className="eyebrow text-[0.55rem] text-ink-soft/55">
                  Field notes
                </p>
                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  Argus checks the catalog before it answers. Product details,
                  prices, and offers come from the field supply.
                </p>
              </div>

              <div>
                <p className="eyebrow text-[0.55rem] text-ink-soft/55">
                  Catalog
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {CATALOG_CATEGORIES.slice(1, 6).map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/catalog?category=${category.id}`}
                        className="flex items-center justify-between text-ink-soft transition-colors hover:text-forest"
                      >
                        {category.label} <ArrowIcon />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="eyebrow text-[0.55rem] text-ink-soft/55">
                  How it works
                </p>
                <ol className="mt-3 space-y-2 text-xs leading-5 text-ink-soft">
                  <li>01 · Ask a question in plain language.</li>
                  <li>02 · Argus checks the catalog.</li>
                  <li>03 · Get a grounded answer.</li>
                </ol>
              </div>

              <div className="rounded-2xl border border-line/80 bg-paper p-4">
                <p className="text-sm font-semibold text-ink">Need a person?</p>
                <p className="mt-1 text-xs leading-5 text-ink-soft">
                  For an order or a fit question, reach the field desk.
                </p>
                <a
                  href={`mailto:${SITE.supportEmail}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-deep"
                >
                  Contact the field desk <ArrowIcon />
                </a>
              </div>

              <p className="text-[0.62rem] leading-5 text-ink-soft/50">
                {SITE.previewLabel} · answers are limited to three curated
                scenarios.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onSuggestion }: { onSuggestion: (prompt: string) => void }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-5 py-12 text-center sm:py-16">
      <ArgusMark className="h-12 w-12 text-forest" />
      <p className="eyebrow mt-5 text-[0.55rem] text-ink-soft/55">
        Argus assistant
      </p>
      <h2 className="display mt-3 text-4xl leading-tight text-ink sm:text-5xl">
        What are you outfitting?
      </h2>
      <p className="mt-3 max-w-lg text-sm leading-6 text-ink-soft">
        Ask about the catalog, currencies, or current offers. Argus checks the
        store before it answers.
      </p>

      <div className="mt-8 grid w-full gap-3 sm:grid-cols-3">
        {PREVIEW_PROMPTS.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            onClick={() => onSuggestion(prompt.prompt)}
            className="group flex flex-col rounded-2xl border border-line/80 bg-paper/70 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-moss/60 hover:bg-paper hover:shadow-[0_18px_40px_-30px_rgba(23,36,29,0.5)]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-paper-deep/60 text-forest">
              <SuggestionIcon id={prompt.id} />
            </span>
            <span className="mt-3 text-sm font-semibold text-ink group-hover:text-forest">
              {prompt.title}
            </span>
            <span className="mt-1 text-xs leading-5 text-ink-soft">
              {prompt.description}
            </span>
            <span className="mt-3 inline-flex items-center gap-1 text-[0.62rem] font-semibold text-forest">
              Try this <ArrowIcon />
            </span>
          </button>
        ))}
      </div>

      <p className="mt-6 text-[0.65rem] text-ink-soft/55">
        Curated preview · three scenarios · no account required
      </p>
    </div>
  );
}

function ChatMessage({
  message,
  copied,
  onCopy,
  onFeedback,
  onNewConversation,
}: {
  message: ConversationMessage;
  copied: boolean;
  onCopy: () => void;
  onFeedback: (value: "up" | "down") => void;
  onNewConversation: () => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[86%] rounded-2xl rounded-br-sm bg-forest px-4 py-3 text-sm leading-6 text-paper">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <ArgusMark className="mt-0.5 h-7 w-7 shrink-0 text-forest" />
      <div className="min-w-0 flex-1">
        {message.isError ? (
          <div className="rounded-2xl border border-clay/25 bg-clay/[0.06] p-4">
            <p className="text-sm leading-6 text-ink">{message.content}</p>
            <button
              type="button"
              onClick={onNewConversation}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-forest px-3.5 py-2 text-xs font-semibold text-paper hover:bg-forest-deep"
            >
              Start a new conversation <ArrowIcon />
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-2xl rounded-tl-sm border border-line/70 bg-paper px-4 py-3.5">
              <p className="whitespace-pre-line text-sm leading-6 text-ink">
                {message.content}
              </p>
            </div>

            {message.promotions.length > 0 ? (
              <div className="mt-3 space-y-2">
                {message.promotions.map((promotion) => (
                  <div
                    key={`${promotion.text}-${promotion.redirectUrl}`}
                    className="rounded-xl border border-amber/30 bg-amber/10 p-3"
                  >
                    <p className="eyebrow text-[0.52rem] text-amber">
                      Current offer
                    </p>
                    <p className="mt-1 text-sm leading-5 text-ink">
                      {promotion.text}
                    </p>
                    {promotion.productHref ? (
                      <Link
                        href={promotion.productHref}
                        className="mt-2 inline-flex items-center gap-1 text-[0.65rem] font-semibold text-forest hover:text-forest-deep"
                      >
                        View {promotion.productName} <ArrowIcon />
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {message.products.length > 0 ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {message.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="compact"
                  />
                ))}
              </div>
            ) : null}

            {message.currencies.length > 0 ? (
              <div className="mt-3">
                <p className="eyebrow text-[0.52rem] text-ink-soft/55">
                  Supported currencies
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {message.currencies.slice(0, 12).map((currency) => (
                    <span
                      key={currency}
                      className="rounded-full border border-line bg-paper-deep/50 px-2.5 py-1 font-mono text-[0.62rem] text-ink-soft"
                    >
                      {currency}
                    </span>
                  ))}
                  {message.currencies.length > 12 ? (
                    <span className="rounded-full border border-line bg-paper-deep/50 px-2.5 py-1 font-mono text-[0.62rem] text-ink-soft">
                      +{message.currencies.length - 12} more
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              {message.sources.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-[0.62rem] text-ink-soft/60">
                  <CheckIcon /> Checked {message.sources.join(" · ")}
                </span>
              ) : null}
              <span className="flex-1" />
              <button
                type="button"
                onClick={onCopy}
                className="rounded-full border border-line px-2.5 py-1 text-[0.62rem] font-medium text-ink-soft transition-colors hover:border-moss/60 hover:text-forest"
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Helpful answer"
                  aria-pressed={message.feedback === "up"}
                  onClick={() => onFeedback("up")}
                  className={cx(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
                    message.feedback === "up"
                      ? "border-moss/50 bg-moss/10 text-forest"
                      : "border-line text-ink-soft/60 hover:text-forest",
                  )}
                >
                  <ThumbIcon direction="up" />
                </button>
                <button
                  type="button"
                  aria-label="Unhelpful answer"
                  aria-pressed={message.feedback === "down"}
                  onClick={() => onFeedback("down")}
                  className={cx(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
                    message.feedback === "down"
                      ? "border-clay/40 bg-clay/10 text-clay"
                      : "border-line text-ink-soft/60 hover:text-clay",
                  )}
                >
                  <ThumbIcon direction="down" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PendingMessage() {
  return (
    <div className="flex gap-3">
      <ArgusMark className="mt-0.5 h-7 w-7 shrink-0 text-forest" />
      <div className="rounded-2xl rounded-tl-sm border border-line/70 bg-paper px-4 py-3.5">
        <div className="flex items-center gap-2 text-xs text-ink-soft">
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-moss shimmer" />
            <span
              className="h-1.5 w-1.5 rounded-full bg-moss shimmer"
              style={{ animationDelay: "120ms" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-moss shimmer"
              style={{ animationDelay: "240ms" }}
            />
          </span>
          Checking the field catalog…
        </div>
      </div>
    </div>
  );
}

function SuggestionIcon({ id }: { id: string }) {
  if (id === "currencies") {
    return (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="8" />
        <path d="M8 12h8M12 8v8" />
      </svg>
    );
  }
  if (id === "promotions") {
    return (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 12l-8 8-8-8V4h8z" />
        <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5h16v14H4zM4 9h16M9 9v10" />
    </svg>
  );
}

function ThumbIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      aria-hidden="true"
      className={cx("h-3.5 w-3.5", direction === "down" && "rotate-180")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 10v10H4V10zM7 10l4-7c1.4 0 2.5 1.1 2.5 2.5V9H19a2 2 0 012 2.4l-1.2 6A2 2 0 0117.8 19H7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3 w-3 text-moss"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3 w-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
