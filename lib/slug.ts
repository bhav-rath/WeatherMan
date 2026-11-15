import type { City } from './types';
const s = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const citySlug = (c: City) => `${s(c.name)}-${s(c.country || 'world')}-${c.id}`;
export const idFromSlug = (slug: string) => Number(slug.split('-').pop());
export const cityLabel = (c: City) => [c.name, c.admin1, c.country].filter(Boolean).join(', ');
