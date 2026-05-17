/* -- Product & Item Types -- */
export interface FlowerProduct {
  sku: string;
  name: string;
  slug: string;
  tier: string;
  type: "indica" | "sativa" | "hybrid";
  isHot: boolean;
  isSale: boolean;
  thc: string;
  price3g: PricePoint | null;
  price5g: PricePoint | null;
  price14g: PricePoint | null;
  price28g: PricePoint | null;
  image: string;
}

export interface PricePoint {
  regular: number;
  sale: number | null;
}

export interface ItemProduct {
  sku: string;
  name: string;
  slug: string;
  category: string;
  type: string;
  thc: string;
  mg: string;
  price: string;
  image: string;
  promoImage: string | null;
}

/* ── Data imports (static fallback) ── */
import flowersJson from "./flowers.json";
import itemsJson from "./items.json";

export const allFlowers: FlowerProduct[] = flowersJson as FlowerProduct[];
export const allItems: ItemProduct[] = itemsJson as ItemProduct[];

/* ── Live stock fetch from Apps Script ── */
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || "";

interface LiveStockResponse {
  flowers: FlowerProduct[];
  items: ItemProduct[];
  storeCode?: string;
  stockDate?: string;
}

/**
 * Fetch live stock-filtered products from Apps Script endpoint.
 * Used at build time (getStaticProps / generateStaticParams).
 * Falls back to static JSON if endpoint not configured.
 */
export async function fetchLiveProducts(): Promise<{
  flowers: FlowerProduct[];
  items: ItemProduct[];
  isLive: boolean;
  stockDate: string | null;
}> {
  if (!APPS_SCRIPT_URL) {
    return { flowers: allFlowers, items: allItems, isLive: false, stockDate: null };
  }

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?store=ALC01`, {
      next: { revalidate: 300 }, // Cache for 5 min during build
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: LiveStockResponse = await res.json();
    return {
      flowers: data.flowers || allFlowers,
      items: data.items || allItems,
      isLive: true,
      stockDate: data.stockDate || null,
    };
  } catch (err) {
    console.warn("[products] Live fetch failed, using static data:", err);
    return { flowers: allFlowers, items: allItems, isLive: false, stockDate: null };
  }
}

export const TIER_CONFIG: Record<
  string,
  {
    name: string; slug: string; color: string; icon: string; tagline: string; banner: string;
    unitPrice: number; /* $/g */
    deal3g: { label: string; total: string; price: number } | null; /* Buy 2g Get 1g FREE */
    deal6g: { label: string; total: string; price: number } | null; /* Buy 3g Get 3g FREE (top 3 only) */
  }
> = {
  EXOTIC: {
    name: "Exotic",
    slug: "exotic",
    color: "#f59e0b",
    icon: "\uD83D\uDD25",
    tagline: "Ultra-rare, top-shelf genetics \u00B7 THC 35-39%",
    banner: "/banners/exotic_premium_cannabis_with_glowing_accents.webp",
    unitPrice: 20,
    deal3g: { label: "Buy 2g Get 1g FREE", total: "3G", price: 40 },
    deal6g: { label: "Buy 3g Get 3g FREE", total: "6G", price: 60 },
  },
  PREMIUM: {
    name: "Premium",
    slug: "premium",
    color: "#a78bfa",
    icon: "\uD83D\uDC8E",
    tagline: "Hand-picked connoisseur grade \u00B7 THC 32-34%",
    banner: "/banners/premium_cannabis_with_glowing_accents.webp",
    unitPrice: 15,
    deal3g: { label: "Buy 2g Get 1g FREE", total: "3G", price: 30 },
    deal6g: { label: "Buy 3g Get 3g FREE", total: "6G", price: 45 },
  },
  "AAA+": {
    name: "AAA+",
    slug: "aaa",
    color: "#22d3ee",
    icon: "\u26A1",
    tagline: "Heavy hitters, proven strains \u00B7 THC 30-32%",
    banner: "/banners/electric_neon_cannabis_ad_banner.webp",
    unitPrice: 10,
    deal3g: { label: "Buy 2g Get 1g FREE", total: "3G", price: 20 },
    deal6g: { label: "Buy 3g Get 3g FREE", total: "6G", price: 30 },
  },
  AA: {
    name: "AA",
    slug: "aa",
    color: "#34d399",
    icon: "\u2726",
    tagline: "Quality daily drivers \u00B7 THC 27-29%",
    banner: "/banners/neon_cannabis_product_showcase.webp",
    unitPrice: 4,
    deal3g: null,
    deal6g: null,
  },
  BUDGET: {
    name: "Budget",
    slug: "budget",
    color: "#94a3b8",
    icon: "\uD83D\uDCB0",
    tagline: "Shreds & value OZs \u00B7 From $40/oz",
    banner: "/banners/premium_budget_cannabis_deal_showcase.webp",
    unitPrice: 3,
    deal3g: { label: "Buy 2g Get 1g FREE", total: "3G", price: 10 },
    deal6g: null,
  },
};

/* ── Item category config ── */
export interface CategoryInfo {
  name: string; slug: string; color: string; icon: string;
  seoTitle: string; seoIntro: string; seoDescription: string;
  faqs: { q: string; a: string }[];
}

export const CATEGORY_CONFIG: Record<string, CategoryInfo> = {
  EDIBLES: {
    name: "Edibles", slug: "edibles", color: "#f97316", icon: "🍬",
    seoTitle: "Cannabis Edibles Ottawa — Gummies, Chocolates & Drinks",
    seoIntro: "Browse the full cannabis edibles menu at Spirit Corner Cannabis on Dalhousie St, Ottawa. We carry THC gummies, chocolates, drinks, and more from top Canadian brands.",
    seoDescription: "Looking for cannabis edibles in Ottawa? Spirit Corner Cannabis stocks a wide range of THC-infused gummies, chocolates, beverages, and baked goods. Our edibles range from micro-dose options for beginners to high-potency products for experienced consumers. All products are lab-tested and sourced from licensed Canadian producers. Visit us at 251 Dalhousie St — open daily 24 hours.",
    faqs: [
      { q: "What cannabis edibles do you carry?", a: "We stock THC gummies, chocolates, beverages, capsules, and baked goods from top Canadian brands. Potencies range from 10mg to 1000mg+ THC." },
      { q: "How long do edibles take to kick in?", a: "Cannabis edibles typically take 30-90 minutes to take effect. Start with a low dose (5-10mg) and wait at least 2 hours before consuming more." },
      { q: "Can I buy edibles at Spirit Corner Cannabis?", a: "Yes! Visit us at 251 Dalhousie St, Ottawa. We're open daily 24 hours with a full edibles selection in store." },
    ],
  },
  "VAPE PENS": {
    name: "Vape Pens", slug: "vapes", color: "#8b5cf6", icon: "💨",
    seoTitle: "Vape Pens Ottawa — THC & Nicotine Cartridges",
    seoIntro: "Shop THC and nicotine vape pens at Spirit Corner Cannabis, Ottawa. Cartridges, 510-thread batteries, and premium vape brands — all in stock.",
    seoDescription: "Spirit Corner Cannabis carries a curated selection of vape pens and cartridges in Ottawa. From 510-thread THC cartridges to nicotine vape pods, we stock the most popular brands and flavours. Our knowledgeable budtenders can help you choose the right cartridge and battery setup. Visit us at 251 Dalhousie St for the best vape selection in ByWard Market.",
    faqs: [
      { q: "What vape pens do you sell?", a: "We carry 510-thread THC cartridges, nicotine vape pods, disposable vapes, and compatible batteries from top Canadian brands." },
      { q: "Do you sell vape batteries?", a: "Yes! We stock 510-thread batteries and pod systems that pair with our cartridge selection." },
    ],
  },
  "VAPE DISPOSABLE": {
    name: "Vape Disposables", slug: "vape-disposables", color: "#a78bfa", icon: "💨",
    seoTitle: "Disposable Vapes Ottawa — THC Disposable Pens",
    seoIntro: "THC disposable vapes available at Spirit Corner Cannabis, Ottawa. No charging, no refilling — just open and enjoy.",
    seoDescription: "Disposable THC vapes are the easiest way to enjoy cannabis on the go. Spirit Corner Cannabis stocks a wide selection of pre-charged, pre-filled disposable vape pens with various strain profiles and potencies. Perfect for beginners and experienced users alike. Visit us at 251 Dalhousie St, Ottawa.",
    faqs: [
      { q: "How long does a disposable vape last?", a: "Most disposable THC vapes contain 0.5g-1g of distillate and last between 100-300 puffs depending on usage." },
      { q: "Are disposable vapes rechargeable?", a: "Most are designed for single use, but some models include a USB-C charging port to ensure you can use the full cartridge." },
    ],
  },
  CONCENTRATES: {
    name: "Concentrates", slug: "concentrates", color: "#f59e0b", icon: "💎",
    seoTitle: "Cannabis Concentrates Ottawa — Shatter, Wax, Hash & Live Resin",
    seoIntro: "Premium cannabis concentrates at Spirit Corner Cannabis, Ottawa. Shatter, wax, hash, live resin, and diamonds — all in stock.",
    seoDescription: "Spirit Corner Cannabis offers a premium selection of cannabis concentrates in Ottawa. From traditional hash and kief to modern extracts like shatter, wax, live resin, and THC diamonds, we carry products for every preference and potency level. Our concentrates are sourced from trusted extractors and tested for purity. Visit us at 251 Dalhousie St.",
    faqs: [
      { q: "What types of concentrates do you carry?", a: "We stock shatter, wax, budder, live resin, rosin, hash, kief, and THC diamonds from top Canadian extractors." },
      { q: "How do I consume concentrates?", a: "Concentrates can be dabbed with a rig, vaped with a concentrate pen, or added to flower in a joint or bowl for extra potency." },
    ],
  },
  PREROLLS: {
    name: "Pre-Rolls", slug: "prerolls", color: "#22c55e", icon: "🚬",
    seoTitle: "Pre-Rolls Ottawa — Ready-to-Smoke Cannabis Joints",
    seoIntro: "Pre-rolled cannabis joints at Spirit Corner Cannabis, Ottawa. Singles, multi-packs, and infused pre-rolls — ready to light up.",
    seoDescription: "Skip the rolling and grab a pre-roll from Spirit Corner Cannabis in Ottawa. We carry singles, multi-packs, and infused pre-rolls from premium flower. Whether you want a quick smoke or a party pack, our pre-roll selection has something for everyone. Visit us at 251 Dalhousie St — open daily 24 hours.",
    faqs: [
      { q: "What pre-rolls do you carry?", a: "We stock singles, 3-packs, and multi-packs in various strains and potencies, including infused pre-rolls with concentrates." },
      { q: "Are your pre-rolls made with quality flower?", a: "Yes! Our pre-rolls are filled with ground flower from our regular menu tiers — not shake or trim." },
    ],
  },
  "ADD ONS": {
    name: "Accessories", slug: "add-ons", color: "#34d399", icon: "➕",
    seoTitle: "Cannabis Accessories Ottawa — Grinders, Papers, Lighters & More",
    seoIntro: "Essential cannabis accessories at Spirit Corner Cannabis, Ottawa. Grinders, rolling papers, lighters, trays, and more.",
    seoDescription: "Spirit Corner Cannabis carries all the accessories you need for the perfect smoke session. From premium grinders and rolling papers to lighters, trays, and storage containers, we have everything in stock. Visit us at 251 Dalhousie St, Ottawa.",
    faqs: [
      { q: "What accessories do you sell?", a: "We carry grinders, rolling papers, filter tips, lighters, rolling trays, storage jars, and more." },
    ],
  },
  CIGARETTES: {
    name: "Cigarettes", slug: "cigarettes", color: "#78716c", icon: "🏷️",
    seoTitle: "Native Cigarettes Ottawa — Discount Tobacco at Spirit Corner",
    seoIntro: "Discount native cigarettes at Spirit Corner Cannabis, Ottawa. Premium and value brands at the best prices on Dalhousie St.",
    seoDescription: "Spirit Corner Cannabis is your go-to source for affordable native cigarettes in Ottawa. We carry a wide selection of premium and value tobacco brands at competitive prices. Located at 251 Dalhousie St in the heart of ByWard Market, we're open daily 24 hours. Stop by for the best cigarette prices in the neighbourhood.",
    faqs: [
      { q: "Do you sell cigarettes at Spirit Corner?", a: "Yes! We carry a wide selection of native cigarette brands at competitive prices." },
      { q: "What cigarette brands do you carry?", a: "We stock a variety of premium and value native cigarette brands. Visit us to see our full in-store selection." },
      { q: "Are your cigarette prices competitive?", a: "Absolutely. We offer some of the best cigarette prices in the ByWard Market area of Ottawa." },
    ],
  },
  "MAGIC & OTHERS": {
    name: "Magic & Others", slug: "magic", color: "#ec4899", icon: "🍄",
    seoTitle: "Magic Mushrooms & More — Ottawa",
    seoIntro: "Magic mushrooms, psilocybin products, and specialty items at Spirit Corner Cannabis, Ottawa.",
    seoDescription: "Spirit Corner Cannabis carries a curated selection of magic mushrooms and specialty products in Ottawa. From micro-dose capsules to dried psilocybin mushrooms, we stock products for both beginners and experienced psychonauts. Visit us at 251 Dalhousie St for our full selection.",
    faqs: [
      { q: "Do you sell magic mushrooms?", a: "Yes, we carry dried magic mushrooms, micro-dose capsules, and psilocybin edibles." },
      { q: "What is micro-dosing?", a: "Micro-dosing involves taking very small amounts of psilocybin (typically 0.1-0.3g) for subtle cognitive and mood benefits without a full psychedelic experience." },
    ],
  },
};

/* ── Helper functions ── */
export function getFlowersByTier(tier: string): FlowerProduct[] {
  return allFlowers.filter(
    (f) => f.tier.toUpperCase() === tier.toUpperCase()
  );
}

export function getFlowerBySlug(slug: string): FlowerProduct | undefined {
  return allFlowers.find((f) => f.slug === slug);
}

export function getItemsByCategory(category: string): ItemProduct[] {
  return allItems.filter(
    (i) => i.category.toUpperCase() === category.toUpperCase()
  );
}

export function getTierFromSlug(
  slug: string
): { key: string; config: (typeof TIER_CONFIG)[string] } | undefined {
  const entry = Object.entries(TIER_CONFIG).find(
    ([, v]) => v.slug === slug
  );
  if (!entry) return undefined;
  return { key: entry[0], config: entry[1] };
}

export function getCategoryFromSlug(
  slug: string
): { key: string; config: (typeof CATEGORY_CONFIG)[string] } | undefined {
  const entry = Object.entries(CATEGORY_CONFIG).find(
    ([, v]) => v.slug === slug
  );
  if (!entry) return undefined;
  return { key: entry[0], config: entry[1] };
}

export function getLowestPrice(flower: FlowerProduct): number | null {
  const prices = [flower.price3g, flower.price5g, flower.price14g, flower.price28g]
    .filter((p): p is PricePoint => p !== null)
    .map((p) => p.sale ?? p.regular);
  return prices.length ? Math.min(...prices) : null;
}

export function formatPrice(p: PricePoint | null): string {
  if (!p) return "—";
  if (p.sale !== null) return `$${p.sale}`;
  return `$${p.regular}`;
}
