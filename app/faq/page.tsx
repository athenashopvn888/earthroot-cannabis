import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./faq.module.css";

export const metadata: Metadata = {
  title: "FAQ — Spirit Corner Cannabis | Ottawa Dispensary Questions",
  description:
    "Frequently asked questions about Spirit Corner Cannabis in Ottawa. Hours, location, products, pricing, promotions, and everything you need to know before visiting.",
};

const FAQ_CATEGORIES = [
  {
    title: "📍 Location & Hours",
    faqs: [
      { q: "Where is Spirit Corner Cannabis located?", a: "We are located at 251 Dalhousie St, Ottawa, ON K1N 1E7 — in the heart of ByWard Market. We're near the Rideau Centre, Parliament Hill, and major OC Transpo bus routes." },
      { q: "What are your hours?", a: "We are open 24 hours a day, 7 days a week, 365 days a year. Walk in anytime — no appointment needed." },
      { q: "Is there parking nearby?", a: "Yes. Free street parking is available on Dalhousie St and surrounding streets in the evenings. Paid parking lots are available nearby during the day. We're also accessible by OC Transpo and STO buses." },
      { q: "How far are you from Gatineau?", a: "We're just 5 minutes from the Portage Bridge and 7 minutes from the Macdonald-Cartier Bridge. We're one of the closest dispensaries to the Quebec border." },
      { q: "What's the best way to get to Spirit Corner?", a: "We're easily accessible by car, bus, or foot. From Rideau Centre, walk north on Dalhousie St — we're a 5-minute walk. By bus, several OC Transpo routes stop within walking distance. Free evening parking is available on surrounding streets." },
    ],
  },
  {
    title: "🌿 Products & Menu",
    faqs: [
      { q: "What products do you carry?", a: "We carry over 200 strains of cannabis flower across 5 quality tiers (Exotic, Premium, AAA+, AA, Budget), plus edibles (gummies, chocolates, baked goods), vape pens, disposable vapes, concentrates (shatter, wax, hash, diamonds, live resin), pre-rolled joints, magic mushrooms, native cigarettes, and accessories." },
      { q: "Do you have a live menu?", a: "Yes! Our online menu at spiritcornercannabis.com updates in real time with current stock, prices, THC levels, and availability. You can check what's in stock before you visit." },
      { q: "What are your flower tiers?", a: "Exotic ($10-$12/g, THC 35-39%) — ultra-rare top-shelf genetics. Premium ($7-$10/g, THC 32-34%) — connoisseur-grade. AAA+ ($5-$6/g, THC 30-32%) — heavy hitters, our most popular tier. AA ($4/g, THC 27-29%) — quality daily drivers. Budget ($3/g, THC 24-27%) — reliable value flower." },
      { q: "Do you sell edibles?", a: "Yes! We carry a variety of edibles including gummies, chocolates, baked goods, and more. THC content varies. Check our live menu for current availability." },
      { q: "Do you sell vapes?", a: "Yes — both disposable vapes and refillable vape pens. We carry both nicotine vapes and THC vapes from top brands." },
      { q: "Do you sell native cigarettes?", a: "Yes! We carry one of the widest selections of native cigarettes in downtown Ottawa, including premium and value brands in multiple varieties." },
      { q: "Do you sell magic mushrooms?", a: "Yes. We carry a selection of magic mushroom products. Visit us in-store or check our live menu for current availability." },
    ],
  },
  {
    title: "💰 Pricing & Promotions",
    faqs: [
      { q: "What is the cheapest weed you sell?", a: "Our Budget tier starts at $3/g with value ounces from $40. Our AA tier is $4/g. These are the most competitive prices you'll find in Ottawa." },
      { q: "What promotions do you offer?", a: "Every purchase includes our Buy 2g Get 1g FREE promotion — you always get a bonus gram. Our Exotic, Premium, and AAA+ tiers also offer Buy 3g Get 3g FREE, effectively doubling your order." },
      { q: "Do you have ounce deals?", a: "Yes! Budget ounces from $40, AA ounces from $90, AAA+ ounces from $100. All with freshness and quality guaranteed." },
      { q: "Do the promotions stack?", a: "The Buy 2g Get 1g FREE applies to every tier automatically. The Buy 3g Get 3g FREE applies to Exotic, Premium, and AAA+ tiers. These are our standard everyday promotions." },
      { q: "How does the tier pricing work?", a: "Each flower strain is graded into one of five quality tiers. The tier determines the per-gram price. This transparent system means you always know exactly what you're paying — no confusing markups or inconsistent pricing." },
    ],
  },
  {
    title: "🛒 Shopping & Experience",
    faqs: [
      { q: "Do I need an appointment?", a: "No! Spirit Corner Cannabis is walk-in only. Just show up anytime — we're open 24 hours." },
      { q: "Can I order online?", a: "Currently, Spirit Corner is an in-store shopping experience only. You can browse our live menu online to see what's in stock before visiting." },
      { q: "Do you offer delivery?", a: "Delivery is coming soon! Visit our delivery page to sign up for email notifications when we launch our delivery service." },
      { q: "What payment methods do you accept?", a: "We accept cash and debit. No credit cards at this time." },
      { q: "Can your staff help me choose a strain?", a: "Absolutely! Our knowledgeable budtenders are here to help. Whether you're a first-time buyer or a seasoned connoisseur, we can recommend strains based on your preferences, desired effects, and budget." },
      { q: "Is there a minimum purchase?", a: "No minimum purchase required. You can buy as little as 1 gram." },
    ],
  },
];

export default function FAQPage() {
  // JSON-LD for FAQ page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_CATEGORIES.flatMap((cat) =>
      cat.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      }))
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className={styles.main}>
        <Navbar />
        <div className={styles.content}>
          <h1 className={styles.pageTitle}>Frequently Asked Questions</h1>
          <p className={styles.pageSubtitle}>
            Everything you need to know about Spirit Corner Cannabis — Ottawa&apos;s 24-hour dispensary at 251 Dalhousie St in ByWard Market.
          </p>

          {FAQ_CATEGORIES.map((cat) => (
            <div key={cat.title} className={styles.category}>
              <h2 className={styles.categoryTitle}>{cat.title}</h2>
              {cat.faqs.map((faq) => (
                <details key={faq.q} className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>{faq.q}</summary>
                  <p className={styles.faqAnswer}>{faq.a}</p>
                </details>
              ))}
            </div>
          ))}

          <div className={styles.ctaSection}>
            <h2 className={styles.ctaTitle}>Still have questions?</h2>
            <p className={styles.ctaText}>
              Call us at <strong>(613) 612-2107</strong> or visit us at 251 Dalhousie St, Ottawa.
            </p>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=251+Dalhousie+St+Ottawa+ON"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaLink}
            >
              📍 Get Directions
            </a>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
