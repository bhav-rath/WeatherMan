import Link from 'next/link';
import CitySearch from '@/components/CitySearch';
const POPULAR = [['Paris', 'france', 2988507], ['Tokyo', 'japan', 1850147], ['London', 'united-kingdom', 2643743], ['New York', 'united-states', 5128581], ['Bengaluru', 'india', 1277333], ['Sydney', 'australia', 2147714]] as const;
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-5 py-16">
      <div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Where are you headed?</h1>
        <p className="mt-3 max-w-prose text-lg text-slate-600 dark:text-slate-300">Check the next 15 days of weather, find the best month to go, estimate what the trip will cost and see what to visit.</p>
      </div>
      <CitySearch placeholder="Search any city in the world" autoFocus />
      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-400">Popular cities</h2>
        <ul className="flex flex-wrap gap-2">
          {POPULAR.map(([n, c, id]) => (
            <li key={id}><Link className="rounded-full border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" href={`/city/${n.toLowerCase().replace(' ', '-')}-${c}-${id}`}>{n}</Link></li>
          ))}
        </ul>
      </div>
    </main>
  );
}
