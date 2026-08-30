import * as DocumentPicker from 'expo-document-picker';
import * as Print from 'expo-print';
import { Share } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { Lang, Strings } from '../i18n';
import { formatDate, formatEntryDate, formatMoney, formatShortDate } from './format';
import {
  DATA_SCHEMA_VERSION,
  getBalanceCents,
  parseNativeData,
  type AppData,
  type Entry,
  type Person,
} from './store';

/**
 * Puts a short, neutral balance summary into the iOS share sheet.
 * The user edits and sends it themselves — nothing is sent automatically,
 * and the other person is never notified by this app.
 */
export async function shareBalanceMessage(
  person: Person,
  data: AppData,
  t: Strings,
  lang: Lang,
): Promise<void> {
  let lentCents = 0;
  let paidCents = 0;
  for (const entry of data.entries) {
    if (entry.personId !== person.id) continue;
    if (entry.kind === 'debt') lentCents += entry.amountCents;
    else paidCents += entry.amountCents;
  }
  const balanceCents = lentCents - paidCents;
  const date = formatShortDate(new Date(), lang);
  const lent = formatMoney(lentCents, person.currency, lang);
  const paid = formatMoney(paidCents, person.currency, lang);

  // Settled reads as closure, not as another data point. Overpaid never says
  // "quedan -$20", which is what a single template would have produced.
  const message =
    balanceCents === 0
      ? t.balanceSettledMessage(person.name, lent)
      : balanceCents < 0
        ? t.balanceOverpaidMessage(person.name, date, lent, paid, formatMoney(-balanceCents, person.currency, lang))
        : t.balanceMessage(person.name, date, lent, paid, formatMoney(balanceCents, person.currency, lang));

  await Share.share({ message }, { subject: t.sendBalanceTitle });
}

/** Escapes user-entered text before it goes into the PDF's HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * The long-form companion to shareBalanceMessage: one person's balance and full
 * history as a PDF, rendered on device and handed to the share sheet.
 */
export async function sharePersonPdf(
  person: Person,
  data: AppData,
  t: Strings,
  lang: Lang,
): Promise<void> {
  let lentCents = 0;
  let paidCents = 0;
  const entries = data.entries
    .filter((entry) => entry.personId === person.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  for (const entry of entries) {
    if (entry.kind === 'debt') lentCents += entry.amountCents;
    else paidCents += entry.amountCents;
  }

  const rows = entries.length
    ? entries
        .map((entry) => `<tr><td>${escapeHtml(entry.kind === 'debt' ? t.borrowed : t.paidBtn)}</td>` +
          `<td>${escapeHtml(formatEntryDate(entry, lang))}</td>` +
          `<td>${escapeHtml(entry.note)}</td>` +
          `<td class="amt">${entry.kind === 'debt' ? '+' : '−'}${escapeHtml(formatMoney(entry.amountCents, person.currency, lang))}</td></tr>`)
        .join('')
    : `<tr><td colspan="4">${escapeHtml(t.pdfNoEntries)}</td></tr>`;

  const html = `<!doctype html><html><head><meta charset="utf-8" />
<style>
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #111; padding: 40px; }
  h1 { font-size: 30px; margin: 0 0 4px; }
  .date { color: #666; font-size: 14px; margin-bottom: 26px; }
  .balance { font-size: 40px; font-weight: 700; margin: 0 0 6px; }
  .totals { color: #444; font-size: 15px; margin-bottom: 30px; }
  h2 { font-size: 19px; margin: 0 0 10px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { text-align: left; color: #666; font-weight: 600; border-bottom: 1px solid #ccc; padding: 8px 6px; }
  td { padding: 8px 6px; border-bottom: 1px solid #eee; }
  .amt { text-align: right; white-space: nowrap; }
  footer { margin-top: 40px; color: #999; font-size: 12px; text-align: center; }
</style></head><body>
  <h1>${escapeHtml(person.name)}</h1>
  <div class="date">${escapeHtml(formatDate(new Date(), lang))}</div>
  <div class="balance">${escapeHtml(formatMoney(lentCents - paidCents, person.currency, lang))}</div>
  <div class="totals">${escapeHtml(t.pdfLent)}: ${escapeHtml(formatMoney(lentCents, person.currency, lang))} &nbsp;·&nbsp; ${escapeHtml(t.pdfPaid)}: ${escapeHtml(formatMoney(paidCents, person.currency, lang))}</div>
  <h2>${escapeHtml(t.pdfHistory)}</h2>
  <table><tbody>${rows}</tbody></table>
  <footer>Pagos</footer>
</body></html>`;

  const { uri } = await Print.printToFileAsync({ html });
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is unavailable');
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Pagos', UTI: 'com.adobe.pdf' });
}

export async function shareBackup(data: AppData): Promise<void> {
  const now = new Date();
  const snapshot: AppData = { ...data, lastBackupAt: now.toISOString(), entriesSinceBackup: 0 };
  const file = createCacheFile(`pagos-copia-${dayStamp(now)}.json`, JSON.stringify(snapshot, null, 2));
  await shareFile(file, 'application/json');
}

export async function sharePlainText(data: AppData, t: Strings, lang: Lang): Promise<void> {
  const now = new Date();
  const lines: string[] = [t.exTitle, formatDate(now, lang), ''];
  const people = [...data.people].sort((a, b) => getBalanceCents(data, b.id) - getBalanceCents(data, a.id));

  if (!people.length) {
    lines.push(t.exNobody);
  } else {
    for (const person of people) {
      const balance = getBalanceCents(data, person.id);
      lines.push(person.name);
      lines.push(balance > 0
        ? t.exOwes + formatMoney(balance, person.currency, lang)
        : balance < 0
          ? t.overpaidBy(formatMoney(Math.abs(balance), person.currency, lang))
          : t.exSettled);
      const entries = data.entries
        .filter((entry) => entry.personId === person.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      if (!entries.length) lines.push(`   ${t.exNone}`);
      for (const entry of entries) {
        lines.push(`   ${entry.kind === 'debt' ? t.borrowed : t.paidBtn} ${formatMoney(entry.amountCents, person.currency, lang)} · ${formatEntryDate(entry, lang)}${entry.note ? ` · ${entry.note}` : ''}`);
      }
      lines.push('');
    }
    const total = people.reduce((sum, person) => sum + Math.max(0, getBalanceCents(data, person.id)), 0);
    lines.push(t.exTotal + formatMoney(total, people[0]?.currency ?? 'USD', lang));
    lines.push(t.exPeople + people.length);
  }

  const file = createCacheFile(`pagos-lista-${dayStamp(now)}.txt`, `${lines.join('\r\n')}\r\n`);
  await shareFile(file, 'text/plain');
}

export async function pickRestoreFile(): Promise<AppData | undefined> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return undefined;
  const text = await new File(result.assets[0].uri).text();
  const parsed: unknown = JSON.parse(text);
  const data = parseNativeData(parsed) ?? parseLegacyData(parsed);
  if (!data) throw new Error('Invalid Pagos backup');
  return data;
}

function createCacheFile(name: string, contents: string): File {
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  file.write(contents);
  return file;
}

async function shareFile(file: File, mimeType: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is unavailable');
  await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: 'Pagos' });
}

function parseLegacyData(value: unknown): AppData | null {
  if (!isRecord(value) || !Array.isArray(value.people)) return null;
  const now = new Date().toISOString();
  const people: Person[] = [];
  const entries: Entry[] = [];

  for (const rawPerson of value.people) {
    if (!isRecord(rawPerson) || typeof rawPerson.name !== 'string') continue;
    const personId = typeof rawPerson.id === 'string' ? rawPerson.id : createImportId('person');
    people.push({ id: personId, name: rawPerson.name.trim(), currency: 'USD', createdAt: now });
    if (!Array.isArray(rawPerson.movs)) continue;
    for (const rawEntry of rawPerson.movs) {
      if (!isRecord(rawEntry) || typeof rawEntry.amt !== 'number' || rawEntry.amt <= 0) continue;
      const createdAt = typeof rawEntry.ts === 'number'
        ? new Date(rawEntry.ts).toISOString()
        : typeof rawEntry.date === 'string'
          ? new Date(`${rawEntry.date}T12:00:00`).toISOString()
          : now;
      entries.push({
        id: typeof rawEntry.id === 'string' ? rawEntry.id : createImportId('entry'),
        personId,
        kind: rawEntry.kind === 'down' ? 'payment' : 'debt',
        amountCents: Math.round(rawEntry.amt * 100),
        note: typeof rawEntry.note === 'string' ? rawEntry.note : '',
        dueDate: null,
        createdAt,
      });
    }
  }

  return {
    schemaVersion: DATA_SCHEMA_VERSION,
    people,
    entries,
    lastBackupAt: typeof value.lastBackup === 'string' ? new Date(`${value.lastBackup}T12:00:00`).toISOString() : null,
    entriesSinceBackup: typeof value.sinceBackup === 'number' ? Math.max(0, Math.trunc(value.sinceBackup)) : 0,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function createImportId(prefix: string): string {
  return `${prefix}-import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function dayStamp(date: Date): string {
  return date.toISOString().slice(0, 10);
}
