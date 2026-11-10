export const SITE = {
  name: "Argus Field Supply",
  shortName: "Argus",
  tagline: "Field intelligence for better gear decisions.",
  description:
    "Ask Argus about optics, field essentials, and current offers. Every answer is grounded in the field catalog before it reaches you.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://argus.xurl.fyi").replace(
    /\/$/,
    "",
  ),
  supportEmail: "hello@argus.xurl.fyi",
  previewLabel: "Curated preview",
} as const;

export const NAV_LINKS = [
  { href: "/assistant", label: "Assistant" },
  { href: "/catalog", label: "Catalog" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/status", label: "Status" },
] as const;

export const FOOTER_LINKS = {
  product: [
    { href: "/assistant", label: "Ask Argus" },
    { href: "/catalog", label: "Catalog" },
    { href: "/status", label: "System status" },
  ],
  company: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/admin", label: "Operations" },
  ],
} as const;
