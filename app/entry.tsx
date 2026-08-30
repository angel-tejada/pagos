import DateTimePicker from '@expo/ui/community/datetime-picker';
import { Contact, requestPermissionsAsync } from 'expo-contacts';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CurrencyPicker } from '../src/components/CurrencyPicker';
import { Sheet } from '../src/components/Sheet';
import { Button, FieldLabel } from '../src/components/ui';
import { currencySymbol, formatDate, formatMoney, parseAmountToCents } from '../src/data/format';
import { scheduleDueReminder } from '../src/data/reminders';
import {
  DEFAULT_CURRENCY,
  FREE_PERSON_LIMIT,
  getBalanceCents,
  useData,
  type CurrencyCode,
  type Person,
} from '../src/data/store';
import { showActions, showAlert, showPrompt } from '../src/components/dialogs';
import { useLang } from '../src/i18n';
import { font, layout, radius, tabular, type, useColors, useStyles, type Palette } from '../src/theme';

type SelectedPerson = { id?: string; name: string; sourceContactId?: string };

export default function EntryScreen() {
  const styles = useStyles(makeStyles);
  const c = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ kind?: string; person?: string }>();
  const { t, lang } = useLang();
  const { data, addEntry } = useData();
  const isPayment = params.kind === 'paid';
  const routePerson = params.person ? data.people.find((person) => person.id === params.person) : undefined;

  const [selectedPerson, setSelectedPerson] = useState<SelectedPerson | null>(null);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [personOpen, setPersonOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillChangeFrame', (event) => setKeyboardHeight(event.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardWillHide', () => setKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (!routePerson) return;
    setSelectedPerson({ id: routePerson.id, name: routePerson.name, sourceContactId: routePerson.sourceContactId });
    setCurrency(routePerson.currency);
  }, [routePerson?.id]);

  const amountCents = parseAmountToCents(amount);
  const ready = Boolean(amountCents && selectedPerson);

  const choosePerson = (selection: SelectedPerson) => {
    const existing = selection.id
      ? data.people.find((person) => person.id === selection.id)
      : data.people.find(
          (person) =>
            (selection.sourceContactId && person.sourceContactId === selection.sourceContactId) ||
            normalizeName(person.name) === normalizeName(selection.name),
        );
    // A scope limit, not a rate limit: only a brand new person is refused.
    if (!existing && data.people.length >= FREE_PERSON_LIMIT) {
      showAlert(t.limitReachedTitle, t.limitReachedBody(FREE_PERSON_LIMIT));
      return;
    }
    setSelectedPerson(
      existing ? { id: existing.id, name: existing.name, sourceContactId: existing.sourceContactId } : selection,
    );
    if (existing) setCurrency(existing.currency);
    setPersonOpen(false);
  };

  const openPhoneBook = async () => {
    setPersonOpen(false);
    try {
      const permission = await requestPermissionsAsync();
      if (permission.status !== 'granted') {
        showAlert(t.contactsDeniedTitle, t.contactsDeniedBody);
        return;
      }
      const contact = await Contact.presentPicker();
      if (!contact) return;
      const name = (await contact.getFullName()).trim();
      if (!name) {
        showAlert(t.needName, t.contactsFailed);
        return;
      }
      choosePerson({ name, sourceContactId: contact.id });
    } catch {
      showAlert(t.contactsUnavailable, t.contactsFailed);
    }
  };

  /** Turning the reminder on dismisses the keypad so the picker is reachable. */
  const toggleDueDate = (next: boolean) => {
    setHasDueDate(next);
    if (next) {
      Keyboard.dismiss();
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 180);
    }
  };

  const cancel = () => {
    if (routePerson) router.replace(`/person/${routePerson.id}`);
    else router.replace('/');
  };

  const submit = async () => {
    if (!amountCents) {
      showAlert(t.needAmount);
      return;
    }
    if (!selectedPerson) {
      showAlert(t.personRequired);
      return;
    }
    if (!selectedPerson.id && data.people.length >= FREE_PERSON_LIMIT) {
      showAlert(t.limitReachedTitle, t.limitReachedBody(FREE_PERSON_LIMIT));
      return;
    }

    let notificationId: string | undefined;
    if (hasDueDate) {
      const when = new Date(dateOnlyIso(dueDate));
      notificationId = await scheduleDueReminder(
        t.reminderTitle,
        t.reminderBody(selectedPerson.name, formatMoney(amountCents, currency, lang)),
        when,
      );
      if (!notificationId && when.getTime() > Date.now()) showAlert(t.reminderDenied);
    }

    const personId = addEntry({
      kind: isPayment ? 'payment' : 'debt',
      amountCents,
      note,
      dueDate: hasDueDate ? dateOnlyIso(dueDate) : null,
      currency,
      personId: selectedPerson.id,
      personName: selectedPerson.name,
      sourceContactId: selectedPerson.sourceContactId,
      notificationId,
    });
    router.replace(`/person/${personId}`);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={[styles.screen, { paddingBottom: keyboardHeight }]}>
        <View style={styles.header}>
          <Pressable hitSlop={10} onPress={cancel} style={({ pressed }) => pressed && styles.pressed}>
            <Text style={styles.cancel}>{t.cancel}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{t.newEntry}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}>
          <FieldLabel>{t.amount}</FieldLabel>
          <View style={styles.amountRow}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder={`${currencySymbol(currency)}0`}
              placeholderTextColor={c.mute}
              selectionColor={c.ink}
              style={[styles.amountInput, !amount && styles.amountEmpty]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.chooseCurrency}
              onPress={() => {
                Keyboard.dismiss();
                setCurrencyOpen(true);
              }}
              style={({ pressed }) => [styles.currency, pressed && styles.pressedField]}>
              <Text style={styles.currencyText}>
                {currencySymbol(currency)} {currency}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>

          <FieldLabel>{t.person}</FieldLabel>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              Keyboard.dismiss();
              setPersonOpen(true);
            }}
            style={({ pressed }) => [styles.personField, pressed && styles.pressedField]}>
            <View style={styles.personPlus}>
              <Text style={styles.personPlusGlyph}>＋</Text>
            </View>
            <Text style={[styles.personText, !selectedPerson && styles.personTextEmpty]} numberOfLines={1}>
              {selectedPerson?.name ?? t.choosePerson}
            </Text>
          </Pressable>

          <FieldLabel>{t.dueDate}</FieldLabel>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleText}>{hasDueDate ? formatDate(dueDate, lang) : t.dueDateOff}</Text>
            <Switch
              value={hasDueDate}
              onValueChange={toggleDueDate}
              trackColor={{ false: c.track, true: c.ink }}
              thumbColor={c.inkOn}
              ios_backgroundColor={c.track}
              style={styles.switch}
            />
          </View>
          {hasDueDate ? (
            <View style={styles.pickerRow}>
              <DateTimePicker
                value={dueDate}
                onValueChange={(_event, date) => setDueDate(date)}
                mode="datetime"
                display="compact"
                minimumDate={new Date()}
                accentColor={c.red}
                themeVariant={c.bg === '#000000' ? 'dark' : 'light'}
                locale={lang === 'es' ? 'es_US' : 'en_US'}
                style={styles.picker}
              />
            </View>
          ) : null}

          <FieldLabel>{t.noteOpt}</FieldLabel>
          <TextInput
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={80}
            textAlignVertical="top"
            onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120)}
            placeholder={t.notePlaceholder}
            placeholderTextColor={c.mute}
            selectionColor={c.ink}
            style={styles.note}
          />
        </ScrollView>

        <SafeAreaView edges={keyboardHeight > 0 ? [] : ['bottom']} style={styles.dock}>
          <Button
            label={isPayment ? t.addPayment : t.addDebt}
            tone={isPayment ? 'payment' : 'debt'}
            disabled={!ready}
            onPress={() => void submit()}
          />
        </SafeAreaView>
      </View>

      <PersonPicker
        visible={personOpen}
        people={data.people}
        balanceOf={(person) => formatMoney(getBalanceCents(data, person.id), person.currency, lang)}
        onClose={() => setPersonOpen(false)}
        onPick={choosePerson}
        onPhoneBook={openPhoneBook}
      />

      <CurrencyPicker
        visible={currencyOpen}
        selected={currency}
        onClose={() => setCurrencyOpen(false)}
        onSelect={(code) => {
          setCurrency(code);
          setCurrencyOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

/**
 * Type a name and it offers to create that person; otherwise pick an existing
 * one, each showing what they currently owe.
 */
function PersonPicker({
  visible,
  people,
  balanceOf,
  onClose,
  onPick,
  onPhoneBook,
}: {
  visible: boolean;
  people: Person[];
  balanceOf: (person: Person) => string;
  onClose: () => void;
  onPick: (selection: SelectedPerson) => void;
  onPhoneBook: () => void;
}) {
  const styles = useStyles(makeStyles);
  const c = useColors();
  const { t } = useLang();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!visible) setQuery('');
  }, [visible]);

  const trimmed = query.trim();
  const matches = useMemo(
    () => people.filter((person) => !trimmed || normalizeName(person.name).includes(normalizeName(trimmed))),
    [people, trimmed],
  );
  const exact = people.some((person) => normalizeName(person.name) === normalizeName(trimmed));

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <SafeAreaView edges={['bottom']} style={styles.pickerSheet}>
          <View style={styles.grabber} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder={t.typeName}
            placeholderTextColor={c.mute}
            selectionColor={c.ink}
            returnKeyType="done"
            style={styles.search}
          />
          <ScrollView keyboardShouldPersistTaps="handled" style={styles.pickerList}>
            {trimmed && !exact ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => onPick({ name: trimmed })}
                style={({ pressed }) => [styles.pickRow, pressed && styles.pressed]}>
                <Text style={styles.pickSymbol}>＋</Text>
                <Text style={styles.pickName} numberOfLines={1}>
                  {trimmed}
                </Text>
                <Text style={styles.pickMeta}>{t.newPersonRow}</Text>
              </Pressable>
            ) : null}
            {matches.map((person) => (
              <Pressable
                key={person.id}
                accessibilityRole="button"
                onPress={() => onPick({ id: person.id, name: person.name, sourceContactId: person.sourceContactId })}
                style={({ pressed }) => [styles.pickRow, pressed && styles.pressed]}>
                <Text style={styles.pickSymbol}>•</Text>
                <Text style={styles.pickName} numberOfLines={1}>
                  {person.name}
                </Text>
                <Text style={styles.pickMeta}>{balanceOf(person)}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Button label={t.orFromContacts} tone="outline" onPress={onPhoneBook} />
        </SafeAreaView>
      </View>
    </Sheet>
  );
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function dateOnlyIso(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12).toISOString();
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: layout.screenPadding, paddingTop: 6, paddingBottom: 24 },
    cancel: { color: c.ink, fontFamily: font.semibold, fontSize: type.bodyLarge, letterSpacing: -0.18 },
    headerTitle: { flex: 1, textAlign: 'center', color: c.ink, fontFamily: font.bold, fontSize: type.title, letterSpacing: -0.19 },
    headerSpacer: { width: 56 },

    scroll: { flex: 1 },
    form: { paddingHorizontal: layout.screenPadding, paddingBottom: 24, gap: 0 },

    amountRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
    amountInput: {
      flex: 1,
      height: layout.controlHeight,
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: radius.lg,
      backgroundColor: c.card,
      paddingHorizontal: 18,
      color: c.ink,
      fontFamily: font.bold,
      fontSize: type.input,
      ...tabular,
    },
    amountEmpty: { fontFamily: font.bold },
    currency: {
      height: layout.controlHeight,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: radius.lg,
      backgroundColor: c.card,
    },
    currencyText: { color: c.ink, fontFamily: font.bold, fontSize: type.title, letterSpacing: -0.19 },
    chevron: { color: c.mute, fontFamily: font.regular, fontSize: 20 },

    personField: {
      height: layout.controlHeight,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 18,
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: radius.lg,
      backgroundColor: c.card,
      marginBottom: 30,
    },
    personPlus: { width: 34, height: 34, borderRadius: 17, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' },
    personPlusGlyph: { color: c.inkOn, fontSize: 18, lineHeight: 21, fontFamily: font.semibold },
    personText: { flex: 1, color: c.ink, fontFamily: font.semibold, fontSize: type.bodyLarge, letterSpacing: -0.18 },
    personTextEmpty: { color: c.mute },

    toggleRow: {
      height: layout.controlHeight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: radius.lg,
      backgroundColor: c.card,
    },
    toggleText: { color: c.ink, fontFamily: font.semibold, fontSize: type.bodyLarge, letterSpacing: -0.18 },
    switch: { alignSelf: 'center' },
    pickerRow: { marginTop: 12, alignItems: 'flex-start' },
    picker: { width: 260, height: 40 },

    note: {
      height: 110,
      marginTop: 30,
      marginBottom: 0,
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: radius.lg,
      backgroundColor: c.card,
      paddingHorizontal: 18,
      paddingTop: 16,
      color: c.ink,
      fontFamily: font.regular,
      fontSize: type.bodyLarge,
      lineHeight: 24,
    },

    dock: { paddingHorizontal: layout.screenPadding, paddingTop: 14, paddingBottom: 14 },

    modalRoot: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: c.scrim },
    pickerSheet: {
      maxHeight: '80%',
      backgroundColor: c.sheet,
      borderTopLeftRadius: radius.sheet,
      borderTopRightRadius: radius.sheet,
      borderTopWidth: 1,
      borderTopColor: c.edge,
      paddingHorizontal: layout.screenPadding,
      paddingTop: 12,
      paddingBottom: 12,
      gap: 12,
    },
    grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: c.chip, alignSelf: 'center', marginBottom: 8 },
    search: {
      height: 52,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.sheetLine,
      backgroundColor: c.sheetCard,
      paddingHorizontal: 16,
      color: c.ink,
      fontFamily: font.medium,
      fontSize: 16,
    },
    pickerList: { maxHeight: 320 },
    pickRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: layout.minTapTarget + 6,
      paddingVertical: 15,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: c.sheetDivider,
    },
    pickSymbol: { width: 34, color: c.mute, fontFamily: font.semibold, fontSize: type.body },
    pickName: { flex: 1, color: c.ink, fontFamily: font.semibold, fontSize: type.body, letterSpacing: -0.17 },
    pickMeta: { color: c.mute, fontFamily: font.semibold, fontSize: 15, ...tabular },

    pressed: { opacity: 0.7 },
    pressedField: { opacity: 0.75 },
  });
