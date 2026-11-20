# SEO log — thegildedorder.com

Automated SEO tasks (daily health check, Tue/Fri article, monthly report) append dated entries here.
Content for SEO lives in data/content.js + data/articles.i18n.js (Archive articles, EN/FR/PT) and data/countries.js (country landing pages).

## 2026-11-20 — SEO onboarding
- Added to the automated SEO tasks (daily health check, Tue/Fri new Archive article, monthly report). Search Console property already exists (linked for Google Ads).
- Fixed: /cart/, /thank-you/ and 404 pages had canonicals and hreflang — now noindex (they were already out of the sitemap).
- Fixed: meta descriptions clipped to 160 chars on a word boundary (many product pages were 165–190); " | The Gilded Order" suffix dropped when a title would pass 65 chars.
- IndexNow key file written by build.js: /52447ccd075156206d1a9189cc54f7b6.txt.
- Known, not changed: several Archive/category/legal pages have short descriptions (40–100 chars); country page titles are 72–82 chars.
