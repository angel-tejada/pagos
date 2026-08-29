import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActionSheetIOS, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/ui';
import { shareBalanceMessage } from '../../src/data/files';
import { formatEntryDate, formatMoney } from '../../src/data/format';
import { getBalanceCents, useData, type Entry, type Person } from '../../src/data/store';
import { useLang } from '../../src/i18n';
import { layout, radius, type, useStyles, type Palette } from '../../src/theme';

export default function PersonScreen() {
  const styles = useStyles(makeStyles);
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, lang } = useLang();
  const { data, renamePerson, deletePerson, deleteEntry } = useData();
  const person = data.people.find((candidate) => candidate.id === id);
  const entries = data.entries
    .filter((entry) => entry.personId === id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (!person) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.missing}>
          <Button label={t.goBack} onPress={() => router.replace('/')} />
        </View>
      </SafeAreaView>
    );
  }

  const editPerson = () => {
    Alert.prompt(t.editPerson, t.name, (name) => renamePerson(person.id, name), 'plain-text', person.name);
  };

  const confirmDeletePerson = () => {
    Alert.alert(t.delete, t.confirmDelPerson(person.name), [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.delete,
        style: 'destructive',
        onPress: () => {
          deletePerson(person.id);
          router.replace('/');
        },
      },
    ]);
  };

  const openActions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [t.cancel, t.editPerson, t.delete], cancelButtonIndex: 0, destructiveButtonIndex: 2 },
        (index) => {
          if (index === 1) editPerson();
          if (index === 2) confirmDeletePerson();
        },
      );
      return;
    }
    Alert.alert(person.name, undefined, [
      { text: t.editPerson, onPress: editPerson },
      { text: t.delete, style: 'destructive', onPress: confirmDeletePerson },
      { text: t.cancel, style: 'cancel' },
    ]);
  };

  const confirmDeleteEntry = (entry: Entry) => {
    Alert.alert(
      entry.kind === 'debt' ? t.borrowed : t.paidBtn,
      `${formatMoney(entry.amountCents, person.currency, lang)}\n${formatEntryDate(entry, lang)}${entry.note ? `\n${entry.note}` : ''}`,
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.delete, style: 'destructive', onPress: () => deleteEntry(entry.id) },
      ],
    );
  };

  const sendBalance = () => {
    void shareBalanceMessage(person, data, t, lang).catch(() => Alert.alert(t.shareFailed));
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.headerControl}>‹</Text>
        </Pressable>
        <Text style={styles.name}>{person.name}</Text>
        <Pressable accessibilityLabel={t.moreActions} hitSlop={12} onPress={openActions} style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.more}>•••</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.balance}>{formatMoney(getBalanceCents(data, person.id), person.currency, lang)}</Text>

        <Button label={t.sendBalance} tone="secondary" style={styles.sendButton} onPress={sendBalance} />

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>{t.history}</Text>
          {entries.length === 0 ? (
            <Text style={styles.empty}>{t.emptyMovs}</Text>
          ) : (
            <View style={styles.historyList}>
              {entries.map((entry) => (
                <HistoryRow key={entry.id} entry={entry} person={person} onDelete={() => confirmDeleteEntry(entry)} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.actionBar}>
        <Button label={t.borrowed} style={styles.actionButton} onPress={() => router.push({ pathname: '/entry', params: { kind: 'debt', person: id } })} />
        <Button label={t.paidBtn} tone="secondary" style={styles.actionButton} onPress={() => router.push({ pathname: '/entry', params: { kind: 'paid', person: id } })} />
      </SafeAreaView>
    </SafeAreaView>
  );
}

function HistoryRow({ entry, person, onDelete }: { entry: Entry; person: Person; onDelete: () => void }) {
  const styles = useStyles(makeStyles);
  const { t, lang } = useLang();
  const isDebt = entry.kind === 'debt';
  return (
    <View style={styles.historyRow}>
      <View style={[styles.entryMark, !isDebt && styles.entryMarkPaid]}>
        <Text style={styles.entryArrow}>{isDebt ? '↑' : '↓'}</Text>
      </View>
      <View style={styles.entryCopy}>
        <Text style={styles.entryTitle}>{isDebt ? t.borrowed : t.paidBtn}</Text>
        <Text style={styles.entryMeta}>{formatEntryDate(entry, lang)}{entry.note ? ` · ${entry.note}` : ''}</Text>
      </View>
      <View style={styles.entryRight}>
        <Text style={[styles.entryAmount, !isDebt && styles.entryAmountPaid]}>
          {isDebt ? '+' : '−'}{formatMoney(entry.amountCents, person.currency, lang)}
        </Text>
        {/* A labelled control, not a swipe: swiping is a steering gesture with
            no affordance, which is exactly wrong for the target user. */}
        <Pressable
          accessibilityLabel={t.delete}
          hitSlop={12}
          onPress={onDelete}
          style={({ pressed }) => [styles.deleteControl, pressed && styles.pressed]}>
          <Text style={styles.deleteText}>{t.delete}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  missing: { flex: 1, justifyContent: 'center', paddingHorizontal: layout.screenPadding },
  header: { height: 64, paddingHorizontal: layout.screenPadding, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerControl: { width: 36, color: c.accent, fontSize: 38, fontWeight: '300', lineHeight: 40 },
  name: { color: c.text, fontSize: type.screenTitle, fontWeight: '700' },
  more: { width: 36, color: c.accent, fontSize: 16, fontWeight: '800', textAlign: 'right', letterSpacing: -1 },
  content: { paddingHorizontal: layout.screenPadding, paddingTop: 38, paddingBottom: 40 },
  balance: { color: c.text, fontSize: 58, fontWeight: '600', letterSpacing: -2, textAlign: 'center' },
  sendButton: { marginTop: 26 },
  historySection: { marginTop: 58 },
  sectionTitle: { color: c.text, fontSize: type.title, fontWeight: '700', marginLeft: 10, marginBottom: 12 },
  historyList: { gap: 9 },
  historyRow: { minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, backgroundColor: c.surface, borderRadius: radius.md },
  entryMark: { width: 38, height: 38, borderRadius: 19, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' },
  entryMarkPaid: { backgroundColor: c.neutralMark },
  entryArrow: { color: c.text, fontSize: 19, fontWeight: '800' },
  entryCopy: { flex: 1, gap: 4 },
  entryTitle: { color: c.text, fontSize: 17, fontWeight: '600' },
  entryMeta: { color: c.textSecondary, fontSize: 12 },
  entryRight: { alignItems: 'flex-end', gap: 2 },
  entryAmount: { color: c.accent, fontSize: 18, fontWeight: '700' },
  deleteControl: { minHeight: 28, justifyContent: 'center', paddingHorizontal: 2 },
  deleteText: { color: c.textSecondary, fontSize: type.label, fontWeight: '600' },
  entryAmountPaid: { color: c.textSecondary },
  empty: { color: c.textMuted, fontSize: type.body, textAlign: 'center', paddingTop: 80 },
  actionBar: { flexDirection: 'row', gap: 10, paddingHorizontal: layout.screenPadding, paddingTop: 16, paddingBottom: 16, backgroundColor: c.bar },
  actionButton: { flex: 1 },
  pressed: { opacity: 0.64 },
});
