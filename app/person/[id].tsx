import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, EmptyState } from '../../src/components/ui';
import { shareBalanceMessage, sharePersonPdf } from '../../src/data/files';
import { formatBalance, formatEntryDate, formatMoney } from '../../src/data/format';
import { getBalanceCents, useData, type Entry, type Person } from '../../src/data/store';
import { showActions, showAlert, showPrompt } from '../../src/components/dialogs';
import { useLang } from '../../src/i18n';
import { balanceColor, font, layout, radius, tabular, type, useColors, useStyles, type Palette } from '../../src/theme';

export default function PersonScreen() {
  const styles = useStyles(makeStyles);
  const c = useColors();
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
    showPrompt(t.editPerson, t.name, (name) => renamePerson(person.id, name), person.name);
  };

  const confirmDeletePerson = () => {
    showAlert(t.delete, t.confirmDelPerson(person.name), [
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
    showActions(
      { options: [t.cancel, t.editPerson, t.delete], cancelButtonIndex: 0, destructiveButtonIndex: 2 },
      (index) => {
        if (index === 1) editPerson();
        if (index === 2) confirmDeletePerson();
      },
    );
  };

  const confirmDeleteEntry = (entry: Entry) => {
    showAlert(t.confirmDelMov, `${formatMoney(entry.amountCents, person.currency, lang)}\n${formatEntryDate(entry, lang)}`, [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: () => deleteEntry(entry.id) },
    ]);
  };

  const balance = getBalanceCents(data, person.id);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={({ pressed }) => [styles.headerSide, pressed && styles.pressed]}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.name} numberOfLines={1}>
          {person.name}
        </Text>
        <Pressable
          accessibilityLabel={t.moreActions}
          hitSlop={12}
          onPress={openActions}
          style={({ pressed }) => [styles.headerSide, styles.headerRight, pressed && styles.pressed]}>
          <Text style={styles.dots}>•••</Text>
        </Pressable>
      </View>

      <View style={styles.balanceWrap}>
        <Text style={[styles.balance, { color: balanceColor(balance, c) }]}>
          {formatBalance(balance, person.currency, lang)}
        </Text>
      </View>

      {/* Both quiet outlines: neither is the primary action on this screen. */}
      <View style={styles.shareRow}>
        <Button
          label={t.sendBalance}
          tone="outline"
          style={styles.shareButton}
          onPress={() => void shareBalanceMessage(person, data, t, lang).catch(() => showAlert(t.shareFailed))}
        />
        <Button
          label={t.sharePdf}
          tone="outline"
          style={styles.shareButton}
          onPress={() => void sharePersonPdf(person, data, t, lang).catch(() => showAlert(t.shareFailed))}
        />
      </View>

      <Text style={styles.section}>{t.history}</Text>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {entries.length === 0 ? (
          <EmptyState body={t.emptyMovs} />
        ) : (
          entries.map((entry) => (
            <HistoryRow
              key={entry.id}
              entry={entry}
              person={person}
              onDelete={() => confirmDeleteEntry(entry)}
            />
          ))
        )}
      </ScrollView>

      <View style={styles.dock}>
        <Button
          label={t.borrowed}
          tone="debt"
          style={styles.dockButton}
          onPress={() => router.push({ pathname: '/entry', params: { kind: 'debt', person: id } })}
        />
        <Button
          label={t.paidBtn}
          tone="payment"
          style={styles.dockButton}
          onPress={() => router.push({ pathname: '/entry', params: { kind: 'paid', person: id } })}
        />
      </View>
    </SafeAreaView>
  );
}

/**
 * Fully neutral. Direction is the word and the sign, never colour, so the
 * ledger reads the same for someone who cannot tell red from green.
 */
function HistoryRow({ entry, person, onDelete }: { entry: Entry; person: Person; onDelete: () => void }) {
  const styles = useStyles(makeStyles);
  const { t, lang } = useLang();
  const isDebt = entry.kind === 'debt';
  return (
    <View style={styles.entry}>
      <View style={styles.mark}>
        <Text style={styles.markGlyph}>{isDebt ? '↑' : '↓'}</Text>
      </View>
      <View style={styles.entryMain}>
        <Text style={styles.entryTitle}>{isDebt ? t.borrowed : t.paidBtn}</Text>
        <Text style={styles.entryMeta} numberOfLines={1}>
          {formatEntryDate(entry, lang)}
          {entry.note ? ` · ${entry.note}` : ''}
        </Text>
      </View>
      <View style={styles.entryRight}>
        <Text style={styles.entryAmount}>
          {isDebt ? '+' : '−'}
          {formatMoney(entry.amountCents, person.currency, lang)}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel={t.delete} hitSlop={12} onPress={onDelete}>
          <Text style={styles.entryDelete}>{t.delete}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg },
    missing: { flex: 1, justifyContent: 'center', paddingHorizontal: layout.screenPadding },

    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: layout.screenPadding, paddingTop: 6, paddingBottom: 10 },
    headerSide: { width: 44, height: 44, justifyContent: 'center' },
    headerRight: { alignItems: 'flex-end' },
    back: { color: c.ink, fontSize: 26, fontFamily: font.regular, lineHeight: 30 },
    dots: { color: c.ink, fontSize: 20, letterSpacing: 1, fontFamily: font.bold },
    name: { flex: 1, textAlign: 'center', color: c.ink, fontFamily: font.bold, fontSize: type.title, letterSpacing: -0.19 },

    balanceWrap: { paddingHorizontal: layout.screenPadding, paddingTop: 24, paddingBottom: 26 },
    balance: { textAlign: 'center', fontFamily: font.extrabold, fontSize: type.hero, letterSpacing: -2.5, ...tabular },

    shareRow: { flexDirection: 'row', gap: 12, paddingHorizontal: layout.screenPadding, paddingBottom: 30 },
    shareButton: { flex: 1, minHeight: layout.actionHeight },

    section: {
      paddingHorizontal: layout.screenPadding,
      paddingBottom: 12,
      color: c.ink,
      fontFamily: font.bold,
      fontSize: type.title,
      letterSpacing: -0.19,
    },

    list: { paddingHorizontal: layout.screenPadding, paddingBottom: 8 },
    entry: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: radius.xl,
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    mark: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.chip,
      alignItems: 'center',
      justifyContent: 'center',
    },
    markGlyph: { color: c.ink, fontSize: 18, fontFamily: font.bold },
    entryMain: { flex: 1, minWidth: 0 },
    entryTitle: { color: c.ink, fontFamily: font.bold, fontSize: 16, letterSpacing: -0.16 },
    entryMeta: { color: c.mute, fontFamily: font.regular, fontSize: type.caption, marginTop: 2 },
    entryRight: { alignItems: 'flex-end' },
    entryAmount: { color: c.ink, fontFamily: font.extrabold, fontSize: type.entryAmount, letterSpacing: -0.4, ...tabular },
    entryDelete: { color: c.mute, fontFamily: font.semibold, fontSize: type.label, marginTop: 3 },

    dock: { flexDirection: 'row', gap: 12, paddingHorizontal: layout.screenPadding, paddingVertical: 14 },
    dockButton: { flex: 1 },
    pressed: { opacity: 0.7 },
  });
