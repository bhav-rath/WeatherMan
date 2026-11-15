import type { Place } from './types';
const CATS: [string, RegExp][] = [
  ['Nature', /park|garden|lake|mountain|beach|river|island|forest|waterfall|zoo|bay|hill/i],
  ['History', /castle|palace|fort|temple|church|cathedral|mosque|monument|historic|ruins|tower|gate|memorial/i],
  ['Culture', /museum|gallery|theatre|theater|opera|library|art|square|bridge/i],
  ['Food', /market|restaurant|cafe|cuisine|food|street/i],
];
const SKIP = /school|university|college|station|hospital|stadium|high school|railway|airport|company|church of .* parish/i;

export async function getPlaces(lat: number, lon: number): Promise<Place[]> {
  const u = new URL('https://en.wikipedia.org/w/api.php');
  const q: Record<string, string> = {
    action: 'query', format: 'json', generator: 'geosearch', ggscoord: `${lat}|${lon}`, ggsradius: '10000', ggslimit: '50',
    prop: 'pageimages|extracts|coordinates', piprop: 'thumbnail', pithumbsize: '480', exintro: '1', explaintext: '1', exsentences: '2', exlimit: 'max', colimit: 'max',
  };
  Object.entries(q).forEach(([k, v]) => u.searchParams.set(k, v));
  const r = await fetch(u, { headers: { 'User-Agent': 'weather-trip-planner/1.0' }, next: { revalidate: 86400 * 7 } });
  if (!r.ok) throw new Error('places failed');
  const pages = Object.values((await r.json()).query?.pages ?? {}) as any[];
  return pages
    .filter((p) => p.coordinates?.[0] && (p.extract || '').length > 60 && !SKIP.test(p.title))
    .sort((a, b) => (b.thumbnail ? 1 : 0) - (a.thumbnail ? 1 : 0) || a.index - b.index)
    .slice(0, 12)
    .map((p) => {
      const text = `${p.title} ${p.extract}`;
      const cat = CATS.find(([, re]) => re.test(text))?.[0] ?? 'Sights';
      const { lat: la, lon: lo } = p.coordinates[0];
      return { id: p.pageid, title: p.title, desc: p.extract, cat, lat: la, lon: lo, img: p.thumbnail?.source, url: `https://en.wikipedia.org/?curid=${p.pageid}`, map: `https://www.google.com/maps/search/?api=1&query=${la},${lo}` };
    });
}
