import type { Metadata } from "next";

import { AssistantApp } from "@/components/assistant/AssistantApp";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Assistant",
  description:
    "Ask Argus about the field catalog, supported currencies, and current offers. Grounded answers from the Argus Field Supply.",
  alternates: {
    canonical: "/assistant",
  },
  openGraph: {
    title: `Assistant · ${SITE.name}`,
    description:
      "Ask Argus about the field catalog, supported currencies, and current offers.",
    url: `${SITE.url}/assistant`,
  },
};

export default function AssistantPage() {
  return <AssistantApp />;
}
