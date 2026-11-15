const M: Record<number, [string, string]> = {
  0: ['Clear sky', '☀️'], 1: ['Mostly clear', '🌤️'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁️'], 45: ['Fog', '🌫️'], 48: ['Freezing fog', '🌫️'],
  51: ['Light drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Heavy drizzle', '🌧️'], 56: ['Freezing drizzle', '🌧️'], 57: ['Freezing drizzle', '🌧️'],
  61: ['Light rain', '🌦️'], 63: ['Rain', '🌧️'], 65: ['Heavy rain', '🌧️'], 66: ['Freezing rain', '🌧️'], 67: ['Freezing rain', '🌧️'],
  71: ['Light snow', '🌨️'], 73: ['Snow', '❄️'], 75: ['Heavy snow', '❄️'], 77: ['Snow grains', '❄️'],
  80: ['Light showers', '🌦️'], 81: ['Showers', '🌧️'], 82: ['Violent showers', '⛈️'], 85: ['Snow showers', '🌨️'], 86: ['Heavy snow showers', '🌨️'],
  95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm with hail', '⛈️'], 99: ['Thunderstorm with hail', '⛈️'],
};
export const wmo = (c: number): [string, string] => M[c] ?? ['Unknown', '❓'];
export function themeOf(code: number, day: boolean) {
  const snow = [71, 73, 75, 77, 85, 86].includes(code);
  const rain = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;
  const cloud = [2, 3, 45, 48].includes(code);
  if (!day) return 'from-slate-800 to-slate-950 text-white';
  if (snow) return 'from-sky-100 to-slate-300 text-slate-900 dark:from-slate-700 dark:to-slate-900 dark:text-white';
  if (rain) return 'from-slate-300 to-sky-200 text-slate-900 dark:from-slate-800 dark:to-sky-950 dark:text-white';
  if (cloud) return 'from-slate-200 to-sky-100 text-slate-900 dark:from-slate-800 dark:to-slate-900 dark:text-white';
  return 'from-amber-100 to-sky-200 text-slate-900 dark:from-sky-900 dark:to-slate-900 dark:text-white';
}
