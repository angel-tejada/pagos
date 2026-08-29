import type { CurrencyCode, Entry } from './store';

export function formatMoney(cents: number, currency: CurrencyCode, lang: 'es' | 'en'): string {
  return new Intl.NumberFormat(lang === 'es' ? 'es-US' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatDate(value: string | Date, lang: 'es' | 'en'): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-US' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatEntryDate(entry: Entry, lang: 'es' | 'en'): string {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-US' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(entry.createdAt));
}

export function parseAmountToCents(value: string): number | null {
  const normalized = value.trim().replace(/[$,\s]/g, '');
  if (!/^\d+(?:\.\d{0,2})?$/.test(normalized)) return null;
  const [whole, decimal = ''] = normalized.split('.');
  const cents = Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

/** Short numeric date for the shareable balance message: "29/08" in es, "08/29" in en.
 *  Built by hand — ICU drops the leading zero for a bare day/month skeleton. */
export function formatShortDate(value: Date, lang: 'es' | 'en'): string {
  const day = String(value.getDate()).padStart(2, '0');
  const month = String(value.getMonth() + 1).padStart(2, '0');
  return lang === 'es' ? `${day}/${month}` : `${month}/${day}`;
}
