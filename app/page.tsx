import styles from "./page.module.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { allFlowers } from "./lib/products";

/* ── Tier data (will come from Supabase later) ── */
const TIERS = [
  {
    name: "EXOTIC",
    slug: "exotic",
    tagline: "Ultra-rare, top-shelf genetics",
    thc: "35-39%",
    unitPrice: 20,
    deal3g: "Buy 2g Get 1g FREE = $40/3G",
    deal6g: "Buy 3g Get 3g FREE = $60/6G",
    color: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.2)",
    icon: "🔥",
    count: 42,
    banner: "/banners/exotic_premium_cannabis_with_glowing_accents.webp",
  },
  {
    name: "PREMIUM",
    slug: "premium",
    tagline: "Hand-picked connoisseur grade",
    thc: "32-34%",
    unitPrice: 15,
    deal3g: "Buy 2g Get 1g FREE = $30/3G",
    deal6g: "Buy 3g Get 3g FREE = $45/6G",
    color: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.2)",
    icon: "💎",
    count: 38,
    banner: "/banners/premium_cannabis_with_glowing_accents.webp",
  },
  {
    name: "AAA+",
    slug: "aaa",
    tagline: "Heavy hitters, proven strains",
    thc: "30-32%",
    unitPrice: 10,
    deal3g: "Buy 2g Get 1g FREE = $20/3G",
    deal6g: "Buy 3g Get 3g FREE = $30/6G",
    color: "#22d3ee",
    glow: "rgba(34, 211, 238, 0.2)",
    icon: "⚡",
    count: 55,
    banner: "/banners/electric_neon_cannabis_ad_banner.webp",
  },
  {
    name: "AA",
    slug: "aa",
    tagline: "Quality daily drivers",
    thc: "27-29%",
    unitPrice: 4,
    deal3g: null,
    deal6g: null,
    color: "#34d399",
    glow: "rgba(52, 211, 153, 0.2)",
    icon: "✦",
    count: 35,
    banner: "/banners/neon_cannabis_product_showcase.webp",
  },
  {
    name: "BUDGET",
    slug: "budget",
    tagline: "Shreds & value OZs",
    thc: "24-27%",
    unitPrice: 3,
    deal3g: "Buy 2g Get 1g FREE = $10/3G",
    deal6g: null,
    color: "#94a3b8",
    glow: "rgba(148, 163, 184, 0.15)",
    icon: "💰",
    count: 18,
    banner: "/banners/premium_budget_cannabis_deal_showcase.webp",
  },
  {
    name: "EDIBLES & MORE",
    slug: "items/edibles",
    tagline: "Gummies, vapes, pre-rolls, hash",
    thc: "Up to 98%",
    unitPrice: null,
    deal3g: null,
    deal6g: null,
    color: "#fb923c",
    glow: "rgba(251, 146, 60, 0.2)",
    icon: "🍬",
    count: 80,
    banner: "/banners/neon_lit_edible_product_promotion_banner.webp",
  },
];

/* ── Build featured strains dynamically from real inventory ── */
function buildFeatured() {
  const hot = allFlowers.filter((f) => f.isHot);
  const sale = allFlowers.filter((f) => f.isSale && !f.isHot);
  const rest = allFlowers
    .filter((f) => !f.isHot && !f.isSale && f.image)
    .sort((a, b) => parseFloat(b.thc) - parseFloat(a.thc));
  const pool = [...hot, ...sale, ...rest];
  const picked: typeof pool = [];
  const tierCounts: Record<string, number> = {};
  for (const f of pool) {
    if (picked.length >= 8) break;
    const tc = tierCounts[f.tier] || 0;
    if (tc >= 3) continue;
    if (!f.image) continue;
    picked.push(f);
    tierCounts[f.tier] = tc + 1;
  }
  return picked.map((f) => ({
    name: f.name,
    sku: f.sku,
    tier: f.tier.toUpperCase(),
    thc: f.thc,
    type: f.type === "indica" ? "IH" : f.type === "sativa" ? "SH" : "H",
    price3g: f.price3g ? `$${f.price3g.sale ?? f.price3g.regular}` : "—",
    image: f.image,
  }));
}
const FEATURED_STRAINS = buildFeatured();

function getTypeLabel(type: string) {
  if (type.startsWith("IH")) return "Indica";
  if (type.startsWith("SH")) return "Sativa";
  return "Hybrid";
}

function getTypeClass(type: string) {
  if (type.startsWith("IH")) return styles.badgeIndica;
  if (type.startsWith("SH")) return styles.badgeSativa;
  return styles.badgeHybrid;
}

function getTierColor(tier: string) {
  const t = TIERS.find((t) => t.name === tier);
  return t?.color || "#94a3b8";
}

export default function HomePage() {
  return (
    <main className={styles.main}>
      {/* ── NAVBAR ── */}
      <Navbar />

      {/* ── HERO BANNER ── */}
      <section className={styles.hero} id="hero">
        <div className={styles.heroBanner}>
          <img
            src="/banners/spirit_corner_cannabis_showcase.webp"
            alt="Spirit Corner Cannabis — Premium Ottawa Cannabis Dispensary"
            className={styles.heroBannerImg}
          />
          <div className={styles.heroBannerOverlay}></div>
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot}></span>
            OTTAWA&apos;S UPLIFTING DISPENSARY
          </div>
          <h1 className={styles.heroTitle}>
            Premium Cannabis.
            <br />
            <span className={styles.heroFire}>Elevate Your Spirit.</span>{" "}
            <span className={styles.heroLit}>Spirit Corner.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            200+ hand-picked strains · Exotic to Budget · THC up to 39% ·
            Real-time inventory · 251 Dalhousie St, Ottawa
          </p>
          <div className={styles.heroButtons}>
            <a href="#menu" className={styles.heroBtn}>
              Browse Menu
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </a>
            <a href="/games" className={styles.heroBtnGhost}>
              🎮 Play Games
            </a>
          </div>

          {/* Stats bar */}
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>200+</span>
              <span className={styles.heroStatLabel}>Strains</span>
            </div>
            <div className={styles.heroStatDivider}></div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>39%</span>
              <span className={styles.heroStatLabel}>Max THC</span>
            </div>
            <div className={styles.heroStatDivider}></div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>$3</span>
              <span className={styles.heroStatLabel}>From /g</span>
            </div>
            <div className={styles.heroStatDivider}></div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>24h</span>
              <span className={styles.heroStatLabel}>Open</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHOP BY TIER BANNER ── */}
      <section className={styles.tierSection} id="menu">
        <div className={styles.container}>
          <div className={styles.sectionBanner}>
            <img
              src="/banners/neon_crafted_cannabis_tier_shop_banner.webp"
              alt="Shop by Tier — From exotic craft flower to value budget OZs"
              className={styles.sectionBannerImg}
            />
          </div>

          <div className={styles.tierGrid}>
            {TIERS.map((tier, i) => (
              <a
                key={tier.slug}
                href={`/${tier.slug}`}
                className={styles.tierCard}
                style={
                  {
                    "--tier-color": tier.color,
                    "--tier-glow": tier.glow,
                    animationDelay: `${i * 0.1}s`,
                  } as React.CSSProperties
                }
              >
                <div className={styles.tierCardBanner}>
                  <img
                    src={tier.banner}
                    alt={`${tier.name} cannabis flower`}
                    className={styles.tierCardBannerImg}
                  />
                </div>
                <div className={styles.tierCardBody}>
                  <h3
                    className={styles.tierCardName}
                    style={{ color: tier.color }}
                  >
                    {tier.icon} {tier.name}
                  </h3>
                  <div className={styles.tierCardMeta}>
                    <span className={styles.tierCardThc}>
                      THC {tier.thc}
                    </span>
                    <span className={styles.tierCardCount}>
                      {tier.count} strains
                    </span>
                  </div>
                  <div className={styles.tierCardPrice}>
                    {tier.unitPrice !== null && (
                      <span className={styles.tierCardUnitPrice}>
                        ${tier.unitPrice}/g
                      </span>
                    )}
                  </div>
                  {tier.deal3g && (
                    <div className={styles.tierCardDeals}>
                      <span className={styles.tierCardDeal}>🎁 {tier.deal3g}</span>
                      {tier.deal6g && <span className={styles.tierCardDeal}>🎁 {tier.deal6g}</span>}
                    </div>
                  )}
                </div>
                <div className={styles.tierCardArrow}>→</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOT RIGHT NOW ── */}
      <section className={styles.featuredSection}>
        <div className={styles.container}>
          <div className={styles.sectionBanner}>
            <img
              src="/banners/hot_right_now_in_neon_glow.webp"
              alt="Hot Right Now — Staff picks and top sellers"
              className={styles.sectionBannerImg}
            />
          </div>

          <div className={styles.featuredGrid}>
            {FEATURED_STRAINS.map((strain, i) => (
              <a
                key={strain.sku}
                href={`/flower/${strain.name.toLowerCase().replace(/\s+/g, "-")}`}
                className={styles.productCard}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className={styles.productMedia}>
                  <img
                    src={strain.image}
                    alt={strain.name}
                    loading="lazy"
                    className={styles.productImg}
                  />
                  <div className={styles.productBadges}>
                    <span className={styles.productBadgeThc}>
                      THC {strain.thc}
                    </span>
                    <span
                      className={`${styles.productBadgeTier}`}
                      style={{
                        background: `linear-gradient(135deg, ${getTierColor(strain.tier)}, ${getTierColor(strain.tier)}dd)`,
                        color: strain.tier === "BUDGET" ? "#1e293b" : "white",
                      }}
                    >
                      {strain.tier}
                    </span>
                  </div>
                </div>
                <div className={styles.productBody}>
                  <span
                    className={`${styles.productType} ${getTypeClass(strain.type)}`}
                  >
                    {getTypeLabel(strain.type)}
                  </span>
                  <h3 className={styles.productName}>{strain.name}</h3>
                  <div className={styles.productPricing}>
                    <span className={styles.productPrice}>
                      {strain.price3g}
                    </span>
                    <span className={styles.productPriceUnit}>/ 3g</span>
                  </div>
                  <div className={styles.productCta}>View Strain →</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── GAMES ARCADE BANNER ── */}
      <section className={styles.promoSection}>
        <a href="/games" className={styles.promoBannerLink}>
          <img
            src="/banners/neon_arcade_gaming_promotion_banner.webp"
            alt="Games Arcade — Flappy Bud, Snake Munchies, Brick Breaker 420"
            className={styles.promoBannerImg}
          />
        </a>
      </section>

      {/* ── STORE INFO ── */}
      <section className={styles.storeSection} id="contact">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Visit <span className="text-gradient-neon">Spirit Corner</span>
            </h2>
          </div>
          <div className={styles.storeGrid}>
            <div className={styles.storeCard}>
              <div className={styles.storeIcon}>📍</div>
              <h3 className={styles.storeCardTitle}>Location</h3>
              <p className={styles.storeCardText}>
                251 Dalhousie St
                <br />
                Ottawa, ON K1N 1E7
                <br />
                <a
                  href="https://maps.app.goo.gl/yVDY1PZ8qSwAjQ6s6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.storeLink}
                >
                  Get Directions →
                </a>
              </p>
            </div>
            <div className={styles.storeCard}>
              <div className={styles.storeIcon}>🕒</div>
              <h3 className={styles.storeCardTitle}>Hours</h3>
              <p className={styles.storeCardText}>
                Open 7 Days a Week
                <br />
                <span className={styles.storeHighlight}>Open 24 Hours</span>
              </p>
            </div>
            <div className={styles.storeCard}>
              <div className={styles.storeIcon}>🔥</div>
              <h3 className={styles.storeCardTitle}>Walk In</h3>
              <p className={styles.storeCardText}>
                No appointment needed
                <br />
                <span className={styles.storeHighlight}>
                  Dalhousie St, Ottawa
                </span>
              </p>
            </div>
          </div>

          {/* Embedded map */}
          <div className={styles.mapWrap}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2800.0!2d-75.6928!3d45.4292!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cce04c8524ed59b%3A0x5836a82438336497!2s251+Dalhousie+St%2C+Ottawa%2C+ON+K1N+1E7!5e0!3m2!1sen!2sca!4v1"
              width="100%"
              height="300"
              style={{ border: 0, borderRadius: "var(--radius-lg)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Spirit Corner Cannabis — 251 Dalhousie St, Ottawa"
            ></iframe>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </main>
  );
}
