import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav, EmptyState, InitialAvatar } from '../src/components/ui';
import { formatMoney } from '../src/data/format';
import { getBalanceCents, useData } from '../src/data/store';
import { useLang } from '../src/i18n';
import { layout, radius, type, useStyles, type Palette } from '../src/theme';

export default function PeopleScreen() {
  const styles = useStyles(makeStyles);
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
                <Text style={styles.amount}>{formatMoney(getBalanceCents(data, person.id), person.currency, lang)}</Text>
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
  header: { height: 64, alignItems: 'center', justifyContent: 'center' },
  title: { color: c.text, fontSize: type.screenTitle, fontWeight: '700' },
  content: { paddingHorizontal: layout.screenPadding, paddingTop: 23, paddingBottom: 36, gap: 10 },
  personRow: { width: '100%', height: 91, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 19, backgroundColor: c.surface, borderRadius: radius.md, overflow: 'hidden' },
  personCopy: { gap: 4 },
  personName: { color: c.text, fontSize: 22, fontWeight: '700' },
  amount: { color: c.textSecondary, fontSize: 18, fontWeight: '400' },
  pressed: { opacity: 0.64 },
});
