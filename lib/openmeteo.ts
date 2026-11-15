import type { City, Forecast } from './types';
const GEO = 'https://geocoding-api.open-meteo.com/v1';

export async function searchCities(q: string): Promise<City[]> {
  const r = await fetch(`${GEO}/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`, { next: { revalidate: 86400 } });
  if (!r.ok) throw new Error('geocode failed');
  return (await r.json()).results ?? [];
}
export async function getCity(id: number): Promise<City | null> {
  const r = await fetch(`${GEO}/get?id=${id}`, { next: { revalidate: 86400 } });
  if (!r.ok) return null;
  const j = await r.json();
  return j && j.id ? j : null;
}
export async function getForecast(lat: number, lon: number): Promise<Forecast> {
  const u = new URL('https://api.open-meteo.com/v1/forecast');
  u.searchParams.set('latitude', String(lat));
  u.searchParams.set('longitude', String(lon));
  u.searchParams.set('timezone', 'auto');
  u.searchParams.set('forecast_days', '16');
  u.searchParams.set('current', 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day');
  u.searchParams.set('hourly', 'temperature_2m,precipitation_probability,weather_code');
  u.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,uv_index_max,sunrise,sunset');
  const r = await fetch(u, { next: { revalidate: 1800 } });
  if (!r.ok) throw new Error('forecast failed');
  const j = await r.json();
  const d = j.daily, h = j.hourly, c = j.current;
  const start = Math.max(0, h.time.findIndex((t: string) => t >= c.time.slice(0, 13) + ':00'));
  return {
    current: { temp: c.temperature_2m, feels: c.apparent_temperature, humidity: c.relative_humidity_2m, wind: c.wind_speed_10m, code: c.weather_code, isDay: c.is_day === 1, uv: d.uv_index_max[0], sunrise: d.sunrise[0], sunset: d.sunset[0] },
    daily: d.time.slice(0, 15).map((date: string, i: number) => ({ date, code: d.weather_code[i], max: d.temperature_2m_max[i], min: d.temperature_2m_min[i], pop: d.precipitation_probability_max[i] ?? 0, precip: d.precipitation_sum[i] ?? 0, wind: d.wind_speed_10m_max[i] })),
    hourly: h.time.slice(start, start + 48).map((time: string, i: number) => ({ time, temp: h.temperature_2m[start + i], pop: h.precipitation_probability[start + i] ?? 0, code: h.weather_code[start + i] })),
  };
}
