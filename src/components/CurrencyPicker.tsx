import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CURRENCY_LIST, type CurrencyEntry } from '../data/currencies';
import { useLang } from '../i18n';
import { font, layout, radius, tabular, type, useColors, useStyles, type Palette } from '../theme';
import { Button } from './ui';

/** Strips accents so "dolar" finds "Dólar". */
function fold(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
}

export function CurrencyPicker({
  visible,
  selected,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selected: string;
  onClose: () => void;
  onSelect: (code: string) => void;
}) {
  const styles = useStyles(makeStyles);
  const c = useColors();
  const { t, lang } = useLang();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const needle = fold(query.trim());
    const named = CURRENCY_LIST.map((entry) => ({ entry, name: lang === 'es' ? entry.es : entry.en }));
    const matches = needle
      ? named.filter(({ entry, name }) => fold(entry.code).includes(needle) || fold(name).includes(needle))
      : named;
    // The chosen currency first, then alphabetical by code.
    return matches.sort((a, b) => {
      if (a.entry.code === selected) return -1;
      if (b.entry.code === selected) return 1;
      return a.entry.code.localeCompare(b.entry.code);
    });
  }, [query, lang, selected]);

  const choose = (code: string) => {
    setQuery('');
    onSelect(code);
  };

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close} presentationStyle="pageSheet">
      <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>{t.chooseCurrency}</Text>
        </View>

        <View style={styles.searchWrap}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t.searchCurrency}
            placeholderTextColor={c.mute}
            selectionColor={c.ink}
            autoCorrect={false}
            autoCapitalize="characters"
            clearButtonMode="while-editing"
            style={styles.search}
          />
        </View>

        <FlatList
          data={results}
          keyExtractor={(item) => item.entry.code}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={20}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>{t.noCurrencyResults}</Text>}
          renderItem={({ item }) => (
            <CurrencyRow
              entry={item.entry}
              name={item.name}
              active={item.entry.code === selected}
              onPress={() => choose(item.entry.code)}
            />
          )}
        />

        <View style={styles.footer}>
          <Button label={t.cancel} tone="outline" onPress={close} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function CurrencyRow({
  entry,
  name,
  active,
  onPress,
}: {
  entry: CurrencyEntry;
  name: string;
  active: boolean;
  onPress: () => void;
}) {
  const styles = useStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.row, active && styles.rowActive, pressed && styles.pressed]}>
      <View style={styles.symbolBox}>
        <Text style={styles.symbol} numberOfLines={1}>
          {entry.symbol}
        </Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.code}>{entry.code}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </View>
      {active ? <Text style={styles.check}>✓</Text> : null}
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.sheet },
    header: { paddingHorizontal: layout.screenPadding, paddingTop: 6, paddingBottom: 10 },
    title: { color: c.ink, fontFamily: font.extrabold, fontSize: type.sheetTitle, letterSpacing: -0.6 },
    searchWrap: { paddingHorizontal: layout.screenPadding, paddingBottom: 10 },
    search: {
      height: 48,
      backgroundColor: c.sheetCard,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.sheetLine,
      color: c.ink,
      fontFamily: font.medium,
      fontSize: 16,
      paddingHorizontal: 14,
    },
    list: { paddingHorizontal: layout.screenPadding, paddingBottom: 12 },
    row: {
      minHeight: layout.minTapTarget + 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 12,
      marginBottom: 6,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.sheetLine,
      backgroundColor: c.sheetCard,
    },
    rowActive: { borderColor: c.ink, borderWidth: 2 },
    symbolBox: {
      width: 46,
      height: 34,
      borderRadius: radius.sm,
      backgroundColor: c.chip,
      alignItems: 'center',
      justifyContent: 'center',
    },
    symbol: { color: c.mute, fontFamily: font.semibold, fontSize: type.body },
    copy: { flex: 1 },
    code: { color: c.ink, fontFamily: font.semibold, fontSize: type.body, letterSpacing: -0.17 },
    name: { color: c.mute, fontFamily: font.regular, fontSize: type.label },
    check: { color: c.ink, fontFamily: font.extrabold, fontSize: type.bodyLarge },
    empty: { color: c.mute, fontFamily: font.regular, fontSize: type.body, textAlign: 'center', paddingTop: 40 },
    footer: { paddingHorizontal: layout.screenPadding, paddingTop: 8 },
    pressed: { opacity: 0.7 },
  });
