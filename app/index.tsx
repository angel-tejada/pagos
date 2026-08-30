import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OptionsSheet } from '../src/components/OptionsSheet';
import { EmptyState } from '../src/components/ui';
import { formatBalance } from '../src/data/format';
import { FREE_PERSON_LIMIT, getBalanceCents, useData, type Person } from '../src/data/store';
import { showActions, showAlert, showPrompt } from '../src/components/dialogs';
import { useLang } from '../src/i18n';
import { balanceColor, font, layout, radius, tabular, type, useColors, useStyles, type Palette } from '../src/theme';

export default function HomeScreen() {
  const styles = useStyles(makeStyles);
  const c = useColors();
  const { t, lang } = useLang();
  const { data, renamePerson, deletePerson } = useData();
  const router = useRouter();
  const [optionsOpen, setOptionsOpen] = useState(false);

  const people = data.people
    .map((person) => ({ person, balance: getBalanceCents(data, person.id) }))
    .sort((a, b) => b.balance - a.balance);
  const total = people.reduce((sum, item) => sum + Math.max(0, item.balance), 0);

  const editPerson = (person: Person) => {
    showPrompt(t.editPerson, t.name, (name) => renamePerson(person.id, name), person.name);
  };

  const confirmDelete = (person: Person) => {
    showAlert(t.delete, t.confirmDelPerson(person.name), [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: () => deletePerson(person.id) },
    ]);
  };

  const openPersonActions = (person: Person) => {
    showActions(
      {
        options: [t.cancel, t.viewPerson, t.editPerson, t.delete],
        cancelButtonIndex: 0,
        destructiveButtonIndex: 3,
      },
      (index) => {
        if (index === 1) router.push(`/person/${person.id}`);
        if (index === 2) editPerson(person);
        if (index === 3) confirmDelete(person);
      },
    );
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      {/* Plain glyphs, no circular backgrounds. Same 44px target on both;
          the plus simply draws larger than the gear. */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.openOptions}
          onPress={() => setOptionsOpen(true)}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
          <Text style={styles.gearGlyph}>⚙</Text>
        </Pressable>
        <Text style={styles.brand}>Pagos</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.addEntryA11y}
          onPress={() => router.push('/entry')}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
          <Text style={styles.plusGlyph}>＋</Text>
        </Pressable>
      </View>

      <View style={styles.totalWrap}>
        <Text style={[styles.total, { color: balanceColor(total, c) }]}>
          {formatBalance(total, people[0]?.person.currency ?? 'USD', lang)}
        </Text>
      </View>

      <Text style={styles.section}>{t.activeBalances}</Text>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {people.length === 0 ? (
          <EmptyState body={t.emptyList} />
        ) : (
          people.map(({ person, balance }) => (
            <View key={person.id} style={styles.card}>
              {/* Name left, amount right, sharing one baseline. */}
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(`/person/${person.id}`)}
                style={({ pressed }) => [styles.cardMain, pressed && styles.pressed]}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {person.name}
                </Text>
                <Text style={[styles.cardAmount, balance === 0 && styles.cardAmountZero, { color: balanceColor(balance, c) }]}>
                  {formatBalance(balance, person.currency, lang)}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t.moreActions}
                hitSlop={8}
                onPress={() => openPersonActions(person)}
                style={({ pressed }) => [styles.dots, pressed && styles.pressed]}>
                <Text style={styles.dotsGlyph}>•••</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      {/* Sits where the tab bar used to be. */}
      <Text style={styles.limitNote}>{t.freeLimitCount(data.people.length, FREE_PERSON_LIMIT)}</Text>

      <OptionsSheet visible={optionsOpen} onClose={() => setOptionsOpen(false)} />
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: layout.screenPadding,
      paddingTop: 6,
      paddingBottom: 10,
    },
    headerButton: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    gearGlyph: { color: c.ink, fontSize: 26, fontFamily: font.regular, lineHeight: 30 },
    plusGlyph: { color: c.ink, fontSize: 34, fontFamily: font.regular, lineHeight: 38 },
    brand: { flex: 1, textAlign: 'center', color: c.ink, fontFamily: font.bold, fontSize: type.title, letterSpacing: -0.19 },

    totalWrap: { paddingHorizontal: layout.screenPadding, paddingTop: 24, paddingBottom: 34 },
    total: {
      textAlign: 'center',
      fontFamily: font.extrabold,
      fontSize: type.hero,
      letterSpacing: -2.5,
      ...tabular,
    },

    section: {
      paddingHorizontal: layout.screenPadding,
      paddingBottom: 12,
      color: c.ink,
      fontFamily: font.bold,
      fontSize: type.title,
      letterSpacing: -0.19,
    },

    list: { paddingHorizontal: layout.screenPadding, paddingBottom: 8 },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: radius.xl,
      paddingVertical: 16,
      paddingHorizontal: 18,
      marginBottom: 12,
    },
    cardMain: { flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 10 },
    cardName: { flex: 1, color: c.ink, fontFamily: font.semibold, fontSize: type.cardName, letterSpacing: -0.18 },
    cardAmount: { fontFamily: font.bold, fontSize: type.cardAmount, letterSpacing: -0.5, ...tabular },
    cardAmountZero: { fontFamily: font.semibold, fontSize: type.cardName },
    dots: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: c.chip,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dotsGlyph: { color: c.chipInk, fontSize: 15, letterSpacing: 0.5, fontFamily: font.bold },

    limitNote: {
      textAlign: 'center',
      color: c.mute,
      fontFamily: font.regular,
      fontSize: type.label,
      paddingVertical: 14,
    },
    pressed: { opacity: 0.7 },
  });
