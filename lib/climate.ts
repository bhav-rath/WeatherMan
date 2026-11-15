import type { MonthStat } from './types';

/**
 * Travel comfort score (0-100) per month. Tune the constants below.
 *   comfort temperature t = (mean temp + mean daily max) / 2
 *   tempScore = 100 inside IDEAL_MIN..IDEAL_MAX, minus 8 points per degree outside it
 *   rainScore = 100 - rainfall_mm_per_month / 3   (300 mm or more = 0)
 *   sunScore  = sunshine_hours_per_day / 10 * 100 (10 h or more = 100)
 *   score = 0.5 * tempScore + 0.3 * rainScore + 0.2 * sunScore
 * Labels: >=75 Best, >=60 Good, >=40 Fair, otherwise Avoid.
 */
export const IDEAL_MIN = 18, IDEAL_MAX = 27, W_TEMP = 0.5, W_RAIN = 0.3, W_SUN = 0.2;
const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function scoreMonth(t: number, rain: number, sun: number) {
  const dist = t < IDEAL_MIN ? IDEAL_MIN - t : t > IDEAL_MAX ? t - IDEAL_MAX : 0;
  return Math.round(W_TEMP * clamp(100 - 8 * dist) + W_RAIN * clamp(100 - rain / 3) + W_SUN * clamp((sun / 10) * 100));
}
const labelOf = (s: number): MonthStat['label'] => (s >= 75 ? 'Best' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Avoid');

export async function getClimate(lat: number, lon: number): Promise<MonthStat[]> {
  const y = new Date().getFullYear();
  const u = new URL('https://archive-api.open-meteo.com/v1/archive');
  u.searchParams.set('latitude', String(lat));
  u.searchParams.set('longitude', String(lon));
  u.searchParams.set('start_date', `${y - 5}-01-01`);
  u.searchParams.set('end_date', `${y - 1}-12-31`);
  u.searchParams.set('daily', 'temperature_2m_mean,temperature_2m_max,precipitation_sum,sunshine_duration');
  u.searchParams.set('timezone', 'auto');
  const r = await fetch(u, { next: { revalidate: 86400 * 7 } });
  if (!r.ok) throw new Error('climate failed');
  const d = (await r.json()).daily;
  const acc = Array.from({ length: 12 }, () => ({ tm: 0, tx: 0, tn: 0, rain: 0, sun: 0, sn: 0, days: 0 }));
  d.time.forEach((date: string, i: number) => {
    const a = acc[Number(date.slice(5, 7)) - 1];
    if (d.temperature_2m_mean[i] == null) return;
    a.tm += d.temperature_2m_mean[i]; a.tx += d.temperature_2m_max[i]; a.tn++;
    a.rain += d.precipitation_sum[i] ?? 0; a.days++;
    if (d.sunshine_duration[i] != null) { a.sun += d.sunshine_duration[i] / 3600; a.sn++; }
  });
  return acc.map((a, m) => {
    const temp = a.tn ? (a.tm / a.tn + a.tx / a.tn) / 2 : 0;
    const rain = a.days ? (a.rain / a.days) * 30.4 : 0;
    const sun = a.sn ? a.sun / a.sn : 6;
    const score = scoreMonth(temp, rain, sun);
    const notes = [temp > 32 ? 'very hot' : temp < 8 ? 'cold' : temp >= 18 && temp <= 27 ? 'comfortable temperatures' : 'temperatures outside the comfort range', rain > 200 ? 'very wet' : rain < 60 ? 'little rain' : 'some rain'];
    return { month: m + 1, temp, rain, sun, score, label: labelOf(score), why: `${notes.join(', ')}: about ${Math.round(temp)}°C, ${Math.round(rain)} mm rain, ${sun.toFixed(1)} h sun a day` };
  });
}
