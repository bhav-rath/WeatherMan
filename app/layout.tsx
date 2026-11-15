import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import './globals.css';
const sans = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-sans' });
export const metadata: Metadata = { title: 'Weather & Trip Planner', description: '15-day forecast, best time to visit, trip cost estimates and places to see for any city.' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body className={`${sans.variable} font-sans`}>{children}</body></html>
  );
}
