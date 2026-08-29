import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActionSheetIOS, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OptionsSheet } from '../src/components/OptionsSheet';
import { BottomNav, Button, IconButton } from '../src/components/ui';
import { formatMoney } from '../src/data/format';
import { FREE_PERSON_LIMIT, getBalanceCents, useData, type Person } from '../src/data/store';
import { useLang } from '../src/i18n';
import { balanceColor, layout, radius, spacing, type, useColors, useStyles, type Palette } from '../src/theme';

export default function HomeScreen() {
  const styles = useStyles(makeStyles);
  const c = useColors();
  const { t, lang } = useLang();
  const { data, renamePerson, deletePerson } = useData();
  const router = useRouter();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const people = data.people
    .map((person) => ({ person, balance: getBalanceCents(data, person.id) }))
    .filter(({ balance }) => balance > 0)
    .sort((a, b) => b.balance - a.balance);
  const total = people.reduce((sum, item) => sum + item.balance, 0);

  const editPerson = (person: Person) => {
    Alert.prompt(t.editPerson, t.name, (name) => renamePerson(person.id, name), 'plain-text', person.name);
  };

  const confirmDelete = (person: Person) => {
    Alert.alert(t.delete, t.confirmDelPerson(person.name), [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: () => deletePerson(person.id) },
    ]);
  };

  const openPersonActions = (person: Person) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [t.cancel, t.viewPerson, t.editPerson, t.delete], cancelButtonIndex: 0, destructiveButtonIndex: 3 },
        (index) => {
          if (index === 1) router.push(`/person/${person.id}`);
          if (index === 2) editPerson(person);
          if (index === 3) confirmDelete(person);
        },
      );
      return;
    }
    Alert.alert(person.name, undefined, [
      { text: t.viewPerson, onPress: () => router.push(`/person/${person.id}`) },
      { text: t.editPerson, onPress: () => editPerson(person) },
      { text: t.delete, style: 'destructive', onPress: () => confirmDelete(person) },
      { text: t.cancel, style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => setOptionsOpen(true)} style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.settingsGlyph}>⚙︎</Text>
        </Pressable>
        <Text style={styles.brand}>Pagos</Text>
        <IconButton glyph="＋" size="small" tone="accent" accessibilityLabel={t.addEntryA11y} onPress={() => router.push('/entry')} />
      </View>

      {people.length === 0 ? (
        <View style={styles.emptyHome}>
          <DebtMark />
          <Button label={t.addDebt} style={styles.emptyButton} onPress={() => router.push('/entry')} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.total, { color: balanceColor(total, c) }]}>
            {formatMoney(total, people[0]?.person.currency ?? 'USD', lang)}
          </Text>

          <View style={styles.debtsSection}>
            <Text style={styles.sectionTitle}>{t.activeBalances}</Text>
            <View style={styles.list}>
              {people.map(({ person, balance }) => (
                <View key={person.id} style={styles.debtCard}>
                  <Pressable onPress={() => router.push(`/person/${person.id}`)} style={({ pressed }) => [styles.debtCopy, pressed && styles.pressed]}>
                    <Text style={styles.personName}>{person.name}</Text>
                    <Text style={[styles.personAmount, { color: balanceColor(balance, c) }]}>
                      {formatMoney(balance, person.currency, lang)}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel={t.moreActions}
                    hitSlop={10}
                    onPress={() => openPersonActions(person)}
                    style={({ pressed }) => [styles.moreCircle, pressed && styles.pressed]}>
                    <Text style={styles.moreDots}>•••</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      <Text style={styles.limitNote}>
        {data.people.length === 0
          ? t.freeLimitEmpty(FREE_PERSON_LIMIT)
          : t.freeLimitCount(data.people.length, FREE_PERSON_LIMIT)}
      </Text>

      <BottomNav active="home" />
      <OptionsSheet visible={optionsOpen} onClose={() => setOptionsOpen(false)} />
    </SafeAreaView>
  );
}

function DebtMark() {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.debtMarkOuter}>
      <View style={styles.debtMarkInner}><Text style={styles.debtMarkText}>$</Text></View>
    </View>
  );
}

const makeStyles = (c: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  header: { height: 64, paddingHorizontal: layout.screenPadding, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingsGlyph: { width: 32, color: c.accent, fontSize: 29, fontWeight: '700', lineHeight: 33, textAlign: 'center' },
  brand: { color: c.text, fontSize: type.screenTitle, fontWeight: '500' },
  content: { paddingHorizontal: layout.screenPadding, paddingTop: 38, paddingBottom: spacing.xxxl },
  total: { fontSize: type.heroAmount, fontWeight: '600', letterSpacing: -2.2, textAlign: 'center' },
  debtsSection: { marginTop: 100 },
  sectionTitle: { color: c.text, fontSize: type.title, fontWeight: '700', marginLeft: 10, marginBottom: 12 },
  list: { gap: 10 },
  debtCard: { width: '100%', height: 98, flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, borderRadius: radius.md, paddingHorizontal: 23, overflow: 'hidden' },
  debtCopy: { flex: 1, alignSelf: 'stretch', justifyContent: 'center' },
  personName: { color: c.text, fontSize: 18, fontWeight: '500', marginBottom: 4 },
  personAmount: { fontSize: type.amount, fontWeight: '600', letterSpacing: -0.4 },
  moreCircle: { width: 29, height: 29, borderRadius: 15, backgroundColor: c.chip, alignItems: 'center', justifyContent: 'center' },
  moreDots: { color: c.chipInk, fontSize: 12, fontWeight: '800', letterSpacing: -1, marginTop: -4 },
  emptyHome: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 68 },
  debtMarkOuter: { width: 108, height: 108, borderRadius: 54, borderWidth: 7, borderColor: c.emptyMark, alignItems: 'center', justifyContent: 'center' },
  debtMarkInner: { width: 76, height: 76, borderRadius: 38, borderWidth: 6, borderColor: c.emptyMark, alignItems: 'center', justifyContent: 'center' },
  debtMarkText: { color: c.emptyMark, fontSize: 48, fontWeight: '800' },
  emptyButton: { minHeight: 52, width: 138, borderRadius: 26, marginTop: 45 },
  limitNote: { color: c.textMuted, fontSize: type.caption, textAlign: 'center', paddingBottom: 10 },
  pressed: { opacity: 0.64 },
});
