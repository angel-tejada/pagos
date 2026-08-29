import * as DocumentPicker from 'expo-document-picker';
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
  const message = t.balanceMessage(
    person.name,
    formatShortDate(new Date(), lang),
    formatMoney(lentCents, person.currency, lang),
    formatMoney(paidCents, person.currency, lang),
    formatMoney(lentCents - paidCents, person.currency, lang),
  );
  await Share.share({ message }, { subject: t.sendBalanceTitle });
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
