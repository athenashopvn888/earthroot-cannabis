"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import styles from "./tv.module.css";

/* ── Types ── */
interface PricePoint { regular: number; sale: number | null; }
interface Flower {
  sku: string; name: string; tier: string; type: "indica"|"sativa"|"hybrid";
  isHot: boolean; isSale: boolean; isMustTry?: boolean; thc: string;
  price3g: PricePoint|null; price5g: PricePoint|null;
  price14g: PricePoint|null; price28g: PricePoint|null;
  image: string; promoImage?: string|null;
}
interface Item {
  sku: string; name: string; category: string; type: string;
  thc: string; mg: string; price: string; image: string;
}

/* ── Constants ── */
const TIER_ACCENT: Record<string,string> = {
  EXOTIC:"#dc2626", PREMIUM:"#f97316", "AAA+":"#2563eb",
  AA:"#ea580c", BUDGET:"#16a34a", OZ:"#db2777"
};
const TIER_CROWN: Record<string,string> = {
  EXOTIC:"👑", PREMIUM:"👑", "AAA+":"👑", AA:"🏅", BUDGET:"💰", OZ:"🎯"
};
const TIER_UNIT: Record<string,string> = {
  EXOTIC:"$20/G", PREMIUM:"$15/G", "AAA+":"$10/G", AA:"$5/G", BUDGET:"$3.33/G"
};
const TIER_DEAL: Record<string,string> = {
  EXOTIC:"Buy 3g Get 3 FREE", PREMIUM:"Buy 3g Get 3 FREE",
  "AAA+":"Buy 3g Get 3 FREE", BUDGET:"Buy 2g Get 1g FREE"
};


/* ── Helpers ── */
function fmtTHC(v: string): string {
  const s = String(v||"").trim(); if (!s) return "";
  const n = parseFloat(s);
  if (!isNaN(n)) return (n <= 1 ? Math.round(n*100) : Math.round(n)) + "%";
  return s;
}

/* ── Price cell with strikethrough for sale ── */
function PriceCell({ pp, color }: { pp: PricePoint|null; color?: string }) {
  if (!pp) return <span>—</span>;
  if (pp.sale !== null && pp.sale !== pp.regular) {
    return (
      <span>
        <span className={styles.oldPrice}>${pp.regular}</span>
        <b className={`${styles.salePrice} ${color || ''}`}>${pp.sale}</b>
      </span>
    );
  }
  return <b className={color || ''}>${pp.regular}</b>;
}

/* ── Type badge component ── */
function TypeTag({ type }: { type: string }) {
  const t = type?.toLowerCase();
  const label = t === "sativa" ? "SAT" : t === "indica" ? "IND" : t === "hybrid" ? "HYB" : "";
  if (!label) return null;
  const cls = t === "sativa" ? styles.tagSat : t === "indica" ? styles.tagInd : styles.tagHyb;
  return <span className={`${styles.tag} ${cls}`}>{label}</span>;
}

/* ── Effect icons (inline, small — for rows) ── */
function EffectIcons({ type }: { type: string }) {
  const t = type?.toLowerCase();
  if (t === "indica") return <span className={styles.effectIcons}>🛋️😌🌙</span>;
  if (t === "sativa") return <span className={styles.effectIcons}>⚡🧠☀️</span>;
  if (t === "hybrid") return <span className={styles.effectIcons}>🧘‍♂️🌿✨</span>;
  return null;
}

/* ── Vibe card (big effects section — below detail card) ── */
const VIBE_MAP: Record<string, [string,string][]> = {
  indica: [["🛋️","Couch Lock"],["😌","Relax"],["🌙","Sleepy"]],
  sativa: [["⚡","Energy"],["🧠","Cerebral"],["🚀","Uplift"]],
  hybrid: [["🧘‍♂️","Balance"],["🌿","Calm"],["✨","Creative"]],
};
function VibeCard({ type }: { type: string }) {
  const t = type?.toLowerCase();
  const vibes = VIBE_MAP[t] || VIBE_MAP.hybrid;
  return (
    <div className={styles.vibeSection}>
      <div className={styles.vibeHead}>EFFECTS</div>
      <div className={styles.vibePills}>
        {vibes.map(([emoji, label]) => (
          <span key={label} className={styles.vibePill}>
            <span className={styles.vibeEmoji}>{emoji}</span>
            <span className={styles.vibeLabel}>{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Helpers: Shreds detection + sale/hot derivation ── */
function isShreds(name: string): boolean {
  return /shred/i.test(name);
}
function hasSalePrice(f: Flower): boolean {
  return !!(f.price3g?.sale || f.price5g?.sale || f.price14g?.sale || f.price28g?.sale);
}
function hasNameSale(name: string): boolean {
  return /\bSALE\b/i.test(name) || /ON\s*SALE/i.test(name);
}
function cleanName(name: string): string {
  // Strip trailing sale/hot markers from display name
  return name
    .replace(/\s*\(?\s*AAA\+?\s*ON\s*SALE\s*\)?\s*$/i, '')
    .replace(/\s*\(?\s*AAA\+?\s*SALE!?\s*\)?\s*$/i, '')
    .replace(/\s*\bSALE!?\s*$/i, '')
    .replace(/\s*\bON\s*SALE\s*$/i, '')
    .trim();
}

/* ══════════════════════════════════════════════
   FLOWER CARD — Exotic/Premium/AAA+/AA/Budget
   ══════════════════════════════════════════════ */
function FlowerCard({
  tier, flowers, hiIdx, cardCls, tierCls, badgeCls
}: {
  tier: string; flowers: Flower[]; hiIdx: number;
  cardCls: string; tierCls: string; badgeCls: string;
}) {
  const accent = TIER_ACCENT[tier] || "#2563eb";

  /* ── SALE items pinned to top, rest rotate ── */
  const MAX = 10;
  const saleItems = flowers.filter(f => f.isSale);
  const nonSale = flowers.filter(f => !f.isSale);
  const nonSaleSlots = Math.max(0, MAX - saleItems.length);
  // Rotate non-sale items: window offset based on hiIdx cycling past sale count
  const nsOffset = nonSale.length > nonSaleSlots
    ? Math.floor(Math.max(0, hiIdx - saleItems.length) / Math.max(1, nonSaleSlots)) * nonSaleSlots % nonSale.length
    : 0;
  const nonSaleWindow = nonSale.length > nonSaleSlots
    ? Array.from({length: nonSaleSlots}, (_, i) => nonSale[(nsOffset + i) % nonSale.length])
    : nonSale;
  const vis = [...saleItems, ...nonSaleWindow].slice(0, MAX);
  const hiW = Math.min(hiIdx % vis.length, vis.length - 1);
  const hi = vis[hiW] || flowers[0];

  /* prevHi for dissolve */
  const prevRef = useRef<string>("");
  const [fadeImg, setFadeImg] = useState("");
  const [prevImg, setPrevImg] = useState("");

  useEffect(() => {
    if (hi?.image && hi.image !== prevRef.current) {
      setPrevImg(prevRef.current);
      setFadeImg(hi.image);
      prevRef.current = hi.image;
    }
  }, [hi?.image]);

  const isTop3 = ["EXOTIC","PREMIUM","AAA+"].includes(tier);
  const isAA = tier === "AA";

  return (
    <div className={`${styles.card} ${cardCls} ${tierCls}`}>
      {/* HEADER */}
      <div className={`${styles.cardHeader} ${isTop3 ? styles.headerSheen : ""}`}
        style={{ background:`linear-gradient(180deg, ${accent} 0%, color-mix(in srgb, ${accent} 82%, #000 18%) 100%)` }}>
        <span className={styles.tierCrown}>{TIER_CROWN[tier]||"🌿"}</span>
        <span className={styles.headerTitle}>
          {isTop3 ? (
            <div className={styles.dealScroller}>
              <span className={styles.dealScrollInner}>
                <span>Buy 2g Get 1g FREE</span>
                <span>Buy 3g Get 3g FREE</span>
              </span>
            </div>
          ) : isAA ? <span className={styles.headerDeal}>$20 5g AA</span>
            : TIER_DEAL[tier] ? <span className={styles.headerDeal}>{TIER_DEAL[tier]}</span> : null}
        </span>
        <div className={`${styles.tierBadge} ${badgeCls}`}>
          <span>{tier} {TIER_UNIT[tier]}</span>
        </div>
      </div>

      {/* BODY */}
      <div className={styles.cardBody}>
        {/* LEFT: Image + Detail */}
        <div className={styles.mediaSide}>
          <div className={styles.mediaFrame}>
            <div className={styles.mediaViewport}>
              {hi?.isSale && <div className={styles.saleBadge}>SALE</div>}
              {hi?.isHot && <div className={styles.topPickBadge}>TOP PICK</div>}
              {hi?.thc && <div className={styles.imgThcBadge}>{fmtTHC(hi.thc)}</div>}
              {prevImg && (
                <img src={prevImg} alt="" className={`${styles.budImg} ${styles.budImgFadeOut}`}
                  referrerPolicy="no-referrer" />
              )}
              {fadeImg && (
                <img key={fadeImg} src={fadeImg} alt={hi?.name||""}
                  className={`${styles.budImg} ${styles.budImgFadeIn}`}
                  referrerPolicy="no-referrer" />
              )}
              {hi?.type && (
                <div className={styles.imgTypeBadge}>
                  <span className={`${styles.imgType} ${
                    hi.type === "sativa" ? styles.imgTypeSat :
                    hi.type === "indica" ? styles.imgTypeInd : styles.imgTypeHyb
                  }`}>{hi.type.toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Detail card */}
          <div className={styles.detailCard}>
            <div className={styles.detailAccent} style={{ background: accent }} />
            <div className={styles.detailName}>{hi?.name || ""}</div>
            <div className={styles.detailMeta}>
              {hi?.thc && <span className={styles.detailThc}>{fmtTHC(hi.thc)}</span>}
              {hi?.price3g && <><span className={styles.detailSep}>•</span><span>3g <b>${hi.price3g.sale ?? hi.price3g.regular}</b></span></>}
              {hi?.price5g && <><span className={styles.detailSep}>•</span><span>5g <b>${hi.price5g.sale ?? hi.price5g.regular}</b></span></>}
              {hi?.price14g && <><span className={styles.detailSep}>•</span><span>14g <b>${hi.price14g.sale ?? hi.price14g.regular}</b></span></>}
            </div>
          </div>

          {/* Vibe / Effects section — dedicated card with BIG emojis + labels */}
          {hi?.type && <VibeCard type={hi.type} />}
        </div>

        {/* RIGHT: List */}
        <div className={styles.listSide}>
          {/* Deal strip — ABOVE list header (top 3 only) */}
          {isTop3 && (
            <div className={styles.dealStrip}>
              {/* Box A: 3G TOTAL → Buy 2g → Get 1g FREE → 3G TOTAL */}
              <div className={`${styles.dealBox} ${styles.dealBoxA}`}>
                <span className={styles.dealRotClip}>
                  <span className={`${styles.dealRotTrack} ${styles.dealTrackA}`}>
                    <span className={`${styles.dealRotLine} ${styles.dealTotal} ${styles.dealTotalGold}`}>3G TOTAL</span>
                    <span className={`${styles.dealRotLine} ${styles.dealBase}`}>Buy 2g</span>
                    <span className={`${styles.dealRotLine} ${styles.dealFree} ${styles.dealFreeGreen}`}>Get 1g FREE</span>
                    <span className={`${styles.dealRotLine} ${styles.dealTotal} ${styles.dealTotalGold}`}>3G TOTAL</span>
                  </span>
                </span>
              </div>
              {/* Box B: 6G TOTAL → Buy 3g → Get 3g FREE → 6G TOTAL (bigger, red glow) */}
              <div className={`${styles.dealBox} ${styles.dealBoxB} ${styles.dealBoxBig}`}>
                <span className={styles.dealRotClip}>
                  <span className={`${styles.dealRotTrack} ${styles.dealTrackB}`}>
                    <span className={`${styles.dealRotLine} ${styles.dealTotal} ${styles.dealTotalRed}`}>6G TOTAL</span>
                    <span className={`${styles.dealRotLine} ${styles.dealBase}`}>Buy 3g</span>
                    <span className={`${styles.dealRotLine} ${styles.dealFree} ${styles.dealFreeGreen}`}>Get 3g FREE</span>
                    <span className={`${styles.dealRotLine} ${styles.dealTotal} ${styles.dealTotalRed}`}>6G TOTAL</span>
                  </span>
                </span>
              </div>
            </div>
          )}


          {/* Column headers */}
          {isTop3 ? (
            <div className={`${styles.listHead} ${styles.tTop3}`}>
              <div className={styles.mh}>Strain</div>
              <div className={styles.mh}>THC</div>
              <div className={styles.mh}>Price</div>
            </div>
          ) : isAA ? (
            <div className={`${styles.listHead} ${styles.tAA}`}>
              <div className={styles.mh}>Strain</div>
              <div className={styles.mh}>THC</div>
              <div className={styles.mh}>Price</div>
            </div>
          ) : (
            <div className={`${styles.listHead} ${styles.tBudget}`}>
              <div className={styles.mh}>Strain</div>
              <div className={styles.mh}>THC</div>
              <div className={styles.mh}>Price</div>
            </div>
          )}

          {vis.map((f, i) => {
            const isHi = i === hiW;
            const hiStyle = isHi ? {
              borderColor: `color-mix(in srgb, ${accent} 70%, rgba(2,6,23,.18) 30%)`,
              boxShadow: `0 0 0 3px color-mix(in srgb, ${accent} 50%, transparent 50%), 0 8px 20px rgba(2,6,23,.18), 0 0 28px color-mix(in srgb, ${accent} 70%, transparent 30%)`
            } : undefined;

            if (isTop3) {
              const p3 = f.price3g; const p5 = f.price5g;
              return (
                <div key={f.sku+i} className={`${styles.row} ${styles.tTop3} ${isHi?styles.rowHi:""}${f.isSale?" "+styles.rowSale:""}`} style={hiStyle}>
                  <div className={`${styles.mc} ${styles.mcStrain}`}>
                    {f.name}
                    {f.isSale && <span className={`${styles.tag} ${styles.tagSale}`}>SALE</span>}
                    {f.isHot && <span className={`${styles.tag} ${styles.tagHot}`}>TOP PICK</span>}
                    {f.isMustTry && <span className={`${styles.tag} ${styles.tagMust}`}>MUST TRY</span>}
                    <TypeTag type={f.type} />
                  </div>
                  <div className={`${styles.mc} ${styles.mcThc}`}>{fmtTHC(f.thc)}</div>
                  {/* Price: 2 rows — 2G=3G line + 3G=6G line */}
                  <div className={`${styles.mc} ${styles.mcPrice} ${styles.mcPriceDeal}`}>
                    {p3 && (
                      <div className={styles.pLine}>
                        <span className={styles.pLab}>{f.isSale ? "3G=" : "2G-3G"}</span>
                        <PriceCell pp={p3} color={styles.priceGreen} />
                      </div>
                    )}
                    {p5 && (
                      <div className={styles.pLine}>
                        <span className={styles.pLab}>{f.isSale ? "6G=" : "3G-6G"}</span>
                        <PriceCell pp={p5} color={styles.priceBlue} />
                      </div>
                    )}
                    {!p3 && !p5 && f.price14g && (
                      <div className={styles.pLine}>
                        <span className={styles.pLab}>14G</span>
                        <PriceCell pp={f.price14g} color={styles.priceBlue} />
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            if (isAA) {
              return (
                <div key={f.sku+i} className={`${styles.row} ${styles.tAA} ${isHi?styles.rowHi:""}${f.isSale?" "+styles.rowSale:""}`} style={hiStyle}>
                  <div className={`${styles.mc} ${styles.mcStrain}`}>
                    {f.name}
                    {f.isSale && <span className={`${styles.tag} ${styles.tagSale}`}>SALE</span>}
                    {f.isHot && <span className={`${styles.tag} ${styles.tagHot}`}>TOP PICK</span>}
                    {f.isMustTry && <span className={`${styles.tag} ${styles.tagMust}`}>MUST TRY</span>}
                    <TypeTag type={f.type} />
                  </div>
                  <div className={`${styles.mc} ${styles.mcThc}`}>{fmtTHC(f.thc)}</div>
                  <div className={`${styles.mc} ${styles.mcPrice} ${styles.mcPriceDeal}`}>
                    {f.price5g && (
                      <div className={styles.pLine}>
                        <span className={styles.pLab}>5g</span>
                        <PriceCell pp={f.price5g} color={styles.priceGreen} />
                      </div>
                    )}
                    {f.price14g && (
                      <div className={styles.pLine}>
                        <span className={styles.pLab}>14g</span>
                        <PriceCell pp={f.price14g} color={styles.priceBlue} />
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // BUDGET
            return (
              <div key={f.sku+i} className={`${styles.row} ${styles.tBudget} ${isHi?styles.rowHi:""}${f.isSale?" "+styles.rowSale:""}`} style={hiStyle}>
                <div className={`${styles.mc} ${styles.mcStrain}`}>
                  {f.name}
                  {f.isSale && <span className={`${styles.tag} ${styles.tagSale}`}>SALE</span>}
                  {f.isHot && <span className={`${styles.tag} ${styles.tagHot}`}>TOP PICK</span>}
                  {f.isMustTry && <span className={`${styles.tag} ${styles.tagMust}`}>MUST TRY</span>}
                  <TypeTag type={f.type} />
                </div>
                <div className={`${styles.mc} ${styles.mcThc}`}>{fmtTHC(f.thc)}</div>
                <div className={`${styles.mc} ${styles.mcPrice} ${styles.mcPriceDeal}`}>
                  {f.price3g && (
                    <div className={styles.pLine}>
                      <span className={styles.pLab}>3g</span>
                      <PriceCell pp={f.price3g} color={styles.priceGreen} />
                    </div>
                  )}
                  {f.price28g && (
                    <div className={styles.pLine}>
                      <span className={styles.pLab}>oz</span>
                      <PriceCell pp={f.price28g} color={styles.pricePink} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   OZ CARD — $40 up OZ (Budget flowers with 28g)
   Sativa/Indica split like the original
   ══════════════════════════════════════════════ */
function OZCard({ flowers, hiIdx }: { flowers: Flower[]; hiIdx: number }) {
  const accent = "#db2777";
  const sativa = flowers.filter(f => f.type === "sativa");
  const indica = flowers.filter(f => f.type !== "sativa"); // indica + hybrid
  const hi = flowers[hiIdx] || flowers[0];

  const prevRef = useRef<string>("");
  const [fadeImg, setFadeImg] = useState("");
  const [prevImg, setPrevImg] = useState("");
  useEffect(() => {
    if (hi?.image && hi.image !== prevRef.current) {
      setPrevImg(prevRef.current);
      setFadeImg(hi.image);
      prevRef.current = hi.image;
    }
  }, [hi?.image]);

  return (
    <div className={`${styles.card} ${styles.cardOz} ${styles.tierOz}`}>
      <div className={`${styles.cardHeader}`}
        style={{ background:`linear-gradient(180deg, ${accent} 0%, color-mix(in srgb, ${accent} 82%, #000 18%) 100%)` }}>
        <span className={styles.tierCrown}>🎯</span>
        <span className={styles.headerTitle}><span className={styles.headerDeal}>$40 up OZ</span></span>
        <div className={`${styles.tierBadge} ${styles.tierBadgeOz}`}><span>OZ</span></div>
      </div>

      <div className={styles.ozBody}>
        {/* Top: Image + Detail */}
        <div className={styles.ozTop}>
          <div className={styles.ozImgWrap}>
            <div className={styles.mediaViewport}>
              {hi?.isHot && <div className={styles.topPickBadge}>TOP PICK</div>}
              {prevImg && <img src={prevImg} alt="" className={`${styles.budImg} ${styles.budImgFadeOut}`} referrerPolicy="no-referrer" />}
              {fadeImg && <img key={fadeImg} src={fadeImg} alt={hi?.name||""} className={`${styles.budImg} ${styles.budImgFadeIn}`} referrerPolicy="no-referrer" />}
              {hi?.type && (
                <div className={styles.imgTypeBadge}>
                  <span className={`${styles.imgType} ${hi.type==="sativa"?styles.imgTypeSat:styles.imgTypeInd}`}>{hi.type.toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
          <div className={styles.ozDetail}>
            <div className={styles.ozDetailName}>{hi?.name||""}</div>
            <div className={styles.ozDetailMeta}>
              {hi?.thc && <span className={styles.ozDetailThc}>{fmtTHC(hi.thc)}</span>}
              {hi?.price28g && <><span className={styles.ozDetailSep}>•</span><span className={styles.ozDetailPrice}>oz <b>${hi.price28g.sale ?? hi.price28g.regular}</b></span></>}
            </div>
            {hi?.type && <VibeCard type={hi.type} />}
          </div>
        </div>

        {/* Bottom: Sativa | Indica columns */}
        <div className={styles.ozCols}>
          <div className={styles.ozCol}>
            <div className={styles.ozColHead}>SATIVA</div>
            <div className={styles.ozColHeadSub}>
              <span>Strain</span><span>OZ</span>
            </div>
            {sativa.length === 0 && <div className={styles.ozEmpty}>—</div>}
            {sativa.map((f,i) => (
              <div key={f.sku+i} className={`${styles.ozRow} ${f===hi?styles.ozRowHi:""}`}>
                <span className={styles.ozName}>
                  {f.name}
                  {f.isSale && <span className={`${styles.tag} ${styles.tagSale}`}>SALE</span>}
                  {f.isHot && <span className={`${styles.tag} ${styles.tagHot}`}>TOP PICK</span>}
                  {f.isMustTry && <span className={`${styles.tag} ${styles.tagMust}`}>MUST TRY</span>}
                  <TypeTag type={f.type} />
                  <span style={{fontSize:14,opacity:0.6,marginLeft:4}}>{fmtTHC(f.thc)}</span>
                </span>
                <span className={styles.ozPrice}>${f.price28g?.sale ?? f.price28g?.regular ?? "—"}</span>
              </div>
            ))}
          </div>
          <div className={styles.ozCol}>
            <div className={styles.ozColHead}>INDICA</div>
            <div className={styles.ozColHeadSub}>
              <span>Strain</span><span>OZ</span>
            </div>
            {indica.map((f,i) => (
              <div key={f.sku+i} className={`${styles.ozRow} ${f===hi?styles.ozRowHi:""}`}>
                <span className={styles.ozName}>
                  {f.name}
                  {f.isSale && <span className={`${styles.tag} ${styles.tagSale}`}>SALE</span>}
                  {f.isHot && <span className={`${styles.tag} ${styles.tagHot}`}>TOP PICK</span>}
                  {f.isMustTry && <span className={`${styles.tag} ${styles.tagMust}`}>MUST TRY</span>}
                  <TypeTag type={f.type} />
                  <span style={{fontSize:14,opacity:0.6,marginLeft:4}}>{fmtTHC(f.thc)}</span>
                </span>
                <span className={styles.ozPrice}>${f.price28g?.sale ?? f.price28g?.regular ?? "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ADDONS CARD — Hero image + list (right rail)
   ══════════════════════════════════════════════ */
function AddOnsCard({ items, hiIdx }: { items: Item[]; hiIdx: number }) {
  const hi = items[hiIdx] || items[0];

  const prevRef = useRef<string>("");
  const [fadeImg, setFadeImg] = useState("");
  const [prevImg, setPrevImg] = useState("");
  useEffect(() => {
    if (hi?.image && hi.image !== prevRef.current) {
      setPrevImg(prevRef.current);
      setFadeImg(hi.image);
      prevRef.current = hi.image;
    }
  }, [hi?.image]);

  return (
    <div className={`${styles.card} ${styles.cardAddons}`}>
      <div className={styles.cardHeader}
        style={{ background:"linear-gradient(180deg, #16a34a 0%, #0d7a38 100%)", fontSize:28, justifyContent:"center" }}>
        ADD ONS
      </div>
      <div className={styles.addonsBody}>
        {/* Hero section */}
        <div className={styles.addonsHero}>
          <div className={styles.addonsHeroImg}>
            <div className={styles.mediaViewport}>
              {prevImg && <img src={prevImg} alt="" className={`${styles.budImg} ${styles.budImgFadeOut}`} referrerPolicy="no-referrer" />}
              {fadeImg && <img key={fadeImg} src={fadeImg} alt={hi?.name||""} className={`${styles.budImg} ${styles.budImgFadeIn}`} referrerPolicy="no-referrer" />}
            </div>
          </div>
          <div className={styles.addonsDetailCard}>
            <div className={styles.addonsDetailName}>{hi?.name||""}</div>
            <div className={styles.addonsDetailPrice}>PRICE {(hi?.price||'').replace(/\[object.*\]/,'')}</div>
            <div className={styles.effectIcons}>
              {hi?.name?.includes("SAT") ? "⚡🧠☀️" : hi?.name?.includes("IND") ? "🛋️😌🌙" : "🧘‍♂️🌿✨"}
            </div>
          </div>
        </div>

        {/* List */}
        <div className={styles.addonsListHead}>
          <span>ITEM</span><span>PRICE</span>
        </div>
        <div className={styles.addonsList}>
          {items.map((it,i) => (
            <div key={it.sku+i} className={`${styles.addonRow} ${i===hiIdx?styles.addonRowHi:""}`}
              style={i===hiIdx ? {borderColor:"rgba(34,197,94,.55)", boxShadow:"0 0 0 2px rgba(34,197,94,.35), 0 6px 16px rgba(2,6,23,.15)"} : undefined}>
              {it.image && <img src={it.image} alt={it.name} className={styles.addonImg} referrerPolicy="no-referrer" />}
              <div className={styles.addonInfo}>
                <div className={styles.addonName}>{it.name}</div>
                <div className={styles.addonPrice}>{(it.price||'').replace(/\[object.*\]/,'')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   VERTICAL TICKER — slides up, 3s per section
   ══════════════════════════════════════════════ */
const TICKER_SLIDES = [
  🔥  — ,
  200+ Strains In Stock,
  Open 24 Hours,
  ALL SALES ARE FINAL,
  🎮 Play Games at /games,
];

function VerticalTicker() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [exitIdx, setExitIdx] = useState(-1);

  useEffect(() => {
    const iv = setInterval(() => {
      setExitIdx(activeIdx);
      setActiveIdx(prev => (prev + 1) % TICKER_SLIDES.length);
    }, 3000);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  return (
    <div className={styles.ticker}>
      <div className={styles.tickerInner}>
        {TICKER_SLIDES.map((text, i) => (
          <div key={i} className={`${styles.tickerSlide} ${i === activeIdx ? styles.tickerActive : ""} ${i === exitIdx ? styles.tickerExit : ""}`}>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN TV PAGE
   ═══════════════════════════════════════ */
export default function TVMenuPage() {
  const [flowers, setFlowers] = useState<Record<string,Flower[]>>({});
  const [ozFlowers, setOzFlowers] = useState<Flower[]>([]);
  const [addOns, setAddOns] = useState<Item[]>([]);
  const [highlights, setHighlights] = useState<Record<string,number>>({});
  const [lastUpdate, setLastUpdate] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  const TIERS = ["EXOTIC","PREMIUM","AAA+","AA","BUDGET"];

  const loadData = useCallback(async () => {
    try {
      const [fRes, iRes] = await Promise.all([
        fetch("/api/tv-data?type=flowers"),
        fetch("/api/tv-data?type=items"),
      ]);
      const fData: Flower[] = fRes.ok ? await fRes.json() : [];
      const iData: Item[] = iRes.ok ? await iRes.json() : [];

      // Derive sale flag from prices or name, clean display names
      for (const f of fData) {
        if (!f.isSale && (hasSalePrice(f) || hasNameSale(f.name))) f.isSale = true;
        f.name = cleanName(f.name);
      }

      const grouped: Record<string,Flower[]> = {};
      for (const f of fData) {
        const t = String(f.tier||"").toUpperCase();
        if (!grouped[t]) grouped[t] = [];
        grouped[t].push(f);
      }

      // OZ = Budget flowers with price28g (includes Shreds)
      const oz = (grouped["BUDGET"]||[]).filter(f => f.price28g);
      setOzFlowers(oz);

      // Remove Shreds from Budget list (they belong in OZ only)
      if (grouped["BUDGET"]) {
        grouped["BUDGET"] = grouped["BUDGET"].filter(f => !isShreds(f.name));
      }
      setFlowers(grouped);

      // AddOns = ADD ONS + PREROLLS merged
      setAddOns(iData.filter(it => it.category === "ADD ONS" || it.category === "PREROLLS").slice(0, 14));

      const hi: Record<string,number> = {};
      for (const t of TIERS) hi[t] = 0;
      hi["OZ"] = 0; hi["ADDONS"] = 0;
      setHighlights(hi);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) { console.warn("[TV] Load failed:", err); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fitToScreen = useCallback(() => {
    if (!wrapRef.current) return;
    const W = window.innerWidth, H = window.innerHeight;
    const s = Math.min(W / 3840, H / 2160);
    const tx = Math.round((W - 3840*s)/2);
    const ty = Math.round((H - 2160*s)/2);
    wrapRef.current.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
  }, []);

  useEffect(() => {
    loadData(); fitToScreen();
    window.addEventListener("resize", fitToScreen);
    const refresh = setInterval(loadData, 5*60*1000);
    return () => { window.removeEventListener("resize", fitToScreen); clearInterval(refresh); };
  }, [loadData, fitToScreen]);

  useEffect(() => {
    if (!Object.keys(flowers).length) return;
    const interval = setInterval(() => {
      setHighlights(prev => {
        const next = {...prev};
        for (const t of TIERS) { next[t] = ((prev[t]||0)+1) % Math.max(1, flowers[t]?.length||1); }
        next["OZ"] = ((prev["OZ"]||0)+1) % Math.max(1, ozFlowers.length);
        next["ADDONS"] = ((prev["ADDONS"]||0)+1) % Math.max(1, addOns.length);
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [flowers, ozFlowers, addOns]);

  const CM: Record<string,{c:string;t:string;b:string}> = {
    EXOTIC:{c:styles.cardExotic,t:styles.tierExotic,b:styles.tierBadgeExotic},
    PREMIUM:{c:styles.cardPremium,t:styles.tierPremium,b:styles.tierBadgePremium},
    "AAA+":{c:styles.cardAaa,t:styles.tierAaa,b:styles.tierBadgeAaa},
    AA:{c:styles.cardAa,t:styles.tierAa,b:styles.tierBadgeAa},
    BUDGET:{c:styles.cardBudget,t:styles.tierBudget,b:styles.tierBadgeBudget},
  };

  return (
    <div className={styles.tvPage}>
      {/* Floating particles */}
      <div className={styles.particles}>
        {Array.from({length: 25}, (_, i) => {
          const size = 4 + Math.random() * 8;
          const colors = ['rgba(220,38,38,.12)','rgba(245,158,11,.10)','rgba(59,130,246,.10)','rgba(16,185,129,.08)','rgba(168,85,247,.08)'];
          const color = colors[i % colors.length];
          return (
            <span key={i} className={styles.dot} style={{
              width: size, height: size,
              left: `${5 + Math.random() * 90}%`,
              background: color,
              boxShadow: `0 0 ${size*3}px ${color}`,
              animationDuration: `${18 + Math.random() * 22}s`,
              animationDelay: `${-Math.random() * 25}s`,
            }} />
          );
        })}
      </div>
      <div className={styles.wrap} ref={wrapRef}>

        {/* TITLE BAR REMOVED — more room for cards */}
        {/* GRID */}
        <div className={styles.stage}>
          <div className={styles.grid}>
            {/* Row 1: EXOTIC, PREMIUM, AAA+ */}
            {TIERS.slice(0,3).map(tier => (
              <FlowerCard key={tier} tier={tier} flowers={flowers[tier]||[]} hiIdx={highlights[tier]||0}
                cardCls={CM[tier].c} tierCls={CM[tier].t} badgeCls={CM[tier].b} />
            ))}
            {/* ADDONS right rail */}
            <AddOnsCard items={addOns} hiIdx={highlights["ADDONS"]||0} />
            {/* Row 2: AA, BUDGET, OZ */}
            {TIERS.slice(3).map(tier => (
              <FlowerCard key={tier} tier={tier} flowers={flowers[tier]||[]} hiIdx={highlights[tier]||0}
                cardCls={CM[tier].c} tierCls={CM[tier].t} badgeCls={CM[tier].b} />
            ))}
            <OZCard flowers={ozFlowers} hiIdx={highlights["OZ"]||0} />
          </div>
        </div>

        {/* TICKER — vertical scroll, 3s per slide */}
        <VerticalTicker />
      </div>
      <div className={styles.lastUpdated}>Updated: {lastUpdate}</div>
    </div>
  );
}
