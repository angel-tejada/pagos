import { currencyEntry } from './currencies';
import type { CurrencyCode, Entry } from './store';

export function currencySymbol(currency: CurrencyCode): string {
  return currencyEntry(currency)?.symbol ?? currency;
}

/**
 * Formats integer cents for display.
 *
 * Grouping and decimal separators follow the language, not the device locale:
 * Spanish reads `1.234,56` and English reads `1,234.56`. This is done by hand
 * rather than through Intl because Hermes on device and Node on the build
 * machine disagree, and because Spanish CLDR drops the grouping separator for
 * four-digit numbers — which is not what we want here.
 */
export function formatMoney(cents: number, currency: CurrencyCode, lang: 'es' | 'en'): string {
  const negative = cents < 0;
  const absolute = Math.abs(Math.trunc(cents));
  const whole = Math.floor(absolute / 100);
  const fraction = absolute % 100;

  const groupSeparator = lang === 'es' ? '.' : ',';
  const decimalSeparator = lang === 'es' ? ',' : '.';

  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
  const decimals = String(fraction).padStart(2, '0');

  return `${negative ? '-' : ''}${currencySymbol(currency)}${grouped}${decimalSeparator}${decimals}`;
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

/**
 * Reads a typed amount into integer cents. Accepts either separator style, so a
 * Spanish speaker typing `1.234,56` and an English speaker typing `1,234.56`
 * both work regardless of the app language.
 */
export function parseAmountToCents(value: string): number | null {
  let normalized = value.trim().replace(/[$€\s]/g, '').replace(/RD/gi, '');
  if (!normalized) return null;

  const lastComma = normalized.lastIndexOf(',');
  const lastDot = normalized.lastIndexOf('.');
  const decimalAt = Math.max(lastComma, lastDot);
  const trailing = decimalAt === -1 ? '' : normalized.slice(decimalAt + 1);

  // A trailing group of exactly 3 digits is a thousands group, not a decimal.
  const hasDecimal = decimalAt !== -1 && trailing.length > 0 && trailing.length <= 2;

  const wholePart = (hasDecimal ? normalized.slice(0, decimalAt) : normalized).replace(/[.,]/g, '');
  const decimalPart = hasDecimal ? trailing : '';

  if (!/^\d+$/.test(wholePart)) return null;
  if (decimalPart && !/^\d{1,2}$/.test(decimalPart)) return null;

  const cents = Number(wholePart) * 100 + Number(decimalPart.padEnd(2, '0') || '0');
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

/** Short numeric date for the shareable balance message: "29/08" in es, "08/29" in en.
 *  Built by hand — ICU drops the leading zero for a bare day/month skeleton. */
export function formatShortDate(value: Date, lang: 'es' | 'en'): string {
  const day = String(value.getDate()).padStart(2, '0');
  const month = String(value.getMonth() + 1).padStart(2, '0');
  return lang === 'es' ? `${day}/${month}` : `${month}/${day}`;
}

/**
 * Zero is the app's happy moment, not an amount. A settled person reads as a
 * plain "$0" rather than a large formatted figure people mistake for a debt.
 */
export function formatBalance(cents: number, currency: CurrencyCode, lang: 'es' | 'en'): string {
  if (cents === 0) return currencySymbol(currency) + '0';
  return formatMoney(cents, currency, lang);
}
