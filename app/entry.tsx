import DateTimePicker from '@expo/ui/community/datetime-picker';
import { Contact, requestPermissionsAsync } from 'expo-contacts';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CurrencyPicker } from '../src/components/CurrencyPicker';
import { Button, FieldLabel, InitialAvatar } from '../src/components/ui';
import { currencySymbol, formatDate, formatMoney, parseAmountToCents } from '../src/data/format';
import { scheduleDueReminder } from '../src/data/reminders';
import { DEFAULT_CURRENCY, FREE_PERSON_LIMIT, useData, type CurrencyCode, type Person } from '../src/data/store';
import { useLang } from '../src/i18n';
import { layout, radius, type, useColors, useStyles, type Palette } from '../src/theme';

type SelectedPerson = { id?: string; name: string; sourceContactId?: string };

export default function EntryScreen() {
  const styles = useStyles(makeStyles);
  const c = useColors();
  const scheme = useColorScheme();
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
  const [existingSheetOpen, setExistingSheetOpen] = useState(false);
  const [manualSheetOpen, setManualSheetOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillChangeFrame', (event) =>
      setKeyboardHeight(event.endCoordinates.height),
    );
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

  const selectPerson = (selection: SelectedPerson) => {
    const existing = selection.id
      ? data.people.find((person) => person.id === selection.id)
      : data.people.find((person) =>
          (selection.sourceContactId && person.sourceContactId === selection.sourceContactId) ||
          normalizeName(person.name) === normalizeName(selection.name),
        );
    // A scope limit, not a rate limit: existing people can always be logged
    // against, only a brand new person is refused at the cap.
    if (!existing && data.people.length >= FREE_PERSON_LIMIT) {
      Alert.alert(t.limitReachedTitle, t.limitReachedBody(FREE_PERSON_LIMIT));
      return;
    }
    const resolved = existing
      ? { id: existing.id, name: existing.name, sourceContactId: existing.sourceContactId }
      : selection;
    setSelectedPerson(resolved);
    if (existing) setCurrency(existing.currency);
    setExistingSheetOpen(false);
    setManualSheetOpen(false);
  };

  const openPhoneBook = async () => {
    setManualSheetOpen(false);
    try {
      const permission = await requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(t.contactsDeniedTitle, t.contactsDeniedBody);
        return;
      }
      const contact = await Contact.presentPicker();
      if (!contact) return;
      const name = (await contact.getFullName()).trim();
      if (!name) {
        Alert.alert(t.needName, t.contactsFailed);
        return;
      }
      selectPerson({ name, sourceContactId: contact.id });
    } catch {
      Alert.alert(t.contactsUnavailable, t.contactsFailed);
    }
  };

  /** Turning the reminder on dismisses the keypad and brings the row into
   *  view, so the picker can never open behind the keyboard. */
  const toggleDueDate = (next: boolean) => {
    setHasDueDate(next);
    if (next) {
      Keyboard.dismiss();
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 180);
    }
  };

  const submit = async () => {
    const amountCents = parseAmountToCents(amount);
    if (!amountCents) {
      Alert.alert(t.needAmount);
      return;
    }
    if (!selectedPerson) {
      Alert.alert(t.personRequired);
      return;
    }
    if (!selectedPerson.id && data.people.length >= FREE_PERSON_LIMIT) {
      Alert.alert(t.limitReachedTitle, t.limitReachedBody(FREE_PERSON_LIMIT));
      return;
    }

    // The reminder is scheduled before saving so the entry can store its id and
    // cancel it later. A refused permission is not a reason to lose the entry.
    let notificationId: string | undefined;
    if (hasDueDate) {
      const when = new Date(dateOnlyIso(dueDate));
      notificationId = await scheduleDueReminder(
        t.reminderTitle,
        t.reminderBody(selectedPerson.name, formatMoney(amountCents, currency, lang)),
        when,
      );
      if (!notificationId && when.getTime() > Date.now()) Alert.alert(t.reminderDenied);
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
          <Pressable hitSlop={10} onPress={() => router.back()} style={({ pressed }) => pressed && styles.pressed}>
            <Text style={styles.cancel}>{t.cancel}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{t.newEntry}</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.formScroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}>
          <View>
            <FieldLabel>{t.amount}</FieldLabel>
            <View style={styles.amountRow}>
              <View style={styles.amountField}>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="$100"
                  placeholderTextColor={c.textMuted}
                  selectionColor={c.accent}
                  style={styles.amountInput}
                />
                {amount ? <Text style={styles.amountPlus}>＋</Text> : null}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t.chooseCurrency}
                onPress={() => {
                  Keyboard.dismiss();
                  setCurrencyOpen(true);
                }}
                style={({ pressed }) => [styles.currencyField, pressed && styles.pressedField]}>
                <Text style={styles.currencySign}>{currencySymbol(currency)}</Text>
                <Text style={styles.currencyCode}>{currency}</Text>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            </View>
          </View>

          <View>
            <FieldLabel>{t.person}</FieldLabel>
            <Pressable
              accessibilityRole="button"
              onPress={() => setManualSheetOpen(true)}
              style={({ pressed }) => [styles.personField, pressed && styles.pressedField]}>
              <View style={styles.personPlus}><Text style={styles.personPlusText}>＋</Text></View>
              <Text style={[styles.personText, !selectedPerson && styles.personTextEmpty]}>
                {selectedPerson?.name ?? t.choosePerson}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>

          <View>
            <FieldLabel>{t.dueDate}</FieldLabel>
            <View style={styles.dueField}>
              <Text style={styles.dateText}>{hasDueDate ? formatDate(dueDate, lang) : t.dueDateOff}</Text>
              <Switch
                value={hasDueDate}
                onValueChange={toggleDueDate}
                trackColor={{ false: c.switchOff, true: c.up }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={c.switchOff}
                style={styles.switch}
              />
            </View>
            {hasDueDate ? (
              <View style={styles.datePickerRow}>
                <DateTimePicker
                  value={dueDate}
                  onValueChange={(_event, date) => setDueDate(date)}
                  mode="datetime"
                  display="compact"
                  minimumDate={new Date()}
                  accentColor={c.accent}
                  themeVariant={scheme === 'light' ? 'light' : 'dark'}
                  locale={lang === 'es' ? 'es_US' : 'en_US'}
                  style={styles.datePicker}
                />
              </View>
            ) : null}
          </View>

          <View>
            <FieldLabel>{t.noteOpt}</FieldLabel>
            <TextInput
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={80}
              textAlignVertical="top"
              onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120)}
              placeholder={t.notePlaceholder}
              placeholderTextColor={c.textMuted}
              selectionColor={c.accent}
              style={styles.noteInput}
            />
          </View>
        </ScrollView>

        <SafeAreaView edges={keyboardHeight > 0 ? [] : ['bottom']} style={styles.footer}>
          {/* Matches the direction the user came in on, so the colour that
              started the action is the colour that commits it. */}
          <Button
            label={isPayment ? t.addPayment : t.addDebt}
            tone={isPayment ? 'down' : 'up'}
            onPress={() => void submit()}
          />
        </SafeAreaView>
      </View>

      <CurrencyPicker
        visible={currencyOpen}
        selected={currency}
        onClose={() => setCurrencyOpen(false)}
        onSelect={(code) => {
          setCurrency(code);
          setCurrencyOpen(false);
        }}
      />

      <ManualNameSheet
        visible={manualSheetOpen}
        hasExisting={data.people.length > 0}
        onClose={() => setManualSheetOpen(false)}
        onConfirm={(name) => selectPerson({ name })}
        onExisting={() => {
          setManualSheetOpen(false);
          setExistingSheetOpen(true);
        }}
        onPhoneBook={openPhoneBook}
      />
    </SafeAreaView>
  );
}

function ExistingPeopleSheet({
  visible,
  people,
  onClose,
  onSelect,
}: {
  visible: boolean;
  people: Person[];
  onClose: () => void;
  onSelect: (person: Person) => void;
}) {
  const styles = useStyles(makeStyles);
  const { t } = useLang();
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <SafeAreaView edges={['bottom']} style={styles.listSheet}>
          <Text style={styles.sheetTitle}>{t.existingPeopleTitle}</Text>
          {people.length ? (
            <ScrollView style={styles.peopleList}>
              {people.map((person) => (
                <Pressable key={person.id} onPress={() => onSelect(person)} style={({ pressed }) => [styles.existingRow, pressed && styles.pressed]}>
                  <InitialAvatar name={person.name} size={42} />
                  <Text style={styles.existingName}>{person.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noPeople}>{t.noExistingPeople}</Text>
          )}
          <Button label={t.cancel} tone="secondary" onPress={onClose} />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function ManualNameSheet({
  visible,
  hasExisting,
  onClose,
  onConfirm,
  onExisting,
  onPhoneBook,
}: {
  visible: boolean;
  hasExisting: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  onExisting: () => void;
  onPhoneBook: () => void;
}) {
  const styles = useStyles(makeStyles);
  const c = useColors();
  const { t } = useLang();
  const [name, setName] = useState('');

  useEffect(() => {
    if (!visible) setName('');
  }, [visible]);

  const confirm = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert(t.needName);
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <SafeAreaView edges={['bottom']} style={styles.manualSheet}>
          <Text style={styles.sheetTitle}>{t.manualPersonTitle}</Text>
          <TextInput
            autoFocus
            value={name}
            onChangeText={setName}
            onSubmitEditing={confirm}
            returnKeyType="done"
            placeholder={t.namePh}
            placeholderTextColor={c.textMuted}
            selectionColor={c.accent}
            style={styles.nameInput}
          />
          <View style={styles.manualActions}>
            <Button label={t.cancel} tone="secondary" style={styles.manualButton} onPress={onClose} />
            <Button label={t.confirm} style={styles.manualButton} onPress={confirm} />
          </View>

          <View style={styles.secondaryActions}>
            {hasExisting ? (
              <Button label={t.orChooseExisting} tone="secondary" onPress={onExisting} />
            ) : null}
            <Button label={t.orFromContacts} tone="secondary" onPress={onPhoneBook} />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function SheetRow({ label, onPress, last = false }: { label: string; onPress: () => void; last?: boolean }) {
  const styles = useStyles(makeStyles);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.sheetRow, !last && styles.sheetBorder, pressed && styles.pressed]}>
      <Text style={styles.sheetText}>{label}</Text>
    </Pressable>
  );
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function dateOnlyIso(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12).toISOString();
}

const makeStyles = (c: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  header: { height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cancel: { width: 70, color: c.accent, fontSize: type.body, fontWeight: '500' },
  headerTitle: { color: c.text, fontSize: type.bodyLarge, fontWeight: '700' },
  headerRight: { width: 70 },
  formScroll: { flex: 1 },
  content: { paddingHorizontal: layout.screenPadding, paddingTop: 28, paddingBottom: 40, gap: 30 },
  amountRow: { flexDirection: 'row', gap: 10 },
  amountField: { flex: 1, height: layout.controlHeight, flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, paddingHorizontal: 18 },
  amountInput: { flex: 1, color: c.text, fontSize: type.inputAmount, fontWeight: '500', paddingVertical: 0 },
  amountPlus: { color: c.accent, fontSize: 26, fontWeight: '300', marginRight: -4 },
  currencyField: { width: 112, height: layout.controlHeight, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border },
  currencyCode: { color: c.text, fontSize: type.body, fontWeight: '700' },
  currencySign: { color: c.text, fontSize: type.bodyLarge, fontWeight: '700' },
  personField: { height: layout.controlHeight, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 14, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border },
  personPlus: { width: 26, height: 26, borderRadius: 13, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' },
  personPlusText: { color: c.accentInk, fontSize: 18, fontWeight: '600', lineHeight: 21 },
  personText: { flex: 1, color: c.text, fontSize: type.bodyLarge, fontWeight: '600' },
  personTextEmpty: { color: c.textMuted, fontWeight: '500' },
  dueField: { height: layout.controlHeight, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, paddingLeft: 16, paddingRight: 14 },
  dateText: { color: c.text, fontSize: type.body, fontWeight: '500' },
  datePickerRow: { marginTop: 10, alignItems: 'flex-start' },
  chevron: { color: c.textMuted, fontSize: 22, fontWeight: '400', marginLeft: 2 },
  switch: { alignSelf: 'center' },
  pressedField: { backgroundColor: c.surfacePressed, borderColor: c.accent },
  datePicker: { width: 260, height: 40 },
  noteInput: { height: 104, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, color: c.text, fontSize: type.bodyLarge, fontWeight: '500', lineHeight: 22, paddingHorizontal: 18, paddingTop: 15 },
  footer: { flexShrink: 0, width: '100%', paddingHorizontal: layout.screenPadding, paddingTop: 17, paddingBottom: 16, backgroundColor: c.bar },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: c.overlay },
  actionSheetSafe: { paddingHorizontal: 8, paddingBottom: 8 },
  actionGroup: { borderRadius: radius.md, overflow: 'hidden', marginBottom: 8 },
  sheetRow: { height: 54, alignItems: 'center', justifyContent: 'center', backgroundColor: c.sheetRow },
  sheetBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.sheetRowBorder },
  sheetText: { color: c.text, fontSize: 19, fontWeight: '500' },
  cancelRow: { height: 54, alignItems: 'center', justifyContent: 'center', backgroundColor: c.sheetCancel, borderRadius: radius.md },
  cancelRowText: { color: c.text, fontSize: 19, fontWeight: '700' },
  listSheet: { maxHeight: '80%', backgroundColor: c.bgRaised, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: layout.screenPadding, gap: 16 },
  manualSheet: { maxHeight: '88%', backgroundColor: c.bgRaised, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: layout.screenPadding, paddingTop: layout.screenPadding, paddingBottom: 12, gap: 12 },
  sheetTitle: { color: c.text, fontSize: type.title, fontWeight: '800' },
  peopleList: { maxHeight: 360 },
  existingRow: { height: 58, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border, paddingHorizontal: 4 },
  existingName: { color: c.text, fontSize: type.bodyLarge, fontWeight: '600' },
  noPeople: { color: c.textSecondary, fontSize: type.body, paddingVertical: 34, textAlign: 'center' },
  nameInput: { height: 54, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, color: c.text, fontSize: type.bodyLarge, paddingHorizontal: 18 },
  manualActions: { flexDirection: 'row', gap: 10 },
  manualButton: { flex: 1 },
  secondaryActions: { gap: 9, paddingTop: 2 },
  pressed: { opacity: 0.64 },
});
