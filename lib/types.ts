export type Product = {
  id: string;
  name: string;
  description: string;
  picture: string;
  priceUsd: {
    currencyCode: string;
    units: number;
    nanos: number;
  };
  categories: string[];
};

export type ProductArt =
  | "binoculars"
  | "telescope"
  | "camera"
  | "filter"
  | "book"
  | "care"
  | "lamp";

export type ProductCard = {
  id: string;
  name: string;
  description: string;
  price: string;
  categories: string[];
  categoryLabel: string;
  art: ProductArt;
  href: string;
};

export type Promotion = {
  text: string;
  redirectUrl: string;
  productId?: string;
  productName?: string;
  productHref?: string;
};

export type ChatSource =
  | "Catalog"
  | "Product details"
  | "Promotions"
  | "Currencies"
  | "Recommendations"
  | "Shipping";

export type ChatResponse = {
  answer: string;
  products: ProductCard[];
  promotions: Promotion[];
  currencies: string[];
  sources: ChatSource[];
};

export type ChatErrorPayload = {
  error: string;
  message: string;
};

export type ConversationMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products: ProductCard[];
  promotions: Promotion[];
  currencies: string[];
  sources: ChatSource[];
  createdAt: number;
  feedback?: "up" | "down" | null;
  isError?: boolean;
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ConversationMessage[];
};

export type AgentToolCall = {
  id?: string;
  name?: string;
  args?: unknown;
  arguments?: unknown;
  function?: {
    name?: string;
    arguments?: string;
  };
};

export type AgentMessage = {
  role?: string;
  type?: string;
  content?: unknown;
  tool_calls?: AgentToolCall[];
  tool_call_id?: string;
  [key: string]: unknown;
};

export type AgentPromptResponse = {
  response?: {
    messages?: AgentMessage[];
  };
  metrics?: {
    messages?: number;
    llm_calls?: number;
    tool_calls?: number;
    estimated_tokens?: number;
  };
  trace_id?: string | null;
  detail?: string;
  error?: string;
};
