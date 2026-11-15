'use client';
import { useState } from 'react';
import type { City, MonthStat } from '@/lib/types';
import { COSTS, FLIGHT_BASE, FLIGHT_PER_KM, FLIGHT_STYLE, RATES, Style, km, tierFor } from '@/lib/costs';
import CitySearch from './CitySearch';
import { cityLabel } from '@/lib/slug';

export type Trip = { days: number; travelers: number; style: Style; month: number; dep: City | null };
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const inp = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

export default function TripEstimate({ city, months, trip, setTrip }: { city: City; months: MonthStat[] | null; trip: Trip; setTrip: (t: Trip) => void }) {
  const [cur, setCur] = useState('USD');
  const set = (p: Partial<Trip>) => setTrip({ ...trip, ...p });
  const fmt = (usd: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(usd * RATES[cur]);
  const top3 = months ? [...months].sort((a, b) => b.score - a.score).slice(0, 3).map((m) => m.month) : [];
  const peak = top3.includes(trip.month), low = months?.[trip.month - 1]?.label === 'Avoid';
  const f = peak ? 1.3 : low ? 0.85 : 1;
  const [stay, food, transport, act] = COSTS[tierFor(city.country_code)][trip.style];
  const n = trip.days * trip.travelers;
  const rows: [string, number, number, number][] = [
    ['Accommodation', stay, 0.85, 1.15], ['Food', food, 0.85, 1.15], ['Local transport', transport, 0.85, 1.15], ['Activities', act, 0.85, 1.15],
  ].map(([l, v, a, b]) => [l as string, (v as number) * n * f, (a as number), (b as number)]);
  const out = rows.map(([l, base, a, b]) => ({ l, min: base * a, max: base * b }));
  if (trip.dep) {
    const flight = (FLIGHT_BASE + FLIGHT_PER_KM * km(trip.dep, city)) * FLIGHT_STYLE[trip.style] * trip.travelers;
    out.push({ l: `Return flights from ${trip.dep.name}`, min: flight * 0.7, max: flight * 1.5 });
  }
  const min = out.reduce((s, r) => s + r.min, 0), max = out.reduce((s, r) => s + r.max, 0);
  return (
    <section aria-labelledby="trip-h" className="space-y-5">
      <h2 id="trip-h" className="text-xl font-semibold">Trip estimate for {city.name}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="grid gap-1 text-sm">Trip length (days)<input type="number" min={1} max={60} value={trip.days} onChange={(e) => set({ days: Math.min(60, Math.max(1, +e.target.value || 1)) })} className={inp} /></label>
        <label className="grid gap-1 text-sm">Travelers<input type="number" min={1} max={20} value={trip.travelers} onChange={(e) => set({ travelers: Math.min(20, Math.max(1, +e.target.value || 1)) })} className={inp} /></label>
        <label className="grid gap-1 text-sm">Travel style
          <select value={trip.style} onChange={(e) => set({ style: e.target.value as Style })} className={inp}><option value="budget">Budget</option><option value="mid">Mid-range</option><option value="luxury">Luxury</option></select></label>
        <label className="grid gap-1 text-sm">Travel month
          <select value={trip.month} onChange={(e) => set({ month: +e.target.value })} className={inp}>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select></label>
        <label className="grid gap-1 text-sm">Currency
          <select value={cur} onChange={(e) => setCur(e.target.value)} className={inp}>{Object.keys(RATES).map((c) => <option key={c}>{c}</option>)}</select></label>
        <div className="grid gap-1 text-sm">Departing from
          <CitySearch placeholder="Search your departure city" onPick={(c) => set({ dep: c })} />
          {trip.dep && <span>{cityLabel(trip.dep)} <button className="underline" onClick={() => set({ dep: null })}>Clear</button></span>}</div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-900"><tr><th className="p-3">Category</th><th className="p-3">Estimated range</th></tr></thead>
          <tbody>
            {out.map((r) => <tr key={r.l} className="border-t border-slate-200 dark:border-slate-800"><td className="p-3">{r.l}</td><td className="p-3">{fmt(r.min)} to {fmt(r.max)}</td></tr>)}
            <tr className="border-t-2 border-slate-300 font-semibold dark:border-slate-700"><td className="p-3">Total for {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}</td><td className="p-3">{fmt(min)} to {fmt(max)}</td></tr>
            <tr className="font-semibold"><td className="p-3">Per person</td><td className="p-3">{fmt(min / trip.travelers)} to {fmt(max / trip.travelers)}</td></tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm">{peak ? `${MONTHS[trip.month - 1]} is one of the best months to visit, so expect peak-season prices about 20 to 40% higher (30% applied).` : low ? `${MONTHS[trip.month - 1]} is a low-demand month here, so prices may be around 15% lower (15% applied).` : `${MONTHS[trip.month - 1]} is a shoulder month. No seasonal adjustment applied.`}</p>
      <p className="text-sm text-slate-600 dark:text-slate-400">These are rough estimates from a regional daily-cost table and exchange rates that are not live. Real prices vary. Flights use a distance-based guess and are only shown when you choose a departure city.</p>
    </section>
  );
}
