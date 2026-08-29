/**
 * PANTALLA 1 — la lista de personas.
 * SCREEN 1 — the list of people.
 *
 * PROVISIONAL: las dos personas de abajo están escritas a mano solo para
 * comprobar que se puede pasar de una pantalla a otra. Se reemplazan por
 * datos de verdad en el paso 3.
 * TEMPORARY: the two people below are hardcoded only to prove navigation
 * works. Real data replaces them in step 3.
 */
import { Link, Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useLang } from '../src/i18n';
import { colors, radius, size } from '../src/theme';

const EJEMPLO = [
  { id: '1', name: 'Juan', amount: '$120.00' },
  { id: '2', name: 'María', amount: '$45.50' },
];

export default function ListScreen() {
  const { t, lang, setLang } = useLang();

  return (
    <>
      <Stack.Screen options={{ title: 'Pagos' }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t.totalOwed}</Text>
          <Text style={styles.totalAmount}>$165.50</Text>
        </View>

        <Text style={styles.section}>{t.owing}</Text>

        {EJEMPLO.map((p) => (
          <Link key={p.id} href={`/person/${p.id}`} asChild>
            <Pressable style={styles.card}>
              <View style={styles.strip} />
              <View style={styles.cardBody}>
                <Text style={styles.cardName}>{p.name}</Text>
                <Text style={styles.cardAmount}>{p.amount}</Text>
              </View>
            </Pressable>
          </Link>
        ))}

        {/* PROVISIONAL: botones para ver los dos idiomas. El menú real llega después. */}
        <Text style={styles.section}>{t.options}</Text>
        <View style={styles.langRow}>
          <Pressable
            style={[styles.langBtn, lang === 'es' && styles.langBtnOn]}
            onPress={() => setLang('es')}>
            <Text style={[styles.langText, lang === 'es' && styles.langTextOn]}>Español</Text>
          </Pressable>
          <Pressable
            style={[styles.langBtn, lang === 'en' && styles.langBtnOn]}
            onPress={() => setLang('en')}>
            <Text style={[styles.langText, lang === 'en' && styles.langTextOn]}>English</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 14, paddingBottom: 40 },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  totalLabel: { color: colors.dim, fontSize: size.totalAmount - 2, fontWeight: '800' },
  totalAmount: { color: colors.up, fontSize: size.totalAmount, fontWeight: '800' },

  section: {
    color: colors.dim,
    fontSize: size.tiny,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    paddingTop: 18,
    paddingBottom: 8,
    paddingHorizontal: 2,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.card,
    marginBottom: 8,
    overflow: 'hidden',
  },
  strip: { width: 4, alignSelf: 'stretch', backgroundColor: colors.up },
  cardBody: { flex: 1, paddingVertical: 10, paddingHorizontal: 13 },
  cardName: { color: colors.dim, fontSize: size.name, fontWeight: '600' },
  cardAmount: { color: colors.up, fontSize: size.cardAmount, fontWeight: '800' },

  langRow: { flexDirection: 'row', gap: 10 },
  langBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.card,
    backgroundColor: colors.card2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBtnOn: { backgroundColor: colors.accent },
  langText: { color: colors.dim, fontSize: size.small, fontWeight: '700' },
  langTextOn: { color: colors.upInk },
});
