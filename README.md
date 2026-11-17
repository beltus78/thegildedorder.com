# The Gilded Order

Static site + Cloudflare Pages Functions, in English (/), French (/fr/) and Brazilian Portuguese (/pt/).
Text lives in `data/i18n.js` (interface), `data/products.i18n.js` and `data/articles.i18n.js`. A new product needs its French and Portuguese entry too, or the build stops with a message.

## Build
```
node build.js        # outputs ./dist, functions/_catalog.js and image-manifest.csv
```

## Deploy (Cloudflare Pages, from GitHub)
Pages settings: build command `node build.js`, build output directory `dist`. Every push to `main` redeploys.

Manual deploy instead:
```
npx wrangler pages deploy dist --project-name gilded-order
```
(`functions/` is picked up automatically when you deploy from this folder.)

Then in the Pages project settings:
- **STRIPE_SECRET_KEY**: turns on checkout. Until it's set, the cart shows "Checkout opens soon".
- **KV binding GILDED_KV**: stores waitlist sign-ups and contact messages.
- In Stripe, create the promotion code **CAESAR15** (15% off). It's the prize for the cipher puzzle.

## Product photos
Photos live in `images/products/<slug>/1.jpg, 2.jpg ...` (1000x1000 JPG). The first is the main photo. Add a folder, push, done.

### Optional: serve from R2 instead (bucket `gilded-order-media`)
1. Upload 2+ photos per product. The exact file names are in `image-manifest.csv`, e.g. `products/sterling-square-and-compass-signet/1.jpg`.
   ```
   npx wrangler r2 object put gilded-order-media/products/<slug>/1.jpg --file ./photo.jpg
   ```
2. Turn on public access for the bucket (r2.dev URL or a custom domain such as media.yourdomain.com).
3. Put that URL in `site.config.js` → `imageBase`, run `node build.js`, and deploy.
For more than 2 photos per product, raise `imagesPerProduct`.

Only upload photos you have the rights to use (as a Faire retailer for that brand, or with the supplier's written OK).

## Before launch
- `site.config.js`: real email, registered company name and address.
- `data/products.js`: prices marked `priceToConfirm: true` are estimates. Check them against your wholesale cost.
- Have the legal page templates reviewed.

## Supplier email template
> Subject: Product photos for [product name]
>
> Hello [supplier], I run The Gilded Order, an online shop, and I'm stocking your [product name]. Could you send your product image pack, and confirm we may use the photos on our website and social media to sell your products? Thank you, Beltus
