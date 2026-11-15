# Weather & Trip Planner

Next.js (App Router) + TypeScript + Tailwind. Hosted on Vercel, source on GitHub. No database, no API keys.

Features: city search worldwide, 15-day forecast with charts and 48-hour breakdown, °C/°F and km/h/mph toggles, best-month scoring from 5 years of climate history, trip cost estimate with currency selector, places to visit with a Leaflet/OpenStreetMap map and a day-by-day itinerary, light/dark mode, per-city URLs like `/city/paris-france-2988507`.

## Run locally
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build check
```
No environment variables are required (see `.env.example`).

## Deploy: GitHub to Vercel
1. `git init && git add . && git commit -m "Initial commit"`, create a GitHub repo, then `git remote add origin <url> && git push -u origin main`.
2. In Vercel choose **Add New > Project**, import the repo (framework preset: Next.js is auto-detected).
3. Add any environment variables (none needed today), then **Deploy**. Every push to `main` redeploys.

## Data sources (all keyless)
Open-Meteo (geocoding, forecast, archive), Wikipedia (places), OpenStreetMap (map tiles). Caching: forecast 30 min, climate 7 days, places 7 days, geocoding 1 day. The geocode API route validates input and is rate-limited per instance (40 requests/min per IP; in-memory, so approximate on serverless).

## Tuning the formulas
- **Travel score** (`lib/climate.ts`): comfort temp = (mean + mean daily max) / 2. Temperature score is 100 inside 18-27°C and loses 8 points per degree outside. Rain score = 100 - mm per month / 3. Sun score = hours per day / 10. Final = 50% temp + 30% rain + 20% sun. Best >= 75, Good >= 60, Fair >= 40, else Avoid. Change the constants at the top of the file.
- **Costs** (`lib/costs.ts`): daily USD per person for stay, food, transport, activities in 4 country tiers and 3 styles. Edit `COSTS`, `TIER_BY_COUNTRY` and `RATES`. Season factor: top-3 months x1.3, Avoid months x0.85. Ranges are -15%/+15%. Flights = (60 + 0.10 x km) x style multiplier, range -30%/+50%.

All cost figures are approximate estimates, not live prices. Forecast accuracy drops after about 7 days.
