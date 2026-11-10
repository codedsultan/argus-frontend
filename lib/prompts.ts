export type PreviewPrompt = {
  id: string;
  label: string;
  title: string;
  description: string;
  prompt: string;
};

export const PREVIEW_PROMPTS: PreviewPrompt[] = [
  {
    id: "catalog",
    label: "Catalog",
    title: "Browse the field catalog",
    description: "See every product, price, and category in the store.",
    prompt: "Show all available products in the store.",
  },
  {
    id: "currencies",
    label: "Currencies",
    title: "Check supported currencies",
    description: "Find out which currencies the field supply accepts.",
    prompt: "What currencies are supported by the Argus Field Supply?",
  },
  {
    id: "promotions",
    label: "Offers",
    title: "Find current binocular offers",
    description: "Ask about the latest promotions on binoculars.",
    prompt: "What current promotions are available on binoculars?",
  },
];

export const PREVIEW_PROMPT_SET = new Set(
  PREVIEW_PROMPTS.map((prompt) => prompt.prompt),
);

export function isPreviewPrompt(message: string): boolean {
  return PREVIEW_PROMPT_SET.has(message.trim());
}

export function previewTitle(message: string): string {
  const match = PREVIEW_PROMPTS.find(
    (prompt) => prompt.prompt === message.trim(),
  );
  return match?.title ?? message.trim().slice(0, 48);
}
