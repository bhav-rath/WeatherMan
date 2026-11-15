import { NextRequest, NextResponse } from 'next/server';
import { searchCities } from '@/lib/openmeteo';

const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string) {
  const now = Date.now(), e = hits.get(ip);
  if (!e || now - e.t > 60_000) { hits.set(ip, { n: 1, t: now }); return false; }
  return ++e.n > 40;
}
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'local';
  if (limited(ip)) return NextResponse.json({ error: 'Too many searches. Wait a minute and try again.' }, { status: 429 });
  const q = (req.nextUrl.searchParams.get('q') ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ results: [] });
  try {
    return NextResponse.json({ results: await searchCities(q) }, { headers: { 'Cache-Control': 's-maxage=86400, stale-while-revalidate' } });
  } catch {
    return NextResponse.json({ error: 'City search is unavailable. Try again shortly.' }, { status: 502 });
  }
}
