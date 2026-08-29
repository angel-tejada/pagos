import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export const DATA_SCHEMA_VERSION = 1 as const;
export const DATA_STORAGE_KEY = 'pagos_native_v1';
export const CURRENCIES = ['USD', 'DOP', 'EUR'] as const;

/** Free tier caps how many people you can track — never how often you can log.
 *  A scope limit, not a rate limit. See CLAUDE.md monetization rules. */
export const FREE_PERSON_LIMIT = 12;

export type CurrencyCode = (typeof CURRENCIES)[number];
export type EntryKind = 'debt' | 'payment';

export type Person = {
  id: string;
  name: string;
  currency: CurrencyCode;
  sourceContactId?: string;
  createdAt: string;
};

export type Entry = {
  id: string;
  personId: string;
  kind: EntryKind;
  amountCents: number;
  note: string;
  dueDate: string | null;
  notificationId?: string;
  createdAt: string;
};

export type AppData = {
  schemaVersion: typeof DATA_SCHEMA_VERSION;
  people: Person[];
  entries: Entry[];
  lastBackupAt: string | null;
  entriesSinceBackup: number;
};

export type AddEntryInput = {
  kind: EntryKind;
  amountCents: number;
  note: string;
  dueDate: string | null;
  currency: CurrencyCode;
  personId?: string;
  personName?: string;
  sourceContactId?: string;
  notificationId?: string;
};

type DataValue = {
  data: AppData;
  hydrated: boolean;
  addEntry: (input: AddEntryInput) => string;
  renamePerson: (personId: string, name: string) => void;
  deletePerson: (personId: string) => void;
  deleteEntry: (entryId: string) => void;
  restoreData: (next: AppData) => void;
  markBackupComplete: () => void;
};

const SEED_DATA: AppData = {
  schemaVersion: DATA_SCHEMA_VERSION,
  people: [
    { id: '1', name: 'Juan', currency: 'USD', createdAt: '2026-08-11T17:00:00.000Z' },
    { id: '2', name: 'María', currency: 'USD', createdAt: '2026-08-11T17:05:00.000Z' },
  ],
  entries: [
    { id: 'seed-1', personId: '1', kind: 'payment', amountCents: 5000, note: 'Zelle', dueDate: null, createdAt: '2026-08-11T17:00:00.000Z' },
    { id: 'seed-2', personId: '1', kind: 'debt', amountCents: 20000, note: 'Cash', dueDate: null, createdAt: '2026-08-11T17:01:00.000Z' },
    { id: 'seed-3', personId: '1', kind: 'payment', amountCents: 3000, note: 'Cash', dueDate: null, createdAt: '2026-08-11T17:02:00.000Z' },
    { id: 'seed-4', personId: '2', kind: 'debt', amountCents: 4550, note: '', dueDate: null, createdAt: '2026-08-11T17:05:00.000Z' },
  ],
  lastBackupAt: null,
  entriesSinceBackup: 0,
};

const DataContext = createContext<DataValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(SEED_DATA);
  const [hydrated, setHydrated] = useState(false);
  const dataRef = useRef(data);
  const writeQueue = useRef(Promise.resolve());

  const persist = useCallback((next: AppData) => {
    dataRef.current = next;
    setData(next);
    writeQueue.current = writeQueue.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(next)));
  }, []);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(DATA_STORAGE_KEY)
      .then((stored) => {
        if (!active) return;
        if (stored) {
          const restored = parseNativeData(JSON.parse(stored));
          if (restored) {
            dataRef.current = restored;
            setData(restored);
          }
        } else {
          writeQueue.current = AsyncStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(SEED_DATA));
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const addEntry = useCallback((input: AddEntryInput) => {
    const current = dataRef.current;
    const normalizedName = normalizeName(input.personName ?? '');
    const matched = input.personId
      ? current.people.find((person) => person.id === input.personId)
      : current.people.find((person) =>
          (input.sourceContactId && person.sourceContactId === input.sourceContactId) ||
          normalizeName(person.name) === normalizedName,
        );
    const personId = matched?.id ?? createId('person');
    const now = new Date().toISOString();
    const nextPerson: Person | null = matched
      ? null
      : {
          id: personId,
          name: (input.personName ?? '').trim(),
          currency: input.currency,
          sourceContactId: input.sourceContactId,
          createdAt: now,
        };
    const nextPeople = current.people.map((person) =>
      person.id === personId && person.currency !== input.currency
        ? { ...person, currency: input.currency }
        : person,
    );
    if (nextPerson) nextPeople.push(nextPerson);
    const nextEntry: Entry = {
      id: createId('entry'),
      personId,
      kind: input.kind,
      amountCents: Math.trunc(input.amountCents),
      note: input.note.trim(),
      dueDate: input.dueDate,
      notificationId: input.notificationId,
      createdAt: now,
    };
    persist({
      ...current,
      people: nextPeople,
      entries: [...current.entries, nextEntry],
      entriesSinceBackup: current.entriesSinceBackup + 1,
    });
    return personId;
  }, [persist]);

  const renamePerson = useCallback((personId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const current = dataRef.current;
    persist({ ...current, people: current.people.map((person) => person.id === personId ? { ...person, name: trimmed } : person) });
  }, [persist]);

  const deletePerson = useCallback((personId: string) => {
    const current = dataRef.current;
    current.entries
      .filter((entry) => entry.personId === personId)
      .forEach((entry) => cancelNotification(entry.notificationId));
    persist({
      ...current,
      people: current.people.filter((person) => person.id !== personId),
      entries: current.entries.filter((entry) => entry.personId !== personId),
    });
  }, [persist]);

  const deleteEntry = useCallback((entryId: string) => {
    const current = dataRef.current;
    cancelNotification(current.entries.find((entry) => entry.id === entryId)?.notificationId);
    persist({ ...current, entries: current.entries.filter((entry) => entry.id !== entryId) });
  }, [persist]);

  const restoreData = useCallback((next: AppData) => {
    void Notifications.cancelAllScheduledNotificationsAsync().catch(() => undefined);
    persist({
      ...next,
      entries: next.entries.map(({ notificationId: _notificationId, ...entry }) => entry),
    });
  }, [persist]);

  const markBackupComplete = useCallback(() => {
    const current = dataRef.current;
    persist({ ...current, lastBackupAt: new Date().toISOString(), entriesSinceBackup: 0 });
  }, [persist]);

  const value = useMemo<DataValue>(() => ({
    data,
    hydrated,
    addEntry,
    renamePerson,
    deletePerson,
    deleteEntry,
    restoreData,
    markBackupComplete,
  }), [addEntry, data, deleteEntry, deletePerson, hydrated, markBackupComplete, renamePerson, restoreData]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataValue {
  const value = useContext(DataContext);
  if (!value) throw new Error('useData must be used inside <DataProvider>');
  return value;
}

export function getBalanceCents(data: AppData, personId: string): number {
  return data.entries.reduce((total, entry) => {
    if (entry.personId !== personId) return total;
    return total + (entry.kind === 'debt' ? entry.amountCents : -entry.amountCents);
  }, 0);
}

export function parseNativeData(value: unknown): AppData | null {
  if (!isRecord(value) || value.schemaVersion !== DATA_SCHEMA_VERSION) return null;
  if (!Array.isArray(value.people) || !Array.isArray(value.entries)) return null;
  const people = value.people.filter(isPerson);
  const personIds = new Set(people.map((person) => person.id));
  const entries = value.entries.filter((entry): entry is Entry => isEntry(entry) && personIds.has(entry.personId));
  return {
    schemaVersion: DATA_SCHEMA_VERSION,
    people,
    entries,
    lastBackupAt: typeof value.lastBackupAt === 'string' ? value.lastBackupAt : null,
    entriesSinceBackup: typeof value.entriesSinceBackup === 'number' ? Math.max(0, Math.trunc(value.entriesSinceBackup)) : 0,
  };
}

function isPerson(value: unknown): value is Person {
  return isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    CURRENCIES.includes(value.currency as CurrencyCode) &&
    typeof value.createdAt === 'string' &&
    (value.sourceContactId === undefined || typeof value.sourceContactId === 'string');
}

function isEntry(value: unknown): value is Entry {
  return isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.personId === 'string' &&
    (value.kind === 'debt' || value.kind === 'payment') &&
    Number.isInteger(value.amountCents) &&
    (value.amountCents as number) > 0 &&
    typeof value.note === 'string' &&
    (value.dueDate === null || typeof value.dueDate === 'string') &&
    (value.notificationId === undefined || typeof value.notificationId === 'string') &&
    typeof value.createdAt === 'string';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function cancelNotification(identifier: string | undefined): void {
  if (!identifier) return;
  void Notifications.cancelScheduledNotificationAsync(identifier).catch(() => undefined);
}
