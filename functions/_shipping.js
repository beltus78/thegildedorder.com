// Shipping rates (USD). Keep in sync with Merchant Center shipping settings.
export const SHIP_COUNTRIES = ["US", "ZA", "KE", "CM", "CD", "ML", "TD", "CI", "SN"];
export const RATES = { US: { rate: 5.95, freeOver: 50, min: 3, max: 7 }, INTL: { rate: 19.95, freeOver: 150, min: 10, max: 21 } };
export const rateFor = c => (c === "US" ? RATES.US : RATES.INTL);
