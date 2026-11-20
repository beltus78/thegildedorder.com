// POST /api/checkout → creates a Stripe Checkout Session from the server-side catalogue.
// Set the secret in Cloudflare Pages: Settings → Environment variables → STRIPE_SECRET_KEY
import catalog from "../_catalog.js";
import { SHIP_COUNTRIES, rateFor } from "../_shipping.js";

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY) return json({ error: "Checkout opens soon. Please check back shortly." }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Bad request" }, 400); }
  const items = (body.items || []).filter(i => catalog[i.slug]).slice(0, 50);
  if (!items.length) return json({ error: "Your cart is empty." }, 400);

  const origin = new URL(request.url).origin;
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", origin + "/thank-you/");
  form.set("cancel_url", origin + "/cart/");
  form.set("allow_promotion_codes", "true");
  // Ship to the country chosen in the cart (US + African target markets)
  const country = SHIP_COUNTRIES.includes(body.country) ? body.country : "US";
  form.set("shipping_address_collection[allowed_countries][0]", country);
  const subtotal = items.reduce((s, i) => s + catalog[i.slug].price * Math.min(20, Math.max(1, parseInt(i.qty, 10) || 1)), 0);
  const r0 = rateFor(country), free = subtotal >= r0.freeOver;
  form.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
  form.set("shipping_options[0][shipping_rate_data][display_name]", free ? "Free tracked shipping" : (country === "US" ? "Tracked shipping" : "Tracked international shipping"));
  form.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", free ? 0 : Math.round(r0.rate * 100));
  form.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "usd");
  form.set("shipping_options[0][shipping_rate_data][delivery_estimate][minimum][unit]", "business_day");
  form.set("shipping_options[0][shipping_rate_data][delivery_estimate][minimum][value]", r0.min);
  form.set("shipping_options[0][shipping_rate_data][delivery_estimate][maximum][unit]", "business_day");
  form.set("shipping_options[0][shipping_rate_data][delivery_estimate][maximum][value]", r0.max);
  form.set("phone_number_collection[enabled]", "true");
  items.forEach((i, n) => {
    const p = catalog[i.slug];
    const qty = Math.min(20, Math.max(1, parseInt(i.qty, 10) || 1));
    const size = String(i.size || "").replace(/[^0-9.]/g, "").slice(0, 4);
    form.set(`line_items[${n}][quantity]`, qty);
    form.set(`line_items[${n}][price_data][currency]`, "usd");
    form.set(`line_items[${n}][price_data][unit_amount]`, Math.round(p.price * 100));
    form.set(`line_items[${n}][price_data][product_data][name]`, p.name + (size ? ` (size ${size})` : ""));
  });

  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form
  });
  const d = await r.json();
  return r.ok ? json({ url: d.url }) : json({ error: "Checkout is temporarily unavailable." }, 502);
}

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });
