import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  getItemsByCategory,
  getCategoryFromSlug,
  CATEGORY_CONFIG,
  type ItemProduct,
} from "../../lib/products";
import styles from "./items.module.css";

/* ── Generate all category pages ── */
export function generateStaticParams() {
  return Object.values(CATEGORY_CONFIG).map((c) => ({ category: c.slug }));
}

/* ── SEO ── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: catSlug } = await params;
  const catInfo = getCategoryFromSlug(catSlug);
  if (!catInfo) return {};
  const items = getItemsByCategory(catInfo.key);

  return {
    title: catInfo.config.seoTitle || `${catInfo.config.name} — ${items.length} Products`,
    description: catInfo.config.seoIntro || `Shop ${items.length} ${catInfo.config.name.toLowerCase()} at Spirit Corner Cannabis.`,
  };
}

export default async function ItemsCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: catSlug } = await params;
  const catInfo = getCategoryFromSlug(catSlug);
  if (!catInfo) notFound();

  /* Pre-Rolls also shows accessories (ADD ONS) */
  let items = getItemsByCategory(catInfo.key);
  if (catInfo.key === "PREROLLS") {
    const accessories = getItemsByCategory("ADD ONS");
    items = [...items, ...accessories];
  }
  const { config } = catInfo;

  return (
    <main className={styles.main}>
      <Navbar />

      {/* Hero */}
      <section className={styles.hero} style={{ "--cat-color": config.color } as React.CSSProperties}>
        <div className={styles.heroContent}>
          <span className={styles.heroIcon}>{config.icon}</span>
          <h1 className={styles.heroTitle}>
            <span style={{ color: config.color }}>{config.name}</span>
          </h1>
          <p className={styles.heroSub}>{items.length} products available</p>
          <p className={styles.heroIntro}>{config.seoIntro}</p>
        </div>
      </section>

      {/* Product Grid */}
      <section className={styles.products}>
        <div className={styles.container}>
          {items.length > 0 ? (
            <div className={styles.grid}>
              {items.map((item) => (
                <ItemCard key={item.sku} item={item} catColor={config.color} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🌱</span>
              <h3>Coming Soon</h3>
              <p>We&apos;re stocking this category. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* SEO Content */}
      <section className={styles.seoSection}>
        <div className={styles.container}>
          <h2 className={styles.seoTitle}>{config.seoTitle}</h2>
          <p className={styles.seoBody}>{config.seoDescription}</p>

          {/* FAQ */}
          {config.faqs.length > 0 && (
            <div className={styles.faqBlock}>
              <h3 className={styles.faqTitle}>Frequently Asked Questions</h3>
              {config.faqs.map((faq, i) => (
                <details key={i} className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>{faq.q}</summary>
                  <p className={styles.faqAnswer}>{faq.a}</p>
                </details>
              ))}
            </div>
          )}

          {/* Visit CTA */}
          <div className={styles.visitCta}>
            <h3 className={styles.visitTitle}>Visit Spirit Corner Cannabis</h3>
            <p className={styles.visitText}>
              251 Dalhousie St, Ottawa, ON K1N 1E7 · Open 24 Hours
            </p>
            <a
              href="https://maps.app.goo.gl/yVDY1PZ8qSwAjQ6s6"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.visitBtn}
            >
              📍 Get Directions
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function ItemCard({ item, catColor }: { item: ItemProduct; catColor: string }) {
  return (
    <div className={styles.card} style={{ "--cat-color": catColor } as React.CSSProperties}>
      <div className={styles.cardMedia}>
        {item.image ? (
          <img src={item.image} alt={item.name} loading="lazy" className={styles.cardImg} />
        ) : (
          <div className={styles.cardPlaceholder}>
            {item.name[0]}
          </div>
        )}
        <div className={styles.cardBadges}>
          {item.thc && <span className={styles.badgeThc}>{item.thc}</span>}
          {item.mg && <span className={styles.badgeMg}>{item.mg}</span>}
        </div>
      </div>
      <div className={styles.cardBody}>
        <span className={styles.cardCategory}>{item.category}</span>
        <h3 className={styles.cardName}>{item.name}</h3>
        {item.price && (
          <div className={styles.cardPrice}>
            <span className={styles.priceVal}>{item.price.startsWith('$') ? item.price : `$${item.price}`}</span>
            <span className={styles.priceUnit}>each</span>
          </div>
        )}
        <span className={styles.skuTag}>SKU {item.sku}</span>
      </div>
    </div>
  );
}
