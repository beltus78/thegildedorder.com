const SHIP = ["US", "ZA", "KE", "CM", "CD", "ML", "TD", "CI", "SN"];
const RATES = { US: { rate: 5.95, freeOver: 50 }, INTL: { rate: 19.95, freeOver: 150 } }; // keep in sync with functions/_shipping.js
// Static site generator for The Gilded Order. Run: node build.js  → outputs ./dist (Cloudflare Pages)
// Languages: English at /, French at /fr/, Brazilian Portuguese at /pt/.
const fs = require("fs");
// Meta descriptions: max 160 chars, cut at a word boundary.
// Pad short descriptions (<110 chars) with the tagline.
const PAD2 = { en: "Questions answered on WhatsApp.", fr: "Réponses sur WhatsApp.", pt: "Atendimento no WhatsApp." };
const padDesc = (d, tag, lang = "en") => {
  if (d.length >= 110 || d === tag) return d;
  let out = d.replace(/\s*$/, "") + (/[.!?]$/.test(d) ? " " : ". ") + tag;
  if (out.length < 110) out = out.replace(/\s*$/, "") + (/[.!?]$/.test(out) ? " " : ". ") + PAD2[lang];
  return out;
};
// Fallback description for pages without their own (contact, legal…).
const SITE_DESC = {
  en: "The Gilded Order: symbol jewellery, rings, pendants and décor, a free members' club and Archive stories on the history of symbols. Questions answered on WhatsApp.",
  fr: "The Gilded Order : bijoux à symboles, bagues, pendentifs et décoration, un club de membres gratuit et des récits sur l’histoire des symboles. Réponses sur WhatsApp.",
  pt: "The Gilded Order: joias com símbolos, anéis, pingentes e decoração, um clube de membros gratuito e histórias sobre o significado dos símbolos. Atendimento no WhatsApp.",
};
// Titles over 65 chars lose the " | The Gilded Order" suffix, then a trailing " – category", then are cut at a word boundary.
const fitTitle = t => {
  if (t.length > 65) t = t.replace(/ \| The Gilded Order$/, "");
  if (t.length > 65 && t.includes(" – ")) t = t.replace(/ – [^–]*$/, "");   // drop the trailing category part
  if (t.length > 65) t = t.slice(0, 65).replace(/\s+\S*$/, "");            // last resort: cut at a word boundary
  return t;
};
const clip160 = s => (s.length <= 160 ? s : s.slice(0, 159).replace(/\s+\S*$/, "") + "…");
const path = require("path");
const cfg = require("./site.config");
const baseProducts = require("./data/products");
const { articles: baseArticles } = require("./data/content");
const I18N = require("./data/i18n");
const PT = require("./data/products.i18n");
const AT = require("./data/articles.i18n");
const COUNTRIES = require("./data/countries");

const OUT = path.join(__dirname, "dist");
const LANGS = ["en", "fr", "pt"];
const CAT_KEYS = ["rings", "pendants", "eye", "accessories", "decor"];

const slugify = s => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const wa = text => `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(text)}`;
const money = n => "$" + Number(n).toFixed(2);
baseProducts.forEach(p => { p.slug = slugify(p.name); });
const missing = baseProducts.filter(p => !PT[p.slug]).map(p => p.slug);
if (missing.length) throw new Error("Missing translations for: " + missing.join(", "));

const WA_ICON = `<svg class="wa-icon" viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.4.7 4.7 1.9 6.7L3 29l6.9-2.2c1.9 1 4 1.6 6.1 1.6 7 0 12.7-5.7 12.7-12.7S23 3 16 3zm0 23.1c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.1 1.3 1.3-4-.3-.4c-1.1-1.7-1.6-3.6-1.6-5.6C5.5 9.8 10.2 5.2 16 5.2s10.5 4.6 10.5 10.4S21.8 26.1 16 26.1zm5.8-7.8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>`;
const LOGO = `<svg class="logo-mark" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="32" cy="32" r="23" fill="none" stroke="currentColor" stroke-width="1" opacity=".6"/><path d="M32 12 L49 42 L15 42 Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M32 22 L40.5 37 L23.5 37 Z" fill="currentColor" opacity=".9"/><circle cx="32" cy="50" r="2" fill="currentColor"/></svg>`;
const SIGIL = `<svg class="hero-sigil" viewBox="0 0 400 400" aria-hidden="true"><g fill="none" stroke="currentColor"><circle cx="200" cy="200" r="190" stroke-width="1" opacity=".35"/><g class="spin-slow"><circle cx="200" cy="200" r="160" stroke-width="1.5" stroke-dasharray="2 10"/><path d="M200 40 L200 60 M200 340 L200 360 M40 200 L60 200 M340 200 L360 200" stroke-width="2"/></g><g class="spin-rev"><circle cx="200" cy="200" r="128" stroke-width="1"/><path d="M200 72 L311 264 L89 264 Z" stroke-width="1.5"/><path d="M200 328 L89 136 L311 136 Z" stroke-width="1" opacity=".5"/></g><circle class="pulse" cx="200" cy="200" r="34" stroke-width="2"/><path d="M200 168 L228 216 L172 216 Z" fill="currentColor" opacity=".8"/></g></svg>`;

const IMG_DIR = path.join(__dirname, "images", "products");
const imgCount = p => { try { return fs.readdirSync(path.join(IMG_DIR, p.slug)).filter(f => /^\d+\.jpg$/.test(f)).length; } catch { return 0; } };
const imgUrl = (p, n) => `${imgCount(p) >= n ? "" : cfg.imageBase.replace(/\/$/, "")}/products/${p.slug}/${n}.jpg`;
const caesar = s => s.replace(/[A-Z]/g, c => String.fromCharCode((c.charCodeAt(0) - 65 + 3) % 26 + 65));
const placeholderFile = lang => lang === "en" ? "/assets/placeholder.svg" : `/assets/placeholder-${lang}.svg`;

function placeholderSvg(lines) {
  const base = fs.readFileSync(path.join(__dirname, "assets", "placeholder.svg"), "utf8");
  return base.replace("PHOTOGRAPHY COMING SOON", lines[0]).replace("Ask on WhatsApp for photos of this piece", lines[1]);
}

function write(rel, html) {
  const file = path.join(OUT, rel, rel.endsWith(".html") ? "" : "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

fs.rmSync(OUT, { recursive: true, force: true });
const sitemap = [];

for (const lang of LANGS) {
  const T = I18N[lang];
  const pre = lang === "en" ? "" : `/${lang}`;
  const L = p => pre + p;                 // localise an internal link
  const CATS = Object.fromEntries(CAT_KEYS.map(k => [k, { name: T.cats[k][0], blurb: T.cats[k][1] }]));
  const products = baseProducts.map(p => lang === "en" ? p : { ...p, name: PT[p.slug][lang][0], desc: PT[p.slug][lang][1] });
  const articles = baseArticles.map(a => lang === "en" ? a : { ...a, title: AT[a.slug][lang][0], teaser: AT[a.slug][lang][1], body: AT[a.slug][lang][2] });
  const PH = placeholderFile(lang);
  // No photo on disk → point straight at the placeholder (same look as the onerror fallback, no 404 image URL in the HTML).
  const img = (p, n, cls = "") => imgCount(p) < n && !cfg.imageBase
    ? `<img class="${(cls + " is-ph").trim()}" src="${PH}" alt="${esc(p.name)} – ${T.photo} ${n}" loading="lazy">`
    : `<img class="${cls}" src="${imgUrl(p, n)}" alt="${esc(p.name)} – ${T.photo} ${n}" loading="lazy" onerror="this.onerror=null;this.src='${PH}';this.classList.add('is-ph')">`;
  const W = (rel, opts) => {
    write((pre ? lang + "/" : "") + rel, layout({ ...opts, rel }));
    if (rel.endsWith(".html") || rel === "cart" || rel === "thank-you") return;
    const pp = "/" + (rel ? rel + "/" : "");
    const alts = opts.alts || Object.fromEntries(LANGS.map(lg => [lg, (lg === "en" ? "" : "/" + lg) + pp]));
    sitemap.push({ url: cfg.siteUrl + L(pp), alts });
  };
  const jsStrings = { ...T.js, rates: RATES, shop: L("/shop/"), placeholder: PH, wa: cfg.whatsapp };

  function layout({ title, desc, body, active = "", rel, alts, ld, fullTitle }) {
    const nav = [["/shop/", T.nav.shop, "shop"], ["/membership/", T.nav.membership, "membership"], ["/archive/", T.nav.archive, "archive"], ["/about/", T.nav.about, "about"]]
      .map(([h, t, k]) => `<a href="${L(h)}" class="${active === k ? "active" : ""}">${t}</a>`).join("");
    const pagePath = rel.endsWith(".html") ? "/" : "/" + (rel ? rel + "/" : "");
    const href = lg => alts ? (alts[lg] || (lg === "en" ? "/" : "/" + lg + "/")) : (lg === "en" ? "" : "/" + lg) + pagePath;
    const selfUrl = cfg.siteUrl + (alts ? alts[lang] : href(lang));
    const switcher = `<details class="lang-dd" data-lang-dd><summary aria-label="Language"><span>${I18N[lang].short}</span><i class="caret"></i></summary><div class="lang-menu">${LANGS.map(lg => `<a href="${href(lg)}" hreflang="${I18N[lg].htmlLang}" lang="${I18N[lg].htmlLang}" class="${lg === lang ? "cur" : ""}"><span>${I18N[lg].label}</span>${lg === lang ? "<b>✓</b>" : ""}</a>`).join("")}</div></details>`;
    const altLangs = alts ? Object.keys(alts) : LANGS;
    const alt = altLangs.map(lg => `<link rel="alternate" hreflang="${I18N[lg].htmlLang}" href="${cfg.siteUrl}${href(lg)}">`).join("") + (alts ? "" : `<link rel="alternate" hreflang="x-default" href="${cfg.siteUrl}${pagePath}">`);
    return `<!DOCTYPE html>
<html lang="${T.htmlLang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${cfg.googleAdsId ? `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${cfg.googleAdsId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${cfg.googleAdsId}');
</script>` : ""}
<title>${esc(fitTitle(fullTitle || (title ? ((title + " | " + cfg.name).length > 65 ? title : title + " | " + cfg.name) : cfg.name + " — " + T.tagline)))}</title>
<meta name="description" content="${esc(clip160(desc ? padDesc(desc, T.tagline, lang) : (title ? title + " — " : "") + SITE_DESC[lang]))}">
<meta property="og:type" content="website"><meta property="og:site_name" content="${cfg.name}"><meta property="og:url" content="${selfUrl}">
<meta property="og:title" content="${esc(fullTitle || title || cfg.name)}"><meta property="og:description" content="${esc(desc || T.tagline)}">
<meta property="og:image" content="${cfg.siteUrl}/assets/og-${lang}.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:locale" content="${T.htmlLang.replace("-", "_")}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${cfg.siteUrl}/assets/og-${lang}.jpg">
${/^(cart|thank-you|404\.html)$/.test(rel) ? `<meta name="robots" content="noindex">` : `<link rel="canonical" href="${selfUrl}">${alt}`}
${ld ? `<script type="application/ld+json">${JSON.stringify(ld)}</script>` : ""}
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<script>document.documentElement.className+=" js";window.I18N=${JSON.stringify(jsStrings)}</script>
<link rel="stylesheet" href="/assets/style.css">
</head><body>
<div class="topbar"><a href="${wa(T.waHello)}" target="_blank" rel="noopener">${WA_ICON} ${esc(T.topbar)} <strong>${cfg.whatsappDisplay}</strong></a></div>
<header class="site-header"><div class="wrap header-inner">
  <a class="brand" href="${L("/")}">${LOGO}<span>The Gilded Order</span></a>
  <button class="menu-btn" aria-label="${T.menu}" onclick="document.body.classList.toggle('nav-open')">☰</button>
  <nav class="main-nav">${nav}<a href="${L("/cart/")}" class="cart-link">${T.nav.cart} <span class="cart-count" data-cart-count>0</span></a>${switcher}<a class="btn wa small" href="${wa(T.waHello)}" target="_blank" rel="noopener">${WA_ICON} WhatsApp</a></nav>
</div></header>
<main>${body}</main>
<footer class="site-footer"><div class="wrap footer-grid">
  <div><a class="brand" href="${L("/")}">${LOGO}<span>The Gilded Order</span></a>
    <p class="muted">${esc(T.tagline)}</p>
    <p class="fine">${esc(T.footerDisclaimer)}</p></div>
  <div><h4>${T.footShop}</h4>${CAT_KEYS.map(k => `<a href="${L(`/shop/${k}/`)}">${esc(CATS[k].name)}</a>`).join("")}</div>
  <div><h4>${T.footOrder}</h4><a href="${wa(T.waHello)}" target="_blank" rel="noopener" class="foot-wa">WhatsApp ${cfg.whatsappDisplay}</a><a href="${L("/membership/")}">${T.nav.membership}</a><a href="${L("/archive/")}">${T.nav.archive}</a><a href="${L("/archive/cipher/")}">${T.cipherOfMonth}</a><a href="${L("/about/")}">${T.nav.about}</a><a href="${L("/contact/")}">${T.nav.contact}</a></div>
  <div><h4>${T.footPolicies}</h4>${Object.entries(T.legal).map(([k, [t]]) => `<a href="${L(`/legal/${k}/`)}">${esc(t)}</a>`).join("")}<div class="foot-countries"><span>${T.weServe}</span> ${COUNTRIES.map(c => `<a href="${c.lang === "en" ? "" : "/" + c.lang}/${c.slug}/" lang="${I18N[c.lang].htmlLang}">${c.country}${c.slug === "cameroon" ? " (EN)" : c.slug === "cameroun" ? " (FR)" : ""}</a>`).join(", ")}</div><div class="foot-lang">${LANGS.map(lg => `<a href="${href(lg)}" lang="${I18N[lg].htmlLang}">${I18N[lg].label}</a>`).join("")}</div></div>
</div><div class="wrap fine bottom">© ${new Date().getFullYear()} ${esc(cfg.legalName)} · ${esc(cfg.address)}</div></footer>
<a class="wa-float" href="${wa(T.waHello)}" target="_blank" rel="noopener" aria-label="${T.chatOnWa}">${WA_ICON}<span>${T.chatWithUs}</span></a>
<script src="/assets/app.js"></script>
</body></html>`;
  }

  const card = p => `<a class="card reveal" data-price="${p.price}" href="${L(`/shop/p/${p.slug}/`)}">
  <div class="card-img">${img(p, 1)}${img(p, 2, "alt-img")}</div>
  <div class="card-body"><span class="cat">${esc(CATS[p.cat].name)}</span><h3>${esc(p.name)}</h3>
  <span class="price">${p.priceFrom ? T.from : ""}${money(p.price)}</span></div></a>`;

  const joinBand = `<section class="join-band reveal"><div class="wrap join-inner"><div><h2>${esc(T.joinBand[0])}</h2><p>${esc(T.joinBand[1])}</p></div>
  <form class="join inline" data-join><input name="name" required placeholder="${esc(T.firstName)}"><button class="btn wa">${WA_ICON} ${T.joinWa}</button></form></div></section>`;

  // ---------- HOME ----------
  const featured = ["sterling-square-and-compass-signet", "eye-and-ouroboros-pendant", "onyx-pyramid-candle-holders", "square-and-compass-tie-chain", "copper-and-opalite-eye-necklace", "gilded-dome-ring", "sterling-witches-knot-pendant", "cathedral-hexagon-votive"]
    .map(s => products.find(p => p.slug === s)).filter(Boolean);
  // prefer pieces that have photos; top up with other photographed pieces
  const withPhotos = (list, n) => { const ok = list.filter(p => imgCount(p) > 0); for (const p of products) { if (ok.length >= n) break; if (imgCount(p) > 0 && !ok.includes(p)) ok.push(p); } return ok.slice(0, n); };
  W("", { fullTitle: T.homeTitle, desc: T.homeDesc, ld: { "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", name: cfg.name, url: cfg.siteUrl, logo: cfg.siteUrl + "/assets/favicon.svg", contactPoint: { "@type": "ContactPoint", telephone: "+" + cfg.whatsapp, contactType: "customer service", availableLanguage: ["English", "French", "Portuguese"] }, address: { "@type": "PostalAddress", ...cfg.postal } },
    { "@type": "WebSite", name: cfg.name, url: cfg.siteUrl + L("/"), inLanguage: T.htmlLang }] }, body: `
<section class="hero"><canvas class="dust" data-dust></canvas>${SIGIL}
<div class="wrap hero-inner">
  <p class="eyebrow">${T.est} ${new Date().getFullYear()}</p>
  <h1 class="shimmer">${T.heroH1}</h1>
  <p class="lead">${esc(T.heroLead)}</p>
  <div class="actions"><a class="btn gold" href="${L("/shop/")}">${T.exploreShop}</a><a class="btn ghost" href="${L("/membership/")}">${T.joinFree}</a><a class="btn wa" href="${wa(T.waHello)}" target="_blank" rel="noopener">${WA_ICON} ${T.chatOnWa}</a></div>
</div></section>
<section class="pillars wrap">
  <a href="${L("/shop/")}" class="pillar reveal"><span class="num">I</span><h3>${T.pShop[0]}</h3><p>${esc(T.pShop[1](products.length))}</p></a>
  <a href="${L("/membership/")}" class="pillar reveal"><span class="num">II</span><h3>${T.pClub[0]}</h3><p>${esc(T.pClub[1])}</p></a>
  <a href="${L("/archive/")}" class="pillar reveal"><span class="num">III</span><h3>${T.pArchive[0]}</h3><p>${esc(T.pArchive[1])}</p></a>
</section>
<section class="wrap section how"><h2>${T.how[0]}</h2><div class="steps">${T.how[1].map(([h, t], i) => `<div class="step reveal"><span class="num">${i + 1}</span><h3>${esc(h)}</h3><p>${esc(t)}</p></div>`).join("")}</div>
  <div class="actions center"><a class="btn gold" href="${L("/shop/")}">${T.exploreShop}</a><a class="btn wa" href="${wa(T.waHello)}" target="_blank" rel="noopener">${WA_ICON} ${T.chatOnWa}</a></div></section>
<section class="wrap section"><div class="section-head"><h2>${T.featured}</h2><a href="${L("/shop/")}">${T.viewAll}</a></div>
<div class="grid">${withPhotos(featured, 8).map(card).join("")}</div></section>
<section class="band"><div class="wrap band-inner">
  <div><h2>${T.shopBySymbol}</h2><p class="muted">${esc(T.shopBySymbolText)}</p></div>
  <div class="cat-links">${CAT_KEYS.map(k => `<a href="${L(`/shop/${k}/`)}">${esc(CATS[k].name)}<span>${products.filter(p => p.cat === k).length}</span></a>`).join("")}</div>
</div></section>
<section class="wrap section"><div class="section-head"><h2>${T.fromArchive}</h2><a href="${L("/archive/")}">${T.allStories}</a></div>
<div class="articles">${articles.slice(0, 3).map(a => `<a class="article-card reveal" href="${L(`/archive/${a.slug}/`)}"><h3>${esc(a.title)}</h3><p>${esc(a.teaser)}</p><span>${T.read}</span></a>`).join("")}</div></section>
${joinBand}
<section class="wrap section africa reveal"><h2>${T.africaH}</h2><p>${esc(T.africaP)}</p>
  <div class="country-chips">${COUNTRIES.map(c => `<a href="${c.lang === "en" ? "" : "/" + c.lang}/${c.slug}/" lang="${I18N[c.lang].htmlLang}">${c.country}</a>`).join("")}</div>
  <a class="btn wa" href="${wa(T.waHello)}" target="_blank" rel="noopener">${WA_ICON} ${T.chatOnWa}</a></section>
<section class="wrap section honest"><h2>${T.honestH}</h2><p>${esc(T.honestP(cfg.whatsappDisplay))}</p></section>` });

  // ---------- SHOP ----------
  const shopBody = (list, heading, blurb, activeCat) => `
<section class="page-head"><div class="wrap"><p class="eyebrow">${T.shopEyebrow}</p><h1>${esc(heading)}</h1><p class="lead">${esc(blurb)}</p></div></section>
<section class="wrap section">
  <div class="filters"><a href="${L("/shop/")}" class="${!activeCat ? "on" : ""}">${T.all}</a>${CAT_KEYS.map(k => `<a href="${L(`/shop/${k}/`)}" class="${activeCat === k ? "on" : ""}">${esc(CATS[k].name)}</a>`).join("")}
  <select class="sort" data-sort aria-label="${T.sort}"><option value="">${T.sortFeatured}</option><option value="asc">${T.priceAsc}</option><option value="desc">${T.priceDesc}</option></select></div>
  <div class="grid" data-grid>${list.map(card).join("")}</div>
</section>${joinBand}`;
  W("shop", { title: T.shopTitle, desc: T.shopDesc, active: "shop", body: shopBody(products, T.allPieces, T.allPiecesText(products.length)) });
  for (const k of CAT_KEYS) W(`shop/${k}`, { title: T.catTitles[k], desc: CATS[k].blurb, active: "shop", body: shopBody(products.filter(p => p.cat === k), CATS[k].name, CATS[k].blurb, k) });

  // ---------- PRODUCT PAGES ----------
  for (const p of products) {
    const thumbs = Array.from({ length: Math.max(imgCount(p), cfg.imagesPerProduct) }, (_, i) => i + 1);
    const related = products.filter(x => x.cat === p.cat && x.slug !== p.slug).slice(0, 4);
    const priceText = (p.priceFrom ? T.from : "") + money(p.price);
    const ld = { "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.desc, image: thumbs.filter(n => n <= imgCount(p)).map(n => cfg.siteUrl + imgUrl(p, n)), url: cfg.siteUrl + L(`/shop/p/${p.slug}/`),
      brand: { "@type": "Brand", name: cfg.name }, offers: { "@type": "Offer", priceCurrency: "USD", price: p.price, availability: "https://schema.org/InStock" } };
    const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: T.nav.shop, item: cfg.siteUrl + L("/shop/") },
      { "@type": "ListItem", position: 2, name: CATS[p.cat].name, item: cfg.siteUrl + L(`/shop/${p.cat}/`) },
      { "@type": "ListItem", position: 3, name: p.name, item: cfg.siteUrl + L(`/shop/p/${p.slug}/`) }] };
    W(`shop/p/${p.slug}`, { title: `${p.name} – ${CATS[p.cat].name}`, desc: `${p.desc} ${T.prodDescTail(money(p.price))}`, ld: crumbs, active: "shop", body: `
<section class="wrap product">
  <div class="gallery">
    <div class="main-img" data-main>${img(p, 1)}</div>
    <div class="thumbs">${thumbs.map(n => `<button data-thumb="${imgUrl(p, n)}" aria-label="${T.photo} ${n}">${img(p, n)}</button>`).join("")}</div>
  </div>
  <div class="details">
    <a class="crumb" href="${L(`/shop/${p.cat}/`)}">← ${esc(CATS[p.cat].name)}</a>
    <h1>${esc(p.name)}</h1>
    <p class="price big">${priceText}</p>
    <p class="desc">${esc(p.desc)}</p>
    ${p.cat === "rings" && !p.priceFrom ? `<label class="field">${T.ringSize}<select data-size>${[7, 8, 9, 10, 11, 12, 13].map(s => `<option${s === 9 ? " selected" : ""}>${s}</option>`).join("")}</select></label>` : ""}
    ${p.priceFrom ? `<a class="btn gold full" href="${wa(T.waQuote(p.name))}" target="_blank" rel="noopener">${T.requestQuote}</a>` :
      `<label class="field">${T.quantity}<input type="number" min="1" value="1" data-qty></label>
       <button class="btn gold full" data-add='${esc(JSON.stringify({ slug: p.slug, name: p.name, price: p.price }))}'>${T.addToCart}</button>`}
    <a class="btn wa full mt" href="${wa(T.waInterested(p.name, priceText))}" target="_blank" rel="noopener">${WA_ICON} ${T.askOrderWa}</a>
    <p class="help-line">${esc(T.sizeHelp)}</p>
    <p class="join-nudge">✦ ${esc(T.joinBand[0])}. <a href="${L("/membership/")}">${T.joinFree}</a></p>
    <ul class="assurances">${T.assurances.map(a => `<li>${esc(a)}</li>`).join("")}</ul>
    ${p.prop65 ? `<p class="fine warn">${esc(T.prop65)}</p>` : ""}
  </div>
</section>
<section class="wrap section"><div class="section-head"><h2>${T.youMayLike}</h2></div><div class="grid">${related.map(card).join("")}</div></section>
<script type="application/ld+json">${JSON.stringify(ld)}</script>` });
  }

  // ---------- CART ----------
  W("cart", { title: T.cartTitle, body: `
<section class="page-head"><div class="wrap"><h1>${T.yourCart}</h1></div></section>
<section class="wrap section cart">
  <div data-cart-items class="cart-items"></div>
  <aside class="cart-summary"><div class="row"><span>${T.subtotal}</span><strong data-cart-total>$0.00</strong></div>
  <label class="ship-to">${T.js.shipTo}<select data-ship>${SHIP.map(c => `<option value="${c}">${esc(new Intl.DisplayNames([T.htmlLang], { type: "region" }).of(c))}</option>`).join("")}</select></label>
  <div class="row"><span>${T.js.shippingL}</span><strong data-ship-cost>—</strong></div>
  <div class="row"><span>${T.js.totalL}</span><strong data-grand>—</strong></div>
  <p class="fine">${T.shippingAtCheckout}</p>
  <button class="btn gold full" data-checkout>${T.checkout}</button><p class="fine" data-checkout-msg></p></aside>
</section>` });
  W("thank-you", { title: T.thankYou, body: `<section class="page-head center"><div class="wrap"><h1>${T.thankYou}</h1><p class="lead">${T.thankYouText}</p><a class="btn gold" href="${L("/shop/")}">${T.keepExploring}</a></div></section>` });

  // ---------- MEMBERSHIP ----------
  W("membership", { title: T.mTitle, desc: T.mDesc, ld: { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: T.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }, active: "membership", body: `
<section class="page-head center"><div class="wrap"><p class="eyebrow">${T.mEyebrow}</p><h1 class="shimmer">${esc(T.mH1)}</h1><p class="lead">${esc(T.mLead)}</p></div></section>
<section class="wrap section tiers single">
  <div class="tier featured reveal"><span class="badge">${T.mBadge}</span>
    <h3>${T.mTier}</h3><p class="tier-price">${T.mPrice}<span> ${T.mPeriod}</span></p>
    <ul>${T.mPerks.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
    <form class="join" data-join><input name="name" required placeholder="${esc(T.firstName)}"><button class="btn wa full">${WA_ICON} ${T.joinWa}</button></form>
    <p class="fine center">${esc(T.opensWa(cfg.whatsappDisplay))}</p>
  </div>
</section>
<section class="wrap section faq"><h2>${T.questions}</h2>
${T.faq.map(([q, a]) => `  <details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n")}
</section>` });

  // ---------- ARCHIVE ----------
  W("archive", { title: T.aTitle, desc: T.aDesc, active: "archive", body: `
<section class="page-head"><div class="wrap"><p class="eyebrow">${T.aEyebrow}</p><h1>${T.aH1}</h1><p class="lead">${esc(T.aLead)}</p></div></section>
<section class="wrap section"><div class="articles">
${articles.map(a => `<a class="article-card reveal" href="${L(`/archive/${a.slug}/`)}"><h3>${esc(a.title)}</h3><p>${esc(a.teaser)}</p><span>${T.read}</span></a>`).join("")}
<a class="article-card cipher-card" href="${L("/archive/cipher/")}"><h3>${T.cipherOfMonth}</h3><p>${esc(T.cipherCard)}</p><span>${T.play}</span></a>
</div></section>` });
  const shopFor = { "eye-of-providence": "eye", "square-and-compass": "rings", ouroboros: "eye", "the-pentagram": "pendants", "as-above-so-below": "decor", "knights-templar": "accessories" };
  for (const a of articles) {
    const c = shopFor[a.slug];
    W(`archive/${a.slug}`, { title: a.title, desc: a.teaser, active: "archive", body: `
<article class="wrap narrow article"><a class="crumb" href="${L("/archive/")}">← ${T.aTitle}</a><h1>${esc(a.title)}</h1><p class="lead">${esc(a.teaser)}</p>
${a.body.map(p => `<p>${esc(p)}</p>`).join("")}
<div class="article-cta"><p>${T.inspired}</p><a class="btn gold" href="${L(`/shop/${c}/`)}">${esc(T.shopCat(CATS[c].name))}</a></div></article>` });
  }
  W("archive/cipher", { title: T.cipherOfMonth, active: "archive", body: `
<section class="wrap narrow article center"><a class="crumb" href="${L("/archive/")}">← ${T.aTitle}</a><h1>${T.cipherOfMonth}</h1>
<p class="lead">${esc(T.cLead)}</p>
<p class="cipher">${caesar(T.cPlain)}</p>
<form data-cipher data-answer="${Buffer.from(T.cPlain.replace(/[^A-Z]/g, "")).toString("base64")}" class="cipher-form"><input placeholder="${esc(T.answer)}" required><button class="btn gold">${T.check}</button></form>
<p data-cipher-result class="cipher-result"></p>
<details><summary>${T.hintQ}</summary><p>${esc(T.hintA)}</p></details></section>` });

  // ---------- COUNTRY LANDING PAGES ----------
  for (const c of COUNTRIES.filter(c => c.lang === lang)) {
    const CT = COUNTRIES.text[lang] || COUNTRIES.text.en;
    const fill = x => x.replace(/\{prep\}/g, c.prep).replace(/\{country\}/g, c.country);
    const faq = CT.faq.map(([q, a]) => [fill(q), fill(a)]);
    const pair = c.slug === "cameroon" ? { en: "/cameroon/", fr: "/fr/cameroun/" } : c.slug === "cameroun" ? { en: "/cameroon/", fr: "/fr/cameroun/" } : { [lang]: L(`/${c.slug}/`) };
    const picks = c.featured.map(sl => products.find(p => p.slug === sl)).filter(Boolean);
    W(c.slug, { fullTitle: `${c.title} | ${cfg.name}`, desc: c.desc, alts: pair,
      ld: { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
      body: `
<section class="page-head country-head"><div class="wrap"><p class="eyebrow">${esc(c.country)}</p><h1 class="shimmer">${esc(c.h1)}</h1>
  ${c.intro.map(t => `<p class="lead">${esc(t)}</p>`).join("")}
  <div class="actions"><a class="btn wa" href="${wa(T.waHello + " (" + c.country + ")")}" target="_blank" rel="noopener">${WA_ICON} ${T.chatOnWa}</a><a class="btn gold" href="${L("/shop/")}">${T.exploreShop}</a><a class="btn ghost" href="${L("/membership/")}">${T.joinFree}</a></div>
  <p class="fine">${esc(CT.cities(c.cities))}</p></div></section>
<section class="wrap section"><div class="section-head"><h2>${CT.popular}</h2><a href="${L("/shop/")}">${CT.allShop}</a></div><div class="grid">${withPhotos(picks, 8).map(card).join("")}</div></section>
<section class="wrap section how"><h2>${T.how[0]}</h2><div class="steps">${T.how[1].map(([h, t], i) => `<div class="step reveal"><span class="num">${i + 1}</span><h3>${esc(h)}</h3><p>${esc(t)}</p></div>`).join("")}</div></section>
${joinBand}
<section class="wrap section faq"><h2>${T.questions}</h2>
${faq.map(([q, a]) => `  <details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n")}
</section>` });
  }

  // ---------- ABOUT / CONTACT ----------
  W("about", { title: T.abTitle, active: "about", body: `
<section class="page-head"><div class="wrap"><p class="eyebrow">${T.abTitle}</p><h1>${esc(T.abH1)}</h1></div></section>
<section class="wrap narrow article">
<p>${esc(T.abParas[0])}</p><p>${esc(T.abParas[1])}</p>
<h2>${esc(T.abWhat)}</h2>
<p>${esc(T.abParas[2])}</p><p>${esc(T.abParas[3])}</p></section>` });
  W("contact", { title: T.ctTitle, body: `
<section class="page-head"><div class="wrap"><h1>${T.ctH1}</h1><p class="lead">${esc(T.ctLead)}</p></div></section>
<section class="wrap narrow section"><form class="contact-form" data-contact>
<label class="field">${T.name}<input name="name" required></label>
<label class="field">${T.subject}<input name="subject" data-subject></label>
<label class="field">${T.message}<textarea name="message" rows="6" required></textarea></label>
<button class="btn wa">${WA_ICON} ${T.sendWa}</button><p class="fine">${esc(T.ctOpens(cfg.whatsappDisplay))}</p></form>
<a class="wa-panel reveal" href="${wa(T.waHello)}" target="_blank" rel="noopener">${WA_ICON}<span>${T.orDirect}<strong>${cfg.whatsappDisplay}</strong></span></a><p class="fine center" style="margin-top:18px">${esc(cfg.legalName)}<br>${esc(cfg.address)}</p></section>` });

  // ---------- LEGAL (templates — have them reviewed before launch) ----------
  for (const [k, [t, paras]] of Object.entries(T.legal)) {
    W(`legal/${k}`, { title: t, body: `<article class="wrap narrow article"><h1>${esc(t)}</h1><p class="fine">${T.template}</p>${paras(cfg.legalName, cfg.address).map(p => `<p>${esc(p)}</p>`).join("")}</article>` });
  }
  W("404.html", { title: T.nfTitle, body: `<section class="page-head center"><div class="wrap"><h1>${T.nfH1}</h1><p class="lead">${T.nfText}</p><a class="btn gold" href="${L("/")}">${T.nfHome}</a></div></section>` });
}

// ---------- ASSETS ----------
if (fs.existsSync(IMG_DIR)) fs.cpSync(IMG_DIR, path.join(OUT, "products"), { recursive: true });
fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });
for (const f of fs.readdirSync(path.join(__dirname, "assets"))) fs.copyFileSync(path.join(__dirname, "assets", f), path.join(OUT, "assets", f));
for (const lang of ["fr", "pt"]) fs.writeFileSync(path.join(OUT, placeholderFile(lang)), placeholderSvg(I18N[lang].ph));
fs.writeFileSync(path.join(OUT, "assets", "favicon.svg"), LOGO.replace('class="logo-mark"', 'xmlns="http://www.w3.org/2000/svg" style="color:#c9a24a"'));

// Server-side catalogue for checkout (prices can't be changed by the browser)
fs.mkdirSync(path.join(__dirname, "functions"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "functions", "_catalog.js"),
  "export default " + JSON.stringify(Object.fromEntries(baseProducts.filter(p => !p.priceFrom).map(p => [p.slug, { name: p.name, price: p.price }])), null, 1) + ";\n");

// Image manifest: where each photo must be uploaded in R2
fs.writeFileSync(path.join(__dirname, "image-manifest.csv"),
  "product,photos,folder\n" + baseProducts.map(p => `"${p.name}",${imgCount(p)},images/products/${p.slug}/`).join("\n") + "\n");

// IndexNow (Bing, Yandex, Seznam, Naver): key file at the site root.
const INDEXNOW_KEY = "52447ccd075156206d1a9189cc54f7b6";
fs.writeFileSync(path.join(OUT, INDEXNOW_KEY + ".txt"), INDEXNOW_KEY);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${cfg.siteUrl}/sitemap.xml\n`);
{
  const today = new Date().toISOString().slice(0, 10);
  const body = sitemap.map(e => `  <url><loc>${e.url}</loc><lastmod>${today}</lastmod>${Object.entries(e.alts).map(([lg, h]) => `<xhtml:link rel="alternate" hreflang="${I18N[lg].htmlLang}" href="${cfg.siteUrl}${h}"/>`).join("")}</url>`).join("\n");
  fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`);
  fs.writeFileSync(path.join(OUT, "sitemap.txt"), sitemap.map(e => e.url).join("\n") + "\n");
}
console.log(`Built ${baseProducts.length} products × ${LANGS.length} languages, ${sitemap.length} pages → dist/`);
