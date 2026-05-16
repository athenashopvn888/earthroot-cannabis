import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { allFlowers, TIER_CONFIG, type FlowerProduct, type PricePoint } from "../../lib/products";
import styles from "./flower.module.css";

/* ── Pre-generate all flower pages ── */
export function generateStaticParams() {
  return allFlowers.map((f) => ({ slug: f.slug }));
}

/* ── SEO metadata per strain ── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const flower = allFlowers.find((f) => f.slug === slug);
  if (!flower) return {};

  const tierName = TIER_CONFIG[flower.tier]?.name || flower.tier;
  const typeName = flower.type === "indica" ? "Indica" : flower.type === "sativa" ? "Sativa" : "Hybrid";

  return {
    title: `${flower.name} — ${tierName} ${typeName} | THC ${flower.thc}`,
    description: `Buy ${flower.name} ${tierName} cannabis flower at Always Lit Cannabis. ${typeName} strain, THC ${flower.thc}. Available in 3g, 5g, 14g, 28g. Toronto's best dispensary.`,
    openGraph: {
      title: `${flower.name} | Always Lit Cannabis`,
      description: `${tierName} ${typeName} · THC ${flower.thc}`,
      images: flower.image ? [{ url: flower.image, width: 800, height: 800, alt: flower.name }] : [],
    },
  };
}

/* ── JSON-LD Structured Data ── */
function getJsonLd(flower: FlowerProduct) {
  const lowestPrice = [flower.price3g, flower.price5g, flower.price14g, flower.price28g]
    .filter((p): p is PricePoint => p !== null)
    .map((p) => p.sale ?? p.regular)
    .sort((a, b) => a - b)[0];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: flower.name,
    image: flower.image,
    description: `${flower.name} — ${TIER_CONFIG[flower.tier]?.name || flower.tier} cannabis flower. ${flower.type === "indica" ? "Indica" : flower.type === "sativa" ? "Sativa" : "Hybrid"} strain with THC ${flower.thc}.`,
    brand: { "@type": "Brand", name: "Always Lit Cannabis" },
    sku: flower.sku,
    offers: {
      "@type": "Offer",
      price: lowestPrice || 0,
      priceCurrency: "CAD",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Always Lit Cannabis" },
    },
  };
}

/* ── Page ── */
export default async function FlowerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const flower = allFlowers.find((f) => f.slug === slug);
  if (!flower) notFound();

  const tierConfig = TIER_CONFIG[flower.tier];
  const tierColor = tierConfig?.color || "#94a3b8";
  const tierName = tierConfig?.name || flower.tier;
  const typeName = flower.type === "indica" ? "Indica" : flower.type === "sativa" ? "Sativa" : "Hybrid";

  const prices = [
    { label: "3g", p: flower.price3g },
    { label: "5g / 6g", p: flower.price5g },
    { label: "14g (½ oz)", p: flower.price14g },
    { label: "28g (1 oz)", p: flower.price28g },
  ].filter((x) => x.p !== null);

  // Find ALL related strains from same tier
  const related = allFlowers
    .filter((f) => f.tier === flower.tier && f.slug !== flower.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getJsonLd(flower)) }}
      />

      <main className={styles.main}>
        <Navbar />

        <div className={styles.content}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href={`/${tierConfig?.slug || "exotic"}`}>{tierName}</Link>
            <span>/</span>
            <span className={styles.breadcrumbCurrent}>{flower.name}</span>
          </nav>

          <div className={styles.layout}>
            {/* ── Image ── */}
            <div className={styles.imageWrap}>
              <div
                className={styles.imageGlow}
                style={{ background: `radial-gradient(circle, ${tierColor}15, transparent 70%)` }}
              ></div>
              {flower.image ? (
                <img src={flower.image} alt={flower.name} className={styles.image} />
              ) : (
                <div className={styles.imagePlaceholder}>{flower.name[0]}</div>
              )}

              {flower.isSale && (
                <span className={styles.saleBanner}>🔥 ON SALE</span>
              )}
              {flower.isHot && (
                <span className={styles.hotBanner}>⚡ HOT PICK</span>
              )}
              {flower.promoImage && (
                <div className={styles.promoBadge}>
                  <img src={flower.promoImage} alt="Promo" className={styles.promoImg} />
                </div>
              )}
            </div>

            {/* ── Details ── */}
            <div className={styles.details}>
              <div className={styles.tierBadge} style={{ color: tierColor, borderColor: `${tierColor}33`, background: `${tierColor}10` }}>
                {tierConfig?.icon} {tierName}
              </div>

              <h1 className={styles.strainName}>{flower.name}</h1>

              <div className={styles.metaRow}>
                <span className={`${styles.typeBadge} ${styles[flower.type]}`}>
                  {typeName}
                </span>
                <span className={styles.thcBadge}>THC {flower.thc}</span>
                <span className={styles.skuBadge}>SKU {flower.sku}</span>
              </div>

              {/* ── Pricing table ── */}
              <div className={styles.pricingSection}>
                <h2 className={styles.pricingTitle}>Pricing</h2>
                <div className={styles.priceGrid}>
                  {prices.map(({ label, p }) => (
                    <div key={label} className={styles.priceCard}>
                      <span className={styles.priceWeight}>{label}</span>
                      {p && p.sale !== null ? (
                        <div className={styles.priceSale}>
                          <span className={styles.priceOld}>${p.regular}</span>
                          <span className={styles.priceNew}>${p.sale}</span>
                        </div>
                      ) : (
                        <span className={styles.priceRegular}>
                          ${p?.regular}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className={styles.bonusNote}>
                  💡 Buy 2g get 1g FREE = {prices[0]?.label} for ${prices[0]?.p?.sale ?? prices[0]?.p?.regular}
                </div>
              </div>

              {/* ── Quick info ── */}
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Type</span>
                  <span className={styles.infoValue}>{typeName}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>THC</span>
                  <span className={styles.infoValue}>{flower.thc}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Tier</span>
                  <span className={styles.infoValue} style={{ color: tierColor }}>{tierName}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>SKU</span>
                  <span className={styles.infoValue}>{flower.sku}</span>
                </div>
              </div>

              <div className={styles.visitCta}>
                <p>Available in-store · Walk-in welcome · No appointment needed</p>
              </div>
            </div>
          </div>

          {/* ── Related strains ── */}
          {related.length > 0 && (
            <section className={styles.related}>
              <h2 className={styles.relatedTitle}>
                More{" "}
                <span style={{ color: tierColor }}>{tierName}</span> Strains
              </h2>
              <div className={styles.relatedWrap}>
                <div className={styles.relatedScroll}>
                  {related.map((r) => (
                    <Link
                      key={r.sku}
                      href={`/flower/${r.slug}`}
                      className={styles.relatedCard}
                    >
                      <div className={styles.relatedImg}>
                        {r.image ? (
                          <img src={r.image} alt={r.name} loading="lazy" />
                        ) : (
                          <span>{r.name[0]}</span>
                        )}
                      </div>
                      <div className={styles.relatedBody}>
                        <h3>{r.name}</h3>
                        <span className={styles.relatedThc}>THC {r.thc}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                {related.length > 4 && (
                  <div className={styles.scrollFade}>
                    <span className={styles.scrollArrow}>&#8250;</span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
