/**
 * PANTALLA 2 — una persona: lo que debe y su historial.
 * SCREEN 2 — one person: what they owe and their history.
 *
 * PROVISIONAL: los números están escritos a mano. Los datos de verdad y el
 * teclado numérico llegan en el paso 4.
 * TEMPORARY: the numbers are hardcoded. Real data and the number pad come in step 4.
 */
import { Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useLang } from '../../src/i18n';
import { colors, radius, size } from '../../src/theme';

const EJEMPLO: Record<string, { name: string; amount: string }> = {
  '1': { name: 'Juan', amount: '$120.00' },
  '2': { name: 'María', amount: '$45.50' },
};

export default function PersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLang();
  const person = EJEMPLO[id] ?? { name: '—', amount: '$0.00' };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: person.name }} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>{t.owesMeNow}</Text>
          <Text style={styles.heroAmount}>{person.amount}</Text>
        </View>

        <Text style={styles.section}>{t.history}</Text>
        <Text style={styles.empty}>{t.emptyMovs}</Text>
      </ScrollView>

      {/* Verde = te deben más. Rojo = te pagaron. */}
      <View style={styles.actions}>
        <Pressable style={[styles.action, styles.actionUp]}>
          <Text style={[styles.actionText, { color: colors.upInk }]}>{t.borrowed}</Text>
        </Pressable>
        <Pressable style={[styles.action, styles.actionDown]}>
          <Text style={[styles.actionText, { color: colors.downInk }]}>{t.paidBtn}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 14, paddingBottom: 30 },

  hero: { alignItems: 'center', paddingVertical: 18 },
  heroLabel: {
    color: colors.dim,
    fontSize: size.tiny,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  heroAmount: { color: colors.up, fontSize: size.heroAmount, fontWeight: '800', marginTop: 5 },

  section: {
    color: colors.dim,
    fontSize: size.tiny,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    paddingTop: 10,
    paddingBottom: 8,
  },
  empty: { color: colors.dim, fontSize: size.small, textAlign: 'center', paddingVertical: 30 },

  actions: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.card,
  },
  action: {
    flex: 1,
    minHeight: 62,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionUp: { backgroundColor: colors.up },
  actionDown: { backgroundColor: colors.down },
  actionText: { fontSize: size.title, fontWeight: '800', letterSpacing: 0.2 },
});
