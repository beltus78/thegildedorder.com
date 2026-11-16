// Static site generator for The Gilded Order. Run: node build.js  → outputs ./dist (Cloudflare Pages)
const fs = require("fs");
const path = require("path");
const cfg = require("./site.config");
const products = require("./data/products");
const { articles, tiers } = require("./data/content");

const OUT = path.join(__dirname, "dist");
const CATS = {
  rings: { name: "Rings", blurb: "Signets, bands and statement rings in steel, silver, bronze and tungsten." },
  pendants: { name: "Pendants & Talismans", blurb: "Amulets and pendants drawn from old symbols of luck, love and protection." },
  eye: { name: "The All-Seeing Eye", blurb: "Pieces built around one of the world's oldest symbols of watchful awareness." },
  accessories: { name: "Men's Accessories", blurb: "Cufflinks, tie chains and slides for formal dress." },
  decor: { name: "Home & Ritual Decor", blurb: "Candle holders, boxes and wall pieces for a room with atmosphere." }
};

const slugify = s => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const money = n => "$" + Number(n).toFixed(2);
products.forEach(p => { p.slug = slugify(p.name); });

const imgUrl = (p, n) => `${cfg.imageBase.replace(/\/$/, "")}/products/${p.slug}/${n}.jpg`;
const img = (p, n, cls = "") =>
  `<img class="${cls}" src="${imgUrl(p, n)}" alt="${esc(p.name)} – photo ${n}" loading="lazy" onerror="this.onerror=null;this.src='/assets/placeholder.svg';this.classList.add('is-ph')">`;

const LOGO = `<svg class="logo-mark" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="32" cy="32" r="23" fill="none" stroke="currentColor" stroke-width="1" opacity=".6"/><path d="M32 12 L49 42 L15 42 Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M32 22 L40.5 37 L23.5 37 Z" fill="currentColor" opacity=".9"/><circle cx="32" cy="50" r="2" fill="currentColor"/></svg>`;

function layout({ title, desc, body, active = "" }) {
  const nav = [["/shop/", "Shop", "shop"], ["/membership/", "Membership", "membership"], ["/archive/", "The Archive", "archive"], ["/about/", "About", "about"]]
    .map(([h, t, k]) => `<a href="${h}" class="${active === k ? "active" : ""}">${t}</a>`).join("");
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title ? title + " | " + cfg.name : cfg.name + " — " + cfg.tagline)}</title>
<meta name="description" content="${esc(desc || cfg.tagline)}">
<meta property="og:title" content="${esc(title || cfg.name)}"><meta property="og:description" content="${esc(desc || cfg.tagline)}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
</head><body>
<header class="site-header"><div class="wrap header-inner">
  <a class="brand" href="/">${LOGO}<span>The Gilded Order</span></a>
  <button class="menu-btn" aria-label="Menu" onclick="document.body.classList.toggle('nav-open')">☰</button>
  <nav class="main-nav">${nav}<a href="/cart/" class="cart-link">Cart <span class="cart-count" data-cart-count>0</span></a></nav>
</div></header>
<main>${body}</main>
<footer class="site-footer"><div class="wrap footer-grid">
  <div><a class="brand" href="/">${LOGO}<span>The Gilded Order</span></a>
    <p class="muted">${esc(cfg.tagline)}</p>
    <p class="fine">The Gilded Order is a lifestyle brand, shop and members' club. We are not a secret society and are not affiliated with Freemasonry, the Illuminati or any fraternal organisation. Membership is for community, content and shop benefits only. We never promise money, wealth, fame or immigration help.</p></div>
  <div><h4>Shop</h4>${Object.entries(CATS).map(([k, c]) => `<a href="/shop/${k}/">${c.name}</a>`).join("")}</div>
  <div><h4>Order</h4><a href="/membership/">Membership</a><a href="/archive/">The Archive</a><a href="/archive/cipher/">Cipher of the Month</a><a href="/about/">About</a><a href="/contact/">Contact</a></div>
  <div><h4>Policies</h4><a href="/legal/terms/">Terms of Service</a><a href="/legal/privacy/">Privacy Policy</a><a href="/legal/shipping-returns/">Shipping & Returns</a><a href="/legal/membership-terms/">Membership Terms</a></div>
</div><div class="wrap fine bottom">© ${new Date().getFullYear()} ${esc(cfg.legalName)} · ${esc(cfg.address)}</div></footer>
<script src="/assets/app.js"></script>
</body></html>`;
}

function write(rel, html) {
  const file = path.join(OUT, rel, rel.endsWith(".html") ? "" : "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

const card = p => `<a class="card" href="/shop/p/${p.slug}/">
  <div class="card-img">${img(p, 1)}${img(p, 2, "alt-img")}</div>
  <div class="card-body"><span class="cat">${CATS[p.cat].name}</span><h3>${esc(p.name)}</h3>
  <span class="price">${p.priceFrom ? "From " : ""}${money(p.price)}</span></div></a>`;

// ---------- HOME ----------
const featured = ["sterling-square-and-compass-signet", "eye-and-ouroboros-pendant", "onyx-pyramid-candle-holders", "square-and-compass-tie-chain", "copper-and-opalite-eye-necklace", "gilded-dome-ring", "sterling-witches-knot-pendant", "cathedral-hexagon-votive"]
  .map(s => products.find(p => p.slug === s)).filter(Boolean);

write("", layout({
  desc: "Symbol jewellery, a members' club and an archive of stories about the world's oldest emblems.",
  body: `
<section class="hero"><div class="wrap hero-inner">
  <p class="eyebrow">Est. ${new Date().getFullYear()}</p>
  <h1>Symbols, craft<br>and company.</h1>
  <p class="lead">Jewellery and objects inspired by the oldest emblems in history, a members' club for curious minds, and an archive of the stories behind them.</p>
  <div class="actions"><a class="btn gold" href="/shop/">Explore the shop</a><a class="btn ghost" href="/membership/">Join the Order</a></div>
</div></section>

<section class="pillars wrap">
  <a href="/shop/" class="pillar"><span class="num">I</span><h3>The Shop</h3><p>${products.length} pieces: rings, talismans, all-seeing eye jewellery, accessories and decor.</p></a>
  <a href="/membership/" class="pillar"><span class="num">II</span><h3>The Club</h3><p>Member discounts, early drops, online meet-ups and a quarterly gift for Patrons.</p></a>
  <a href="/archive/" class="pillar"><span class="num">III</span><h3>The Archive</h3><p>True stories behind the symbols, plus a new cipher to crack every month.</p></a>
</section>

<section class="wrap section"><div class="section-head"><h2>Featured pieces</h2><a href="/shop/">View all →</a></div>
<div class="grid">${featured.map(card).join("")}</div></section>

<section class="band"><div class="wrap band-inner">
  <div><h2>Shop by symbol</h2><p class="muted">Every piece is chosen for its design and the history behind it.</p></div>
  <div class="cat-links">${Object.entries(CATS).map(([k, c]) => `<a href="/shop/${k}/">${c.name}<span>${products.filter(p => p.cat === k).length}</span></a>`).join("")}</div>
</div></section>

<section class="wrap section"><div class="section-head"><h2>From the Archive</h2><a href="/archive/">All stories →</a></div>
<div class="articles">${articles.slice(0, 3).map(a => `<a class="article-card" href="/archive/${a.slug}/"><h3>${esc(a.title)}</h3><p>${esc(a.teaser)}</p><span>Read →</span></a>`).join("")}</div></section>

<section class="wrap section honest"><h2>Plain and honest</h2>
<p>The Gilded Order is a brand and a club, not a secret society. No one will ever ask you for money to "join" anything outside this website, and no membership comes with promises of wealth, fame, houses or visas. If someone contacts you claiming to recruit for us on WhatsApp or social media, it is a scam. Please report it to us.</p></section>`
}));

// ---------- SHOP ----------
const shopBody = (list, heading, blurb, activeCat) => `
<section class="page-head"><div class="wrap"><p class="eyebrow">The Shop</p><h1>${esc(heading)}</h1><p class="lead">${esc(blurb)}</p></div></section>
<section class="wrap section">
  <div class="filters"><a href="/shop/" class="${!activeCat ? "on" : ""}">All</a>${Object.entries(CATS).map(([k, c]) => `<a href="/shop/${k}/" class="${activeCat === k ? "on" : ""}">${c.name}</a>`).join("")}
  <select class="sort" data-sort aria-label="Sort"><option value="">Sort: Featured</option><option value="asc">Price: low to high</option><option value="desc">Price: high to low</option></select></div>
  <div class="grid" data-grid>${list.map(p => card(p).replace('<a class="card"', `<a class="card" data-price="${p.price}"`)).join("")}</div>
</section>`;
write("shop", layout({ title: "Shop", desc: "Symbol rings, talismans, all-seeing eye jewellery and decor.", active: "shop", body: shopBody(products, "All pieces", `${products.length} pieces chosen for their design and history.`) }));
for (const [k, c] of Object.entries(CATS)) {
  write(`shop/${k}`, layout({ title: c.name, desc: c.blurb, active: "shop", body: shopBody(products.filter(p => p.cat === k), c.name, c.blurb, k) }));
}

// ---------- PRODUCT PAGES ----------
for (const p of products) {
  const thumbs = Array.from({ length: cfg.imagesPerProduct }, (_, i) => i + 1);
  const related = products.filter(x => x.cat === p.cat && x.slug !== p.slug).slice(0, 4);
  const ld = { "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.desc, image: thumbs.map(n => imgUrl(p, n)),
    brand: { "@type": "Brand", name: cfg.name }, offers: { "@type": "Offer", priceCurrency: "USD", price: p.price, availability: "https://schema.org/InStock" } };
  write(`shop/p/${p.slug}`, layout({
    title: p.name, desc: p.desc, active: "shop",
    body: `
<section class="wrap product">
  <div class="gallery">
    <div class="main-img" data-main>${img(p, 1)}</div>
    <div class="thumbs">${thumbs.map(n => `<button data-thumb="${imgUrl(p, n)}" aria-label="Photo ${n}">${img(p, n)}</button>`).join("")}</div>
  </div>
  <div class="details">
    <a class="crumb" href="/shop/${p.cat}/">← ${CATS[p.cat].name}</a>
    <h1>${esc(p.name)}</h1>
    <p class="price big">${p.priceFrom ? "From " : ""}${money(p.price)}</p>
    <p class="member-note">Members save 10–15%. <a href="/membership/">Join the Order</a></p>
    <p class="desc">${esc(p.desc)}</p>
    ${p.cat === "rings" && !p.priceFrom ? `<label class="field">Ring size<select data-size><option>7</option><option>8</option><option selected>9</option><option>10</option><option>11</option><option>12</option><option>13</option></select></label>` : ""}
    ${p.priceFrom ? `<a class="btn gold full" href="/contact/?subject=${encodeURIComponent("Custom ring: " + p.name)}">Request a custom quote</a>` :
      `<label class="field">Quantity<input type="number" min="1" value="1" data-qty></label>
       <button class="btn gold full" data-add='${esc(JSON.stringify({ slug: p.slug, name: p.name, price: p.price }))}'>Add to cart</button>`}
    <ul class="assurances"><li>Secure checkout</li><li>30-day returns on unworn items</li><li>Ships in 3–7 business days</li></ul>
    ${p.prop65 ? `<p class="fine warn">⚠ California Proposition 65 warning: this product can expose you to lead and lead compounds, known to the State of California to cause cancer and reproductive harm. See www.P65Warnings.ca.gov.</p>` : ""}
  </div>
</section>
<section class="wrap section"><div class="section-head"><h2>You may also like</h2></div><div class="grid">${related.map(card).join("")}</div></section>
<script type="application/ld+json">${JSON.stringify(ld)}</script>`
  }));
}

// ---------- CART ----------
write("cart", layout({ title: "Cart", active: "", body: `
<section class="page-head"><div class="wrap"><h1>Your cart</h1></div></section>
<section class="wrap section cart">
  <div data-cart-items class="cart-items"></div>
  <aside class="cart-summary"><div class="row"><span>Subtotal</span><strong data-cart-total>$0.00</strong></div>
  <p class="fine">Shipping and any member discount are applied at checkout.</p>
  <button class="btn gold full" data-checkout>Checkout</button><p class="fine" data-checkout-msg></p></aside>
</section>` }));
write("thank-you", layout({ title: "Thank you", body: `<section class="page-head center"><div class="wrap"><h1>Thank you</h1><p class="lead">Your order is confirmed. A receipt is on its way to your inbox.</p><a class="btn gold" href="/shop/">Keep exploring</a></div></section>` }));

// ---------- MEMBERSHIP ----------
write("membership", layout({ title: "Membership", desc: "Join The Gilded Order: shop discounts, early drops, members-only stories and online meet-ups.", active: "membership", body: `
<section class="page-head center"><div class="wrap"><p class="eyebrow">The Club</p><h1>Join the Order</h1><p class="lead">A members' club for people who love symbols, history and good design. Clear prices, real perks, cancel any time.</p></div></section>
<section class="wrap section tiers">${tiers.map(t => `
  <div class="tier ${t.featured ? "featured" : ""}">${t.featured ? '<span class="badge">Most popular</span>' : ""}
    <h3>${t.name}</h3><p class="tier-price">${t.price}<span>${t.period}</span></p>
    <ul>${t.perks.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
    <form class="join" data-waitlist="${t.key}"><input type="email" required placeholder="Your email"><button class="btn ${t.featured ? "gold" : "ghost"} full">${t.price === "Free" ? "Join free" : "Join the waitlist"}</button></form>
  </div>`).join("")}
</section>
<section class="wrap section faq"><h2>Questions</h2>
  <details><summary>Is this a secret society?</summary><p>No. The Gilded Order is a brand and a members' club. Everything members get is listed on this page.</p></details>
  <details><summary>Will membership make me rich or famous?</summary><p>No, and anyone who promises that is running a scam. Membership gives you shop discounts, content, events and community.</p></details>
  <details><summary>Can I cancel?</summary><p>Yes, at any time from your account or by emailing us. You keep your perks until the end of the period you paid for.</p></details>
  <details><summary>When do paid memberships open?</summary><p>Very soon. Join the waitlist and you'll get the first invitation, plus a founding-member price.</p></details>
</section>` }));

// ---------- ARCHIVE ----------
write("archive", layout({ title: "The Archive", desc: "True stories behind history's most famous symbols.", active: "archive", body: `
<section class="page-head"><div class="wrap"><p class="eyebrow">The Archive</p><h1>Stories behind the symbols</h1><p class="lead">Short, well-sourced histories of the emblems that inspire our pieces, plus a new cipher every month.</p></div></section>
<section class="wrap section"><div class="articles">
${articles.map(a => `<a class="article-card" href="/archive/${a.slug}/"><h3>${esc(a.title)}</h3><p>${esc(a.teaser)}</p><span>Read →</span></a>`).join("")}
<a class="article-card cipher-card" href="/archive/cipher/"><h3>Cipher of the Month</h3><p>Crack this month's coded message and win 15% off your next order.</p><span>Play →</span></a>
</div></section>` }));
for (const a of articles) {
  const shopLink = { "eye-of-providence": "eye", "square-and-compass": "rings", ouroboros: "eye", "the-pentagram": "pendants", "as-above-so-below": "decor", "knights-templar": "accessories" }[a.slug];
  write(`archive/${a.slug}`, layout({ title: a.title, desc: a.teaser, active: "archive", body: `
<article class="wrap narrow article"><a class="crumb" href="/archive/">← The Archive</a><h1>${esc(a.title)}</h1><p class="lead">${esc(a.teaser)}</p>
${a.body.map(p => `<p>${esc(p)}</p>`).join("")}
<div class="article-cta"><p>Inspired by this story?</p><a class="btn gold" href="/shop/${shopLink}/">Shop ${CATS[shopLink].name}</a></div></article>` }));
}
// Cipher: Caesar shift 3. Answer "GOLD IS PATIENT" → hint discount code shown on correct answer.
const plain = "GOLD IS PATIENT";
const enc = plain.replace(/[A-Z]/g, c => String.fromCharCode((c.charCodeAt(0) - 65 + 3) % 26 + 65));
write("archive/cipher", layout({ title: "Cipher of the Month", active: "archive", body: `
<section class="wrap narrow article center"><a class="crumb" href="/archive/">← The Archive</a><h1>Cipher of the Month</h1>
<p class="lead">Julius Caesar is said to have hidden his messages by shifting every letter a few places along the alphabet. Can you read this one?</p>
<p class="cipher">${enc}</p>
<form data-cipher class="cipher-form"><input placeholder="Your answer" required><button class="btn gold">Check</button></form>
<p data-cipher-result class="cipher-result"></p>
<details><summary>Need a hint?</summary><p>Each letter has moved three places forward. Move them back.</p></details></section>` }));

// ---------- ABOUT / CONTACT ----------
write("about", layout({ title: "About", active: "about", body: `
<section class="page-head"><div class="wrap"><p class="eyebrow">About</p><h1>Why the Gilded Order?</h1></div></section>
<section class="wrap narrow article">
<p>People have carved meaning into rings, amulets and stone for thousands of years. An eye that watches, a serpent that renews itself, the tools of a builder. These symbols outlived the empires that made them.</p>
<p>We started The Gilded Order to bring those symbols together in one honest place: a shop of carefully chosen pieces, a club for people who enjoy the history, and an archive that tells the real stories rather than the myths.</p>
<h2>What we are, and aren't</h2>
<p>We are a registered business that sells jewellery and objects, and runs a paid membership with clearly listed perks. We are not a secret society, we do not recruit anyone through private messages, and we are not connected with Freemasonry or any fraternal order.</p>
<p>Our pieces come from established makers and wholesalers. Product names and descriptions on this site are our own.</p></section>` }));
write("contact", layout({ title: "Contact", body: `
<section class="page-head"><div class="wrap"><h1>Contact us</h1><p class="lead">Questions about an order, a custom ring or membership? We reply within two business days.</p></div></section>
<section class="wrap narrow section"><form class="contact-form" data-contact>
<label class="field">Name<input name="name" required></label>
<label class="field">Email<input name="email" type="email" required></label>
<label class="field">Subject<input name="subject" data-subject></label>
<label class="field">Message<textarea name="message" rows="6" required></textarea></label>
<button class="btn gold">Send message</button><p data-contact-msg class="fine"></p></form>
<p class="muted">Or email <a href="mailto:${cfg.email}">${cfg.email}</a></p></section>` }));

// ---------- LEGAL (templates — have them reviewed before launch) ----------
const legal = {
  terms: ["Terms of Service", [
    `These terms apply to your use of this website and to purchases from ${cfg.legalName} ("we", "us"), trading as The Gilded Order.`,
    "Prices are shown in US dollars and include any discounts shown at the time of order. We may correct pricing errors before an order ships.",
    "Product photos show the item as accurately as we can; small differences in colour or finish can occur with handmade and cast pieces.",
    "Nothing on this website promises financial gain, fame, protection, immigration benefits or any outcome beyond the goods and membership perks described.",
    "These terms are governed by the laws of the place where we are registered. Contact us with any question before taking other action."]],
  privacy: ["Privacy Policy", [
    "We collect the details you give us (name, email, shipping address) to process orders, run memberships and answer messages.",
    "Payments are handled by our payment provider; we never see or store your full card number.",
    "We do not sell your data. You can ask us to see, correct or delete your data at any time by contacting us.",
    "We use only the cookies and browser storage needed to run your cart and remember your preferences."]],
  "shipping-returns": ["Shipping & Returns", [
    "Orders ship within 3–7 business days. Tracking is emailed when your order leaves.",
    "Unworn, unused items may be returned within 30 days of delivery for a full refund of the item price. Custom and engraved items cannot be returned unless faulty.",
    "If an item arrives damaged, email us a photo within 7 days and we will replace or refund it."]],
  "membership-terms": ["Membership Terms", [
    "Paid memberships renew monthly until cancelled. You can cancel at any time and keep your perks until the end of the paid period.",
    "Membership perks are exactly those listed on the Membership page. They may change with 30 days' notice by email.",
    "Membership gives no rank, title, protection, payment or benefit outside this website and its events.",
    "We may end a membership that is used to harass others or to misrepresent The Gilded Order, with a pro-rata refund."]]
};
for (const [k, [t, paras]] of Object.entries(legal)) {
  write(`legal/${k}`, layout({ title: t, body: `<article class="wrap narrow article"><h1>${t}</h1><p class="fine">Template, to be reviewed before launch.</p>${paras.map(p => `<p>${esc(p)}</p>`).join("")}</article>` }));
}
write("404.html", layout({ title: "Not found", body: `<section class="page-head center"><div class="wrap"><h1>Lost in the labyrinth</h1><p class="lead">That page doesn't exist.</p><a class="btn gold" href="/">Return home</a></div></section>` }));

// ---------- ASSETS ----------
fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });
for (const f of fs.readdirSync(path.join(__dirname, "assets"))) fs.copyFileSync(path.join(__dirname, "assets", f), path.join(OUT, "assets", f));
fs.writeFileSync(path.join(OUT, "assets", "favicon.svg"), LOGO.replace('class="logo-mark"', 'xmlns="http://www.w3.org/2000/svg" style="color:#c9a24a"'));

// Server-side catalogue for checkout (prices can't be changed by the browser)
fs.mkdirSync(path.join(__dirname, "functions"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "functions", "_catalog.js"),
  "export default " + JSON.stringify(Object.fromEntries(products.filter(p => !p.priceFrom).map(p => [p.slug, { name: p.name, price: p.price }])), null, 1) + ";\n");

// Image manifest: where each photo must be uploaded in R2
fs.writeFileSync(path.join(__dirname, "image-manifest.csv"),
  "product,supplier_page,r2_key_1,r2_key_2\n" + products.map(p => `"${p.name}",${p.link},products/${p.slug}/1.jpg,products/${p.slug}/2.jpg`).join("\n") + "\n");

fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${cfg.siteUrl}/sitemap.txt\n`);
fs.writeFileSync(path.join(OUT, "sitemap.txt"), ["/", "/shop/", ...Object.keys(CATS).map(k => `/shop/${k}/`), ...products.map(p => `/shop/p/${p.slug}/`), "/membership/", "/archive/", ...articles.map(a => `/archive/${a.slug}/`), "/about/", "/contact/"].map(u => cfg.siteUrl + u).join("\n"));
console.log(`Built ${products.length} products, ${articles.length} articles → dist/`);
