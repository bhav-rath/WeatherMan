'use client';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import type { City, Forecast, MonthStat, Place } from '@/lib/types';
import { themeOf, wmo } from '@/lib/wmo';
import { cityLabel } from '@/lib/slug';
import { PrecipChart, TempChart } from './Charts';
import TripEstimate, { MONTHS, Trip } from './TripEstimate';

const PlacesMap = dynamic(() => import('./PlacesMap'), { ssr: false, loading: () => <div className="h-80 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" /> });
const TABS = ['Forecast', 'Best time to visit', 'Trip estimate', 'Places'];
const BAR: Record<string, string> = { Best: 'bg-emerald-500', Good: 'bg-sky-500', Fair: 'bg-amber-500', Avoid: 'bg-rose-500' };
const card = 'rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900';
const Err = ({ what }: { what: string }) => <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100">{what} could not be loaded. Refresh the page in a moment.</p>;

export default function CityView({ city, forecast, climate, places }: { city: City; forecast: Forecast | null; climate: MonthStat[] | null; places: Place[] | null }) {
  const [tab, setTab] = useState(0);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [speed, setSpeed] = useState<'kmh' | 'mph'>('kmh');
  const [cat, setCat] = useState('All');
  const best = useMemo(() => (climate ? [...climate].sort((a, b) => b.score - a.score) : []), [climate]);
  const [trip, setTrip] = useState<Trip>({ days: 5, travelers: 2, style: 'mid', month: 1, dep: null });
  useEffect(() => { if (best[0]) setTrip((t) => ({ ...t, month: best[0].month })); }, [best]);

  const conv = (c: number) => (unit === 'C' ? Math.round(c) : Math.round((c * 9) / 5 + 32));
  const sp = (k: number) => (speed === 'kmh' ? Math.round(k) : Math.round(k * 0.621371));
  const c = forecast?.current;
  const theme = c ? themeOf(c.code, c.isDay) : 'from-slate-200 to-slate-100 text-slate-900 dark:from-slate-800 dark:to-slate-900 dark:text-white';
  const cats = ['All', ...Array.from(new Set((places ?? []).map((p) => p.cat)))];
  const shown = (places ?? []).filter((p) => cat === 'All' || p.cat === cat);
  const per = Math.max(1, Math.ceil(shown.length / trip.days));
  const plan = Array.from({ length: Math.min(trip.days, Math.ceil(shown.length / per)) }, (_, i) => shown.slice(i * per, i * per + per));
  const hm = (iso: string) => iso.slice(11, 16);

  return (
    <main>
      <header className={`bg-gradient-to-b ${theme} transition-colors`}>
        <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-4 px-5 py-8">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">{cityLabel(city)}</h1>
            {c ? <p className="mt-2 text-xl">{wmo(c.code)[1]} {conv(c.temp)}°{unit}, {wmo(c.code)[0].toLowerCase()}</p> : <p className="mt-2">Current conditions unavailable.</p>}
            {c && <p className="text-sm opacity-80">Feels like {conv(c.feels)}°</p>}
          </div>
          <div className="flex gap-2 text-sm" role="group" aria-label="Units">
            <button aria-pressed={unit === 'C'} onClick={() => setUnit(unit === 'C' ? 'F' : 'C')} className="rounded-lg border border-current px-3 py-1.5">°{unit} (switch to °{unit === 'C' ? 'F' : 'C'})</button>
            <button aria-pressed={speed === 'mph'} onClick={() => setSpeed(speed === 'kmh' ? 'mph' : 'kmh')} className="rounded-lg border border-current px-3 py-1.5">{speed === 'kmh' ? 'km/h' : 'mph'}</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 pb-16">
        <div role="tablist" aria-label="City sections" className="-mt-px flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
          {TABS.map((t, i) => (
            <button key={t} role="tab" id={`tab-${i}`} aria-selected={tab === i} aria-controls={`panel-${i}`} tabIndex={tab === i ? 0 : -1} onClick={() => setTab(i)}
              onKeyDown={(e) => { if (e.key === 'ArrowRight') setTab((tab + 1) % 4); if (e.key === 'ArrowLeft') setTab((tab + 3) % 4); }}
              className={`whitespace-nowrap px-4 py-3 text-sm font-medium ${tab === i ? 'border-b-2 border-sun' : 'text-slate-600 dark:text-slate-400'}`}>{t}</button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="space-y-6 pt-6">
          {tab === 0 && (!forecast ? <Err what="The forecast" /> : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[['Humidity', `${c!.humidity}%`], ['Wind', `${sp(c!.wind)} ${speed === 'kmh' ? 'km/h' : 'mph'}`], ['UV index today', String(Math.round(c!.uv))], ['Sunrise / sunset', `${hm(c!.sunrise)} / ${hm(c!.sunset)}`]].map(([l, v]) => (
                  <div key={l} className={card}><div className="text-sm text-slate-600 dark:text-slate-400">{l}</div><div className="text-xl font-semibold">{v}</div></div>
                ))}
              </div>
              <section aria-labelledby="h15"><h2 id="h15" className="mb-3 text-xl font-semibold">Next 15 days</h2>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {forecast.daily.map((d) => (
                    <li key={d.date} className={card}>
                      <div className="text-sm font-medium">{new Date(d.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                      <div className="my-1 text-2xl" aria-hidden>{wmo(d.code)[1]}</div>
                      <div className="text-sm">{wmo(d.code)[0]}</div>
                      <div className="mt-1 font-semibold">{conv(d.max)}° <span className="font-normal text-slate-500">/ {conv(d.min)}°</span></div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Rain chance {d.pop}%<br />Wind {sp(d.wind)} {speed === 'kmh' ? 'km/h' : 'mph'}</div>
                    </li>
                  ))}
                </ul></section>
              <section aria-labelledby="hh"><h2 id="hh" className="mb-3 text-xl font-semibold">Next 48 hours</h2>
                <ul className="flex gap-2 overflow-x-auto pb-2">
                  {forecast.hourly.map((h) => (
                    <li key={h.time} className={`${card} min-w-[84px] text-center text-sm`}>
                      <div className="text-slate-600 dark:text-slate-400">{hm(h.time)}</div><div className="text-xl" aria-hidden>{wmo(h.code)[1]}</div><div className="font-semibold">{conv(h.temp)}°</div><div className="text-xs">{h.pop}%</div>
                    </li>
                  ))}
                </ul></section>
              <div className="grid gap-4 md:grid-cols-2">
                <div className={card}><h3 className="mb-2 font-semibold">Temperature</h3><TempChart days={forecast.daily} conv={conv} unit={unit} /></div>
                <div className={card}><h3 className="mb-2 font-semibold">Precipitation</h3><PrecipChart days={forecast.daily} /></div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Forecasts beyond 7 days are less reliable. Data from Open-Meteo, refreshed every 30 minutes.</p>
            </>
          ))}

          {tab === 1 && (!climate ? <Err what="Climate history" /> : (
            <section className="space-y-5" aria-labelledby="bt">
              <h2 id="bt" className="text-xl font-semibold">Best time to visit {city.name}</h2>
              <ul className="flex h-56 items-end gap-1.5 sm:gap-3" aria-label="Travel score by month">
                {climate.map((m) => (
                  <li key={m.month} className="flex h-full flex-1 flex-col justify-end text-center text-xs">
                    <span className="font-semibold">{m.score}</span>
                    <div className={`${BAR[m.label]} rounded-t`} style={{ height: `${Math.max(m.score, 4) * 0.7}%` }} title={`${MONTHS[m.month - 1]}: ${m.label}`} />
                    <span className="mt-1">{MONTHS[m.month - 1].slice(0, 3)}</span><span className="text-[10px] text-slate-600 dark:text-slate-400">{m.label}</span>
                  </li>
                ))}
              </ul>
              <div className="grid gap-4 md:grid-cols-2">
                <div className={card}><h3 className="mb-2 font-semibold">Top 3 months</h3><ol className="space-y-2 text-sm">{best.slice(0, 3).map((m) => <li key={m.month}><b>{MONTHS[m.month - 1]}</b> (score {m.score}): {m.why}.</li>)}</ol></div>
                <div className={card}><h3 className="mb-2 font-semibold">Months to avoid</h3>
                  {climate.filter((m) => m.label === 'Avoid').length ? <ul className="space-y-2 text-sm">{climate.filter((m) => m.label === 'Avoid').map((m) => <li key={m.month}><b>{MONTHS[m.month - 1]}</b> (score {m.score}): {m.why}.</li>)}</ul> : <p className="text-sm">No month scores as Avoid. The weather is fair all year.</p>}</div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Score = 50% temperature comfort (ideal 18 to 27°C), 30% low rainfall, 20% sunshine, based on the last 5 years of observed weather.</p>
            </section>
          ))}

          {tab === 2 && <TripEstimate city={city} months={climate} trip={trip} setTrip={setTrip} />}

          {tab === 3 && (!places ? <Err what="Places" /> : !places.length ? <p>No attractions were found near {city.name}. Try a larger nearby city.</p> : (
            <section className="space-y-5" aria-labelledby="pl">
              <h2 id="pl" className="text-xl font-semibold">Places to visit in {city.name}</h2>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
                {cats.map((k) => <button key={k} aria-pressed={cat === k} onClick={() => setCat(k)} className={`rounded-full border px-3 py-1 text-sm ${cat === k ? 'border-sun bg-sun text-ink' : 'border-slate-300 dark:border-slate-700'}`}>{k}</button>)}
              </div>
              <PlacesMap center={{ lat: city.latitude, lon: city.longitude }} places={shown} />
              <ul className="grid gap-4 sm:grid-cols-2">
                {shown.map((p) => (
                  <li key={p.id} className={`${card} flex gap-3`}>
                    {p.img && <img src={p.img} alt="" loading="lazy" className="h-24 w-24 shrink-0 rounded-lg object-cover" />}
                    <div className="min-w-0"><h3 className="font-semibold">{p.title}</h3><span className="text-xs text-slate-600 dark:text-slate-400">{p.cat}</span>
                      <p className="line-clamp-3 text-sm">{p.desc}</p>
                      <p className="mt-1 text-sm"><a className="underline" href={p.url} target="_blank" rel="noreferrer">Wikipedia</a>{' '}<a className="underline" href={p.map} target="_blank" rel="noreferrer">Google Maps</a></p></div>
                  </li>
                ))}
              </ul>
              <div><h3 className="mb-2 text-lg font-semibold">Suggested itinerary ({trip.days}-day trip)</h3>
                <ol className="space-y-3">{plan.map((d, i) => <li key={i} className={card}><b>Day {i + 1}</b>: {d.map((p) => p.title).join(', ')}</li>)}</ol>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Change the trip length in the Trip estimate tab. Places come from Wikipedia and are grouped in the order of the list, not by travel time.</p></div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
