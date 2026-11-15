'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { City } from '@/lib/types';
import { citySlug, cityLabel } from '@/lib/slug';

export default function CitySearch({ placeholder, onPick, autoFocus }: { placeholder: string; onPick?: (c: City) => void; autoFocus?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [res, setRes] = useState<City[]>([]);
  const [state, setState] = useState<'idle' | 'loading' | 'empty' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timer.current);
    if (q.trim().length < 2) { setRes([]); setState('idle'); return; }
    setState('loading');
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        setRes(j.results); setState(j.results.length ? 'idle' : 'empty');
      } catch (e: any) { setMsg(e.message || 'Search failed.'); setState('error'); }
    }, 300);
    return () => clearTimeout(timer.current);
  }, [q]);

  function pick(c: City) {
    setQ(''); setRes([]);
    if (onPick) return onPick(c);
    try { localStorage.setItem('lastCity', JSON.stringify({ slug: citySlug(c), label: cityLabel(c) })); } catch {}
    router.push(`/city/${citySlug(c)}`);
  }
  return (
    <div className="relative">
      <label className="sr-only" htmlFor={`s-${placeholder}`}>{placeholder}</label>
      <input id={`s-${placeholder}`} autoFocus={autoFocus} value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} autoComplete="off" role="combobox" aria-expanded={res.length > 0} aria-controls="city-list"
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
      <div aria-live="polite" className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {state === 'loading' && 'Searching…'}
        {state === 'empty' && 'No cities found. Check the spelling or try a nearby larger city.'}
        {state === 'error' && msg}
      </div>
      {res.length > 0 && (
        <ul id="city-list" role="listbox" className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {res.map((c) => (
            <li key={c.id} role="option" aria-selected="false">
              <button type="button" onClick={() => pick(c)} className="w-full px-4 py-2 text-left text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800">
                {c.name}<span className="text-slate-500 dark:text-slate-400">{[c.admin1, c.country].filter(Boolean).length ? ', ' + [c.admin1, c.country].filter(Boolean).join(', ') : ''}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
