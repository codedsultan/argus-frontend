import type { Product, ProductArt, ProductCard } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "0PUK6V6EV0",
    name: "Aurora Capture Module",
    description:
      "A compact camera module for capturing bright planets and lunar craters through a small telescope. It includes a USB-C connection, an adjustable gain control, and a lightweight mounting sleeve.",
    picture: "AuroraCaptureModule.jpg",
    priceUsd: { currencyCode: "USD", units: 175, nanos: 0 },
    categories: ["accessories", "telescopes"],
  },
  {
    id: "1YMWWN1N4O",
    name: "Horizon Travel Scope",
    description:
      "A 50 mm refractor built for travel and solar observation. The kit includes a glass solar filter, a 20 mm eyepiece, a compact tripod, and a padded carry bag.",
    picture: "HorizonTravelScope.jpg",
    priceUsd: { currencyCode: "USD", units: 129, nanos: 950_000_000 },
    categories: ["telescopes", "travel"],
  },
  {
    id: "2ZYFJ3GM2N",
    name: "Ridgeview 8x42 Binoculars",
    description:
      "A balanced 8x42 binocular for low-light field work. The Ridgeview pairs a wide field of view with a close focus that works for birds, ridgelines, and the night sky.",
    picture: "Ridgeview842Binoculars.jpg",
    priceUsd: { currencyCode: "USD", units: 209, nanos: 950_000_000 },
    categories: ["binoculars"],
  },
  {
    id: "66VCHSJNUP",
    name: "Starfinder 70 Refractor",
    description:
      "A 70 mm refractor for lunar and planetary viewing. The package includes two eyepieces, a red-dot finder, a tripod, and a carry case for the trail.",
    picture: "Starfinder70Refractor.jpg",
    priceUsd: { currencyCode: "USD", units: 349, nanos: 950_000_000 },
    categories: ["telescopes"],
  },
  {
    id: "6E92ZMYYFZ",
    name: "SunShield Solar Filter",
    description:
      "A certified solar filter that fits the Horizon and Starfinder refractors. It threads onto the objective for safe white-light observation.",
    picture: "SunShieldSolarFilter.jpg",
    priceUsd: { currencyCode: "USD", units: 69, nanos: 950_000_000 },
    categories: ["accessories", "telescopes"],
  },
  {
    id: "9SIQT8TOJO",
    name: "Deep Field Optical Tube",
    description:
      "A large-aperture optical tube for deep-sky work. The package includes a machined focuser, tube rings, and a dovetail plate. Assembly is available at checkout.",
    picture: "DeepFieldOpticalTube.jpg",
    priceUsd: { currencyCode: "USD", units: 3599, nanos: 0 },
    categories: ["accessories", "telescopes", "assembly"],
  },
  {
    id: "HQTGWGPNH4",
    name: "The Night Watcher's Almanac",
    description:
      "A pocket field guide to the night sky. Seasonal star charts, lunar phases, and a short observing log make it a useful companion for a first telescope.",
    picture: "NightWatchersAlmanac.jpg",
    priceUsd: { currencyCode: "USD", units: 0, nanos: 990_000_000 },
    categories: ["books"],
  },
  {
    id: "L9ECAV7KIM",
    name: "Optics Care Kit",
    description:
      "A field-safe cleaning kit with a blower, brush, microfiber cloths, and a small bottle of lens solution. Sized for a jacket pocket.",
    picture: "OpticsCareKit.jpg",
    priceUsd: { currencyCode: "USD", units: 21, nanos: 950_000_000 },
    categories: ["accessories"],
  },
  {
    id: "LS4PSXUNUM",
    name: "NightTrail Red Lamp",
    description:
      "A red LED lamp that preserves night vision. It has a low and high setting, a clip for a pack strap, and a soft beam for reading charts in the dark.",
    picture: "NightTrailRedLamp.jpg",
    priceUsd: { currencyCode: "USD", units: 57, nanos: 80_000_000 },
    categories: ["accessories", "flashlights"],
  },
  {
    id: "OLJCESPC7Z",
    name: "TrailScope 60 Travel Refractor",
    description:
      "A 60 mm refractor sized for a day pack. The kit includes a travel tripod, a 25 mm eyepiece, and a soft case for quick trips to a dark site.",
    picture: "TrailScope60TravelRefractor.jpg",
    priceUsd: { currencyCode: "USD", units: 101, nanos: 960_000_000 },
    categories: ["telescopes"],
  },
];

const ART_BY_ID: Record<string, ProductArt> = {
  "0PUK6V6EV0": "camera",
  "1YMWWN1N4O": "telescope",
  "2ZYFJ3GM2N": "binoculars",
  "66VCHSJNUP": "telescope",
  "6E92ZMYYFZ": "filter",
  "9SIQT8TOJO": "telescope",
  HQTGWGPNH4: "book",
  L9ECAV7KIM: "care",
  LS4PSXUNUM: "lamp",
  OLJCESPC7Z: "telescope",
};

const ART_BY_CATEGORY: Record<string, ProductArt> = {
  binoculars: "binoculars",
  telescopes: "telescope",
  books: "book",
  flashlights: "lamp",
};

export const CATEGORY_LABELS: Record<string, string> = {
  accessories: "Accessories",
  assembly: "Assembly",
  binoculars: "Binoculars",
  books: "Field guides",
  flashlights: "Lighting",
  telescopes: "Telescopes",
  travel: "Travel",
};

export const CATALOG_CATEGORIES = [
  { id: "all", label: "All gear" },
  { id: "binoculars", label: "Binoculars" },
  { id: "telescopes", label: "Telescopes" },
  { id: "accessories", label: "Accessories" },
  { id: "travel", label: "Travel" },
  { id: "books", label: "Field guides" },
  { id: "flashlights", label: "Lighting" },
] as const;

export const PRODUCTS_BY_ID = new Map(PRODUCTS.map((product) => [product.id, product]));

export function formatPrice(product: Product): string {
  const amount = product.priceUsd.units + product.priceUsd.nanos / 1_000_000_000;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.priceUsd.currencyCode,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function categoryLabel(categories: string[]): string {
  const primary = categories.find((category) => category !== "assembly");
  return CATEGORY_LABELS[primary ?? ""] ?? "Field gear";
}

export function artForProduct(product: Product): ProductArt {
  if (ART_BY_ID[product.id]) return ART_BY_ID[product.id];
  for (const category of product.categories) {
    if (ART_BY_CATEGORY[category]) return ART_BY_CATEGORY[category];
  }
  return "telescope";
}

export function toProductCard(product: Product): ProductCard {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: formatPrice(product),
    categories: product.categories,
    categoryLabel: categoryLabel(product.categories),
    art: artForProduct(product),
    href: `/catalog/${product.id}`,
  };
}

export function getProduct(id: string): Product | undefined {
  return PRODUCTS_BY_ID.get(id);
}

export function productsInCategory(category: string | undefined): Product[] {
  if (!category || category === "all") return PRODUCTS;
  return PRODUCTS.filter((product) => product.categories.includes(category));
}

export function relatedProducts(product: Product, limit = 3): Product[] {
  return PRODUCTS.filter(
    (candidate) =>
      candidate.id !== product.id &&
      candidate.categories.some((category) => product.categories.includes(category)),
  ).slice(0, limit);
}
