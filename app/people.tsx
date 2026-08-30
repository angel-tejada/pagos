import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav, EmptyState, InitialAvatar } from '../src/components/ui';
import { formatBalance } from '../src/data/format';
import { getBalanceCents, useData } from '../src/data/store';
import { useLang } from '../src/i18n';
import { balanceColor, layout, radius, type, useColors, useStyles, type Palette } from '../src/theme';

export default function PeopleScreen() {
  const styles = useStyles(makeStyles);
  const c = useColors();
  const { t, lang } = useLang();
  const { data } = useData();
  const router = useRouter();
  const people = [...data.people].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.peopleTitle}</Text>
      </View>

      {people.length === 0 ? (
        <EmptyState title={t.noPeopleTitle} body={t.noPeopleBody} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {people.map((person) => (
            <Pressable
              key={person.id}
              onPress={() => router.push(`/person/${person.id}`)}
              style={({ pressed }) => [styles.personRow, pressed && styles.pressed]}>
              <InitialAvatar name={person.name} size={48} />
              <View style={styles.personCopy}>
                <Text style={styles.personName}>{person.name}</Text>
                <Text style={[styles.amount, { color: balanceColor(getBalanceCents(data, person.id), c) }]}>
                  {formatBalance(getBalanceCents(data, person.id), person.currency, lang)}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <BottomNav active="people" />
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  header: { height: 56, alignItems: 'center', justifyContent: 'center' },
  title: { color: c.text, fontSize: type.screenTitle, fontWeight: '700' },
  content: { paddingHorizontal: layout.screenPadding, paddingTop: 23, paddingBottom: 36, gap: 10 },
  personRow: { width: '100%', height: 77, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.borderSoft, overflow: 'hidden' },
  personCopy: { gap: 4 },
  personName: { color: c.text, fontSize: 19, fontWeight: '700' },
  amount: { fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.64 },
});
