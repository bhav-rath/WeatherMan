/**
 * Editable cost model. All figures are approximate USD per person per day: [stay, food, transport, activities].
 * Not live prices. Adjust COSTS, TIER_BY_COUNTRY, RATES and the flight formula to tune estimates.
 */
export type Style = 'budget' | 'mid' | 'luxury';
export const COSTS: Record<string, Record<Style, number[]>> = {
  low: { budget: [18, 10, 4, 6], mid: [45, 20, 8, 15], luxury: [120, 50, 20, 40] },
  mid: { budget: [30, 15, 6, 10], mid: [80, 30, 12, 25], luxury: [200, 80, 30, 70] },
  high: { budget: [55, 25, 10, 15], mid: [140, 50, 20, 40], luxury: [350, 130, 50, 110] },
  premium: { budget: [80, 35, 15, 20], mid: [190, 70, 28, 55], luxury: [450, 170, 70, 150] },
};
export const TIER_BY_COUNTRY: Record<string, string> = {
  ...Object.fromEntries('IN NP LK BD PK VN KH LA ID PH TH EG MA TN ET KE UZ GE AL'.split(' ').map((c) => [c, 'low'])),
  ...Object.fromEntries('FR DE IT US CA AU NZ JP GB IE AT BE NL SG AE SE FI IL QA'.split(' ').map((c) => [c, 'high'])),
  ...Object.fromEntries('CH NO IS DK LU'.split(' ').map((c) => [c, 'premium'])),
};
export const tierFor = (cc: string) => TIER_BY_COUNTRY[cc] ?? 'mid';
export const RATES: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, INR: 84, JPY: 150, AUD: 1.52, CAD: 1.37 };
export const FLIGHT_BASE = 60, FLIGHT_PER_KM = 0.1; // round-trip economy per person, USD
export const FLIGHT_STYLE: Record<Style, number> = { budget: 0.9, mid: 1, luxury: 2.5 };
export const km = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) => {
  const r = (x: number) => (x * Math.PI) / 180;
  const h = Math.sin(r(b.latitude - a.latitude) / 2) ** 2 + Math.cos(r(a.latitude)) * Math.cos(r(b.latitude)) * Math.sin(r(b.longitude - a.longitude) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};
