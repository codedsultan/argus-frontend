import type { Metadata } from "next";

import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "The terms for the Argus Field Supply preview, a fictional storefront and curated assistant demonstration.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms"
      title="The ground rules."
      intro="Argus Field Supply is a fictional storefront and a curated assistant preview. These terms keep the boundary clear: look around, ask the recorded questions, and do not treat the preview as a real shop."
      updated="November 2026"
    >
      <h2>The preview is a demonstration</h2>
      <p>
        The catalog, product names, prices, promotions, and storefront are
        illustrative. Nothing in this preview is a real offer to sell goods or
        services. There is no checkout, no cart, and no order fulfillment.
      </p>

      <h2>Assistant answers</h2>
      <p>
        The assistant answers three recorded scenarios in replay mode. Answers
        are grounded in the preview catalog, but they can still be incomplete or
        out of date. Verify product details independently before making a real
        purchase elsewhere.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Use the preview for evaluation, demonstration, or portfolio review.</li>
        <li>Do not attempt to bypass the replay boundary or the request budget.</li>
        <li>Do not use the preview to transmit unlawful, sensitive, or confidential information.</li>
        <li>Do not probe, scrape, or overload the service.</li>
      </ul>

      <h2>Availability</h2>
      <p>
        The preview is provided as-is and may change or go offline without
        notice. There is no uptime commitment, support commitment, or warranty.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, the maintainers of this preview
        are not liable for any loss or damage arising from its use. This is a
        demonstration, not a commercial storefront.
      </p>

      <h2>Contact</h2>
      <p>
        For questions about these terms, reach the field desk using the contact
        link below.
      </p>
    </LegalPage>
  );
}
