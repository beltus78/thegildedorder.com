# SEO log — thegildedorder.com

Automated SEO tasks (daily health check, Tue/Fri article, monthly report) append dated entries here.
Content for SEO lives in data/content.js + data/articles.i18n.js (Archive articles, EN/FR/PT) and data/countries.js (country landing pages).

## 2026-11-20 — SEO onboarding
- Added to the automated SEO tasks (daily health check, Tue/Fri new Archive article, monthly report). Search Console property already exists (linked for Google Ads).
- Fixed: /cart/, /thank-you/ and 404 pages had canonicals and hreflang — now noindex (they were already out of the sitemap).
- Fixed: meta descriptions clipped to 160 chars on a word boundary (many product pages were 165–190); " | The Gilded Order" suffix dropped when a title would pass 65 chars.
- IndexNow key file written by build.js: /52447ccd075156206d1a9189cc54f7b6.txt.
- Known, not changed: several Archive/category/legal pages have short descriptions (40–100 chars); country page titles are 72–82 chars.

## 2026-11-21 — on-page audit
- Titles: suffix dropped when the full title would pass 65 chars; titles still over 65 are cut at a word boundary.
- Meta descriptions: under 110 chars are padded with the site tagline; over 160 clipped at a word boundary.
- Search Console: property verified (Cloudflare DNS) and sitemap submitted.

## 2026-11-21 — daily health check
- Crawled all 219 sitemap URLs locally: all 200, one <h1>, canonicals/hreflang/og/JSON-LD OK.
- Fixed: 11 products without photos (e.g. talisman-of-love, custom-blue-lodge-ring) linked /products/<slug>/1.jpg and 2.jpg, which 404 (22 broken image URLs on ~40 pages; the browser fell back to the placeholder via onerror). build.js now points those <img> straight at the placeholder SVG (same look).
- Fixed: 6 descriptions were still under 110 chars after the tagline pad (/shop/, /shop/accessories/, /shop/decor/, /archive/, two articles) — a second short pad ("Questions answered on WhatsApp." / FR / PT) is added when needed.
- Fixed: titles over 65 chars now drop a trailing " – category" before any word cut (the log said titles were cut, but the code only removed the suffix; e.g. FR onyx bat pendant was 71 chars).
- IndexNow: full sitemap submitted 2026-11-21 (219 URLs, HTTP 200 — covers the pages changed above).

## 2026-11-22 — Google Ads "WhatsApp click" conversion
- Every WhatsApp link (header, top bar, footer, product/contact buttons) and every form that opens WhatsApp now fires the Google Ads conversion AW-18579092076/4sO2CKCL-7wdEOzkmZtF ("WhatsApp click"). Config: `waConversion` in site.config.js; code in build.js head + `openWa` in assets/app.js.

## 2026-11-24 — Tue article: Memento Mori
- New Archive article (EN/FR/PT): /archive/memento-mori/, /fr/archive/memento-mori/, /pt/archive/memento-mori/ — "Memento Mori: Meaning, History and How to Wear a Skull Ring". Target keyword: "memento mori meaning" (+ "memento mori ring", "skull ring meaning"; FR "memento mori signification", PT "memento mori significado"). ~1,000 words per language.
- History kept to sourced facts (Tertullian on the triumph, with the caveat that the exact phrase isn't in the source; Seneca, Marcus Aurelius, Epictetus; Dance of Death at the Holy Innocents, Paris, 1420s; 16th–17th c. skull rings; Shakespeare's 1616 will leaving money for rings; mourning rings; vanitas). No supernatural claims; a respectful "is it unlucky?" answer for buyers.
- build.js: Archive articles can now have optional `desc` (meta description), `seoTitle` and `shop` (CTA category) in data/content.js, plus [desc, seoTitle] as items 4–5 in data/articles.i18n.js; paragraphs starting with "## " render as <h2> and [text](/path) as localised internal links. Older articles render unchanged.
- Internal links (all 200 locally, each language): /shop/p/memento-mori-inlay-signet/, /shop/p/emblem-skull-steel-ring/, /shop/rings/, /archive/ouroboros/, /archive/as-above-so-below/, /membership/, /contact/. On /archive/ and in sitemap.xml with hreflang.
- Search Console: sc-domain:thegildedorder.com is not yet available in Windsor.ai — topic chosen from keyword research.
- Next ideas: sacred geometry (Flower of Life, Metatron's cube — decor pieces), witch's knot meaning, triple moon, Templar cross vs other crosses, gift guide for Father's Day / graduation in South Africa & Kenya, "how to choose a signet ring".


## 2026-11-25 — SEO audit (all sitemap URLs)
**Crawled:** all 222 sitemap URLs on a local build (all 200, one <h1> each, titles ≤65 and descriptions 70–160 chars, canonicals + og tags present, JSON-LD valid, no broken internal links or missing images/assets, robots.txt + sitemap valid).
**Found & fixed:** /fr/contact/ had the same title as /contact/ ("Contact | The Gilded Order") → FR `ctTitle` is now "Nous contacter" (data/i18n.js).
