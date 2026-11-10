import type { Metadata } from "next";

import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How the Argus Field Supply preview handles questions, local conversation history, and operational traces.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="A short privacy note."
      intro="This preview is intentionally small. It does not require an account, it keeps conversations in your browser, and it redacts prompt content from operational traces."
      updated="November 2026"
    >
      <h2>What this preview stores</h2>
      <p>
        Conversations are stored in your browser&apos;s local storage so you can
        return to a transcript after a refresh. They are not stored in an Argus
        account because there is no account. Clearing your browser storage or
        using the clear-history control removes them.
      </p>
      <ul>
        <li>Your questions and the assistant&apos;s answers.</li>
        <li>The products, promotions, currencies, and sources shown in an answer.</li>
        <li>The time a conversation was created or updated.</li>
      </ul>

      <h2>What the assistant receives</h2>
      <p>
        When you send a question, the public assistant receives the question so
        it can produce an answer. The public deployment is a curated replay
        preview: it matches a recorded scenario rather than calling a live model
        provider.
      </p>
      <p>
        Operational traces retain timing, service names, tool names, and token
        counts. Prompt and completion content is removed before trace storage.
        The customer workspace never displays trace identifiers, tool calls, or
        runtime metrics.
      </p>

      <h2>What we do not do</h2>
      <ul>
        <li>We do not sell personal data.</li>
        <li>We do not use advertising cookies or third-party analytics in this preview.</li>
        <li>We do not create customer accounts or store payment details.</li>
        <li>We do not enable checkout, cart changes, or order placement.</li>
      </ul>

      <h2>Hosting and security logs</h2>
      <p>
        The hosting and edge providers may keep standard access logs, such as an
        IP address, user agent, and timestamp, for security and operations. The
        assistant proxy also applies a small per-client request budget to protect
        the preview.
      </p>

      <h2>Changes</h2>
      <p>
        If this preview changes in a way that affects how information is handled,
        this page will be updated before the change is announced.
      </p>
    </LegalPage>
  );
}
