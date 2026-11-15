import type { Forecast } from '@/lib/types';
type Day = Forecast['daily'][number];
const W = 640, H = 200, PAD = 28;
const lab = (d: string) => new Date(d + 'T12:00:00').getDate();

export function TempChart({ days, conv, unit }: { days: Day[]; conv: (c: number) => number; unit: string }) {
  const hi = days.map((d) => conv(d.max)), lo = days.map((d) => conv(d.min));
  const mx = Math.max(...hi), mn = Math.min(...lo), span = mx - mn || 1;
  const x = (i: number) => PAD + (i * (W - PAD * 2)) / (days.length - 1);
  const y = (v: number) => H - PAD - ((v - mn) / span) * (H - PAD * 2);
  const line = (a: number[]) => a.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Daily high and low temperature in °${unit} for 15 days`} className="w-full">
      <path d={line(hi)} fill="none" stroke="#E5702A" strokeWidth="2.5" />
      <path d={line(lo)} fill="none" stroke="#1F7A8C" strokeWidth="2.5" />
      {days.map((d, i) => (
        <g key={d.date}>
          <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="currentColor">{lab(d.date)}</text>
          <text x={x(i)} y={y(hi[i]) - 7} textAnchor="middle" fontSize="9" fill="currentColor">{hi[i]}°</text>
          <text x={x(i)} y={y(lo[i]) + 14} textAnchor="middle" fontSize="9" fill="currentColor">{lo[i]}°</text>
        </g>
      ))}
      <text x={PAD} y={12} fontSize="10" fill="#E5702A">High</text><text x={PAD + 34} y={12} fontSize="10" fill="#1F7A8C">Low</text>
    </svg>
  );
}
export function PrecipChart({ days }: { days: Day[] }) {
  const mx = Math.max(5, ...days.map((d) => d.precip));
  const bw = (W - PAD * 2) / days.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Daily rainfall in millimetres for 15 days" className="w-full">
      {days.map((d, i) => {
        const h = (d.precip / mx) * (H - PAD * 2);
        return (
          <g key={d.date}>
            <rect x={PAD + i * bw + 4} y={H - PAD - h} width={bw - 8} height={h} rx="3" fill="#3D5A80" />
            <text x={PAD + i * bw + bw / 2} y={H - PAD - h - 5} textAnchor="middle" fontSize="9" fill="currentColor">{d.precip > 0 ? d.precip.toFixed(1) : ''}</text>
            <text x={PAD + i * bw + bw / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="currentColor">{lab(d.date)}</text>
          </g>
        );
      })}
      <text x={PAD} y={12} fontSize="10" fill="currentColor">Rain (mm)</text>
    </svg>
  );
}
