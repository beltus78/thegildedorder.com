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
