export type City = { id: number; name: string; admin1?: string; country: string; country_code: string; latitude: number; longitude: number; timezone?: string };
export type Forecast = {
  current: { temp: number; feels: number; humidity: number; wind: number; code: number; isDay: boolean; uv: number; sunrise: string; sunset: string };
  daily: { date: string; code: number; max: number; min: number; pop: number; precip: number; wind: number }[];
  hourly: { time: string; temp: number; pop: number; code: number }[];
};
export type MonthStat = { month: number; temp: number; rain: number; sun: number; score: number; label: 'Best' | 'Good' | 'Fair' | 'Avoid'; why: string };
export type Place = { id: number; title: string; desc: string; cat: string; lat: number; lon: number; img?: string; url: string; map: string };
