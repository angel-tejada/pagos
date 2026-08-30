/**
 * Regenerates src/data/currencies.ts from the ICU data bundled with Node.
 * Run with:  node scripts/generate-currencies.js
 */
const fs = require('fs');
const path = require('path');

const codes = Intl.supportedValuesOf('currency');
const enNames = new Intl.DisplayNames(['en'], { type: 'currency' });
const esNames = new Intl.DisplayNames(['es'], { type: 'currency' });

/** Narrow symbols are what people actually write: $, EUR, GBP. */
function narrowSymbol(code) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
    })
      .formatToParts(0)
      .find((part) => part.type === 'currency').value;
  } catch {
    return code;
  }
}

/** Where the narrow form is ambiguous and local usage differs. */
const SYMBOL_OVERRIDES = { DOP: 'RD$' };

/** ICU returns lowercase names. Sentence case only, so accents survive. */
const sentence = (s) => (s ? s.charAt(0).toLocaleUpperCase('es') + s.slice(1) : s);

const BACKSLASH = String.fromCharCode(92);
const QUOTE = String.fromCharCode(39);
const esc = (s) =>
  String(s).split(BACKSLASH).join(BACKSLASH + BACKSLASH).split(QUOTE).join(BACKSLASH + QUOTE);

const rows = codes.map((code) => {
  let en = code;
  let es = code;
  try {
    en = enNames.of(code) || code;
  } catch {}
  try {
    es = esNames.of(code) || code;
  } catch {}
  return {
    code,
    symbol: SYMBOL_OVERRIDES[code] || narrowSymbol(code),
    en: sentence(en),
    es: sentence(es),
  };
});

const body = rows
  .map(
    (r) =>
      `  { code: '${r.code}', symbol: '${esc(r.symbol)}', en: '${esc(r.en)}', es: '${esc(r.es)}' },`,
  )
  .join('\n');

const out = `/**
 * Every active ISO 4217 currency, generated from the ICU data bundled with Node.
 * Symbols use the narrow form people actually write, with an override where the
 * narrow form is ambiguous and local usage differs.
 *
 * Generated file - do not hand edit. Run: node scripts/generate-currencies.js
 */
export type CurrencyEntry = { code: string; symbol: string; en: string; es: string };

export const CURRENCY_LIST: readonly CurrencyEntry[] = [
${body}
] as const;

const BY_CODE = new Map(CURRENCY_LIST.map((entry) => [entry.code, entry]));

export function currencyEntry(code: string): CurrencyEntry | undefined {
  return BY_CODE.get(code);
}

export function isKnownCurrency(code: unknown): code is string {
  return typeof code === 'string' && BY_CODE.has(code);
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'currencies.ts'), out);
console.log(`wrote ${rows.length} currencies`);
