import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getCity, getForecast } from '@/lib/openmeteo';
import { getClimate } from '@/lib/climate';
import { getPlaces } from '@/lib/places';
import { idFromSlug, cityLabel } from '@/lib/slug';
import CityView from '@/components/CityView';

export const revalidate = 1800;
type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = await getCity(idFromSlug(params.slug), params.slug).catch(() => null);
  if (!city) return { title: 'City not found' };
  return { title: `${city.name} weather, best time to visit and trip cost`, description: `15-day forecast, best months to visit, trip estimate and places to see in ${cityLabel(city)}.` };
}
export default async function CityPage({ params }: Props) {
  const id = idFromSlug(params.slug);
  if (!Number.isInteger(id)) notFound();
  const city = await getCity(id, params.slug).catch(() => null);
  if (!city) notFound();
  const [forecast, climate, places] = await Promise.all([
    getForecast(city.latitude, city.longitude).catch(() => null),
    getClimate(city.latitude, city.longitude).catch(() => null),
    getPlaces(city.latitude, city.longitude).catch(() => null),
  ]);
  return (
    <>
      <nav className="mx-auto max-w-5xl px-5 pt-4"><Link href="/" className="text-sm underline">Search another city</Link></nav>
      <CityView city={city} forecast={forecast} climate={climate} places={places} />
    </>
  );
}
