import "server-only";

import {
  PRODUCTS_BY_ID,
  toProductCard,
} from "./catalog";
import type {
  AgentMessage,
  AgentPromptResponse,
  AgentToolCall,
  ChatResponse,
  ChatSource,
  Product,
  Promotion,
} from "./types";

function textOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(textOf).join("\n");
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.text === "string") return record.text;
    if (typeof record.content === "string") return record.content;
  }
  return "";
}

function roleOf(message: AgentMessage): string {
  return message.role ?? message.type ?? "";
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function toolName(call: AgentToolCall): string {
  return call.name ?? call.function?.name ?? "";
}

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.description === "string" &&
    Array.isArray(record.categories) &&
    typeof record.priceUsd === "object"
  );
}

function collectProducts(
  toolNameValue: string,
  result: unknown,
  products: Map<string, Product>,
): void {
  if (!result) return;

  if (toolNameValue === "list_products" || toolNameValue === "get_recommendations") {
    if (Array.isArray(result)) {
      for (const item of result) {
        if (isProduct(item)) products.set(item.id, item);
      }
    }
    return;
  }

  if (toolNameValue === "get_product") {
    if (isProduct(result)) products.set(result.id, result);
    else if (Array.isArray(result)) {
      for (const item of result) {
        if (isProduct(item)) products.set(item.id, item);
      }
    }
  }
}

function collectPromotions(result: unknown, promotions: Promotion[]): void {
  if (!Array.isArray(result)) return;

  for (const item of result) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const text = typeof record.text === "string" ? record.text : "";
    const redirectUrl =
      typeof record.redirectUrl === "string" ? record.redirectUrl : "";
    if (!text) continue;

    const productId = redirectUrl.match(/\/product\/([^/?#]+)/)?.[1];
    const product = productId ? PRODUCTS_BY_ID.get(productId) : undefined;

    promotions.push({
      text,
      redirectUrl,
      productId: product?.id,
      productName: product?.name,
      productHref: product ? `/catalog/${product.id}` : undefined,
    });
  }
}

function collectCurrencies(result: unknown, currencies: Set<string>): void {
  if (!Array.isArray(result)) return;
  for (const item of result) {
    if (typeof item === "string") currencies.add(item);
  }
}

function sourceForTool(toolNameValue: string): ChatSource | null {
  switch (toolNameValue) {
    case "list_products":
      return "Catalog";
    case "get_product":
      return "Product details";
    case "get_ads":
      return "Promotions";
    case "get_supported_currencies":
      return "Currencies";
    case "get_recommendations":
      return "Recommendations";
    case "get_shipping_quote":
      return "Shipping";
    default:
      return null;
  }
}

function cleanAnswer(
  answer: string,
  options: { hasProducts: boolean; hasCurrencies: boolean; hasPromotions: boolean },
): string {
  let cleaned = answer;

  // The agent returns catalog tables for list/recommendation tools. The
  // customer view renders those products as cards, so drop the raw table
  // rather than showing the same data twice.
  if (options.hasProducts) {
    cleaned = cleaned
      .split(/\r?\n/)
      .filter((line) => !line.trim().startsWith("|"))
      .join("\n");
  }

  // Currency answers end with a long comma-separated list. The customer view
  // renders the currencies as chips, so keep the sentence and drop the list.
  if (options.hasCurrencies) {
    cleaned = cleaned
      .split(/\r?\n/)
      .filter((line) => {
        const trimmed = line.trim();
        if (!trimmed) return true;
        const parts = trimmed
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean);
        return parts.length < 5;
      })
      .join("\n");
  }

  // Promotion answers repeat the offer and include an internal product link.
  // The customer view renders the offer as a card, so keep the answer short.
  if (options.hasPromotions) {
    return "Here is the current offer from the field supply.";
  }

  cleaned = cleaned
    .replace(/\*\*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  cleaned = cleaned.replace(/:\s*$/, ".");

  if (cleaned) return cleaned;
  if (options.hasProducts) {
    return "Here are the products I found in the field catalog.";
  }
  if (options.hasCurrencies) {
    return "The Argus Field Supply accepts the currencies below.";
  }
  return "I checked the catalog but could not put together an answer. Try another preview question.";
}

export function normalizeAgentResponse(
  payload: AgentPromptResponse,
): ChatResponse {
  const messages = payload.response?.messages ?? [];
  const toolResults = new Map<string, unknown>();
  const toolCalls: AgentToolCall[] = [];

  for (const message of messages) {
    if (roleOf(message) === "tool" && message.tool_call_id) {
      toolResults.set(message.tool_call_id, parseJson(message.content));
    }
    if (Array.isArray(message.tool_calls)) {
      toolCalls.push(...message.tool_calls);
    }
  }

  const products = new Map<string, Product>();
  const promotions: Promotion[] = [];
  const currencies = new Set<string>();
  const sources = new Set<ChatSource>();

  for (const call of toolCalls) {
    const name = toolName(call);
    if (!name || !call.id) continue;

    const result = toolResults.get(call.id);
    if (result === null || result === undefined) continue;

    const source = sourceForTool(name);
    if (source) sources.add(source);

    collectProducts(name, result, products);
    if (name === "get_ads") collectPromotions(result, promotions);
    if (name === "get_supported_currencies") {
      collectCurrencies(result, currencies);
    }
  }

  const assistantMessages = messages.filter(
    (message) => roleOf(message) === "assistant" || roleOf(message) === "ai",
  );
  const finalMessage = assistantMessages.at(-1);
  const productCards = [...products.values()].map(toProductCard);
  const currencyList = [...currencies];
  const answer = cleanAnswer(textOf(finalMessage?.content).trim(), {
    hasProducts: productCards.length > 0,
    hasCurrencies: currencyList.length > 0,
    hasPromotions: promotions.length > 0,
  });

  return {
    answer,
    products: productCards,
    promotions: promotions.slice(0, 3),
    currencies: currencyList,
    sources: [...sources],
  };
}

export function extractTraceId(payload: AgentPromptResponse): string | null {
  return payload.trace_id ?? null;
}
