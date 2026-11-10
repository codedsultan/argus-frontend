import type { ProductArt } from "@/lib/types";

const PALETTES: Record<
  ProductArt,
  { background: string; ink: string; accent: string }
> = {
  binoculars: {
    background:
      "radial-gradient(circle at 30% 20%, #eef3e9 0%, #d9e3d2 55%, #c7d4c0 100%)",
    ink: "#2e4937",
    accent: "#8aa17f",
  },
  telescope: {
    background:
      "radial-gradient(circle at 30% 20%, #f3ecdd 0%, #e4d8c2 55%, #d4c4a6 100%)",
    ink: "#4a3a26",
    accent: "#b39a70",
  },
  camera: {
    background:
      "radial-gradient(circle at 30% 20%, #eceef1 0%, #d9dde3 55%, #c6ccd5 100%)",
    ink: "#2f3b48",
    accent: "#8d9aaa",
  },
  filter: {
    background:
      "radial-gradient(circle at 30% 20%, #f6ead1 0%, #ecd6ab 55%, #dfc08a 100%)",
    ink: "#5a421b",
    accent: "#c39a4f",
  },
  book: {
    background:
      "radial-gradient(circle at 30% 20%, #f1e7d7 0%, #e2d1b8 55%, #d0b99a 100%)",
    ink: "#4b3726",
    accent: "#a9865e",
  },
  care: {
    background:
      "radial-gradient(circle at 30% 20%, #e7f0eb 0%, #d2e2da 55%, #bdd2c8 100%)",
    ink: "#2e4b40",
    accent: "#7fa695",
  },
  lamp: {
    background:
      "radial-gradient(circle at 30% 20%, #f0e2dc 0%, #e2cbc2 55%, #d2b4a8 100%)",
    ink: "#5b3229",
    accent: "#b07d6c",
  },
};

function ArtPaths({ art }: { art: ProductArt }) {
  switch (art) {
    case "binoculars":
      return (
        <g>
          <rect x="52" y="58" width="38" height="54" rx="17" />
          <rect x="110" y="58" width="38" height="54" rx="17" />
          <path d="M90 70h20M90 98h20" />
          <path d="M60 58l6-12h20l6 12M110 58l6-12h20l6 12" />
          <circle cx="71" cy="86" r="10" opacity="0.35" />
          <circle cx="129" cy="86" r="10" opacity="0.35" />
          <path d="M100 48v-8M88 40h24" />
        </g>
      );
    case "telescope":
      return (
        <g>
          <path d="M48 96l78-46 20 34-78 46z" />
          <path d="M126 50l16-9 20 34-16 9" />
          <path d="M48 96l-12 7 20 34 12-7" />
          <path d="M74 108l-8 30M122 78l18 28M92 96l14 12" />
          <path d="M60 138h44" />
          <circle cx="138" cy="62" r="4" opacity="0.5" />
        </g>
      );
    case "camera":
      return (
        <g>
          <rect x="42" y="58" width="116" height="70" rx="12" />
          <path d="M66 58l8-14h40l8 14" />
          <circle cx="100" cy="93" r="24" />
          <circle cx="100" cy="93" r="13" opacity="0.4" />
          <path d="M132 72h10M132 80h10" />
          <circle cx="58" cy="72" r="3" fill="currentColor" stroke="none" />
        </g>
      );
    case "filter":
      return (
        <g>
          <circle cx="100" cy="88" r="34" />
          <circle cx="100" cy="88" r="24" opacity="0.4" />
          <circle cx="100" cy="88" r="14" opacity="0.25" />
          <path d="M100 34v-12M100 154v-12M46 88H34M166 88h-12" />
          <path d="M62 50l-8-8M138 50l8-8M62 126l-8 8M138 126l8 8" opacity="0.55" />
        </g>
      );
    case "book":
      return (
        <g>
          <path d="M100 58c-16-10-38-12-54-8v68c16-4 38-2 54 8 16-10 38-12 54-8V50c-16-4-38-2-54 8z" />
          <path d="M100 58v68" />
          <path d="M60 70c10-1 20 1 28 5M60 84c10-1 20 1 28 5M60 98c10-1 20 1 28 5" opacity="0.45" />
          <path d="M112 75c8-4 18-6 28-5M112 89c8-4 18-6 28-5M112 103c8-4 18-6 28-5" opacity="0.45" />
          <path d="M128 50v18l6-4 6 4V50" opacity="0.55" />
        </g>
      );
    case "care":
      return (
        <g>
          <rect x="54" y="66" width="38" height="60" rx="8" />
          <path d="M62 66V54h22v12M68 54V44h10v10" />
          <path d="M62 82h22" opacity="0.45" />
          <path d="M112 58c12 0 20 8 20 20v48c0 8-6 14-14 14s-14-6-14-14V82" />
          <path d="M112 58v-10h16" />
          <path d="M112 98c8 0 14 5 14 12" opacity="0.45" />
        </g>
      );
    case "lamp":
      return (
        <g>
          <path d="M72 64h34v72H72z" />
          <path d="M72 64l12-14h34l12 14" />
          <path d="M106 78l38 14-10 30-38-14" opacity="0.55" />
          <path d="M126 84l22 8M122 98l22 8M118 112l22 8" opacity="0.35" />
          <path d="M80 76h18M80 86h18" opacity="0.4" />
          <circle cx="89" cy="116" r="4" fill="currentColor" stroke="none" />
        </g>
      );
    default:
      return null;
  }
}

export function ProductArtwork({
  art,
  className = "",
  label,
}: {
  art: ProductArt;
  className?: string;
  label?: string;
}) {
  const palette = PALETTES[art];
  const gradientId = `argus-${art}-wash`;

  return (
    <div
      aria-label={label}
      className={`relative overflow-hidden ${className}`}
      style={{ background: palette.background, color: palette.ink }}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 200 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.accent} stopOpacity="0.2" />
            <stop offset="100%" stopColor={palette.ink} stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <rect width="200" height="160" fill={`url(#${gradientId})`} />
        <g opacity="0.18" stroke={palette.ink} strokeWidth="0.7">
          <path d="M0 40h200M0 80h200M0 120h200M40 0v160M80 0v160M120 0v160M160 0v160" />
        </g>
        <g
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <ArtPaths art={art} />
        </g>
        <text
          x="16"
          y="148"
          fill="currentColor"
          opacity="0.55"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="6.5"
          letterSpacing="2.4"
        >
          ARGUS / FIELD SUPPLY
        </text>
      </svg>
    </div>
  );
}
