import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pickRestoreFile, shareBackup } from '../data/files';
import { useData } from '../data/store';
import { useLang } from '../i18n';
import { font, layout, radius, shadows, spacing, type, useStyles, useThemeControl, type Palette } from '../theme';
import { showAlert } from './dialogs';
import { Elevated, RAISED, RAISED_RADIUS } from './Elevated';
import { Sheet } from './Sheet';
import { Button, Segment } from './ui';

export function OptionsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const styles = useStyles(makeStyles);
  const { t, lang, setLang } = useLang();
  const { data, restoreData, markBackupComplete } = useData();
  const { scheme, setScheme } = useThemeControl();

  const runBackup = () => {
    void shareBackup(data).then(markBackupComplete).catch(() => showAlert(t.backupFailed));
  };

  const runRestore = () => {
    void pickRestoreFile()
      .then((restored) => {
        if (!restored) return;
        showAlert(t.mRestore, t.restoreConfirm, [
          { text: t.cancel, style: 'cancel' },
          {
            text: t.confirm,
            style: 'destructive',
            onPress: () => {
              restoreData(restored);
              onClose();
              showAlert(t.restored);
            },
          },
        ]);
      })
      .catch(() => showAlert(t.restoreFailed));
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View style={styles.modal}>
        <Pressable accessibilityLabel={t.close} style={styles.backdrop} onPress={onClose} />
        {/* Nothing in this sheet ever animates its opacity. A translucent sheet
            lets the screen behind show through and reads as broken. */}
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.grabber} />
            <Text style={styles.title}>{t.options}</Text>

            <Text style={styles.caption}>{t.language}</Text>
            <Elevated {...RAISED} radius={RAISED_RADIUS.segment} style={styles.segmentWrap}>
              <Segment
                options={[
                  { value: 'es' as const, label: 'Español' },
                  { value: 'en' as const, label: 'English' },
                ]}
                value={lang}
                onChange={setLang}
              />
            </Elevated>

            <Text style={styles.caption}>{t.appearance}</Text>
            <Elevated {...RAISED} radius={RAISED_RADIUS.segment} style={styles.segmentWrap}>
              <Segment
                options={[
                  { value: 'light' as const, label: t.themeLight },
                  { value: 'dark' as const, label: t.themeDark },
                ]}
                value={scheme}
                onChange={setScheme}
              />
            </Elevated>

            <Elevated {...RAISED} radius={RAISED_RADIUS.group} style={styles.groupWrap}>
              <View style={styles.group}>
                <ActionRow glyph="↓" title={t.mBackup} detail={t.mBackupD} onPress={runBackup} />
                <ActionRow glyph="↑" title={t.mRestore} detail={t.mRestoreD} onPress={runRestore} last />
              </View>
            </Elevated>

            {/* The reassurance stays — losing the ledger is the top complaint in
                this category — but as one quiet line, not a boxed card. */}
            <Text style={styles.localNote}>{t.localOnlyBody}</Text>

            <Elevated {...RAISED} radius={RAISED_RADIUS.button}>
              <Button label={t.close} tone="sheet" onPress={onClose} />
            </Elevated>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Sheet>
  );
}

function ActionRow({
  glyph,
  title,
  detail,
  onPress,
  last = false,
}: {
  glyph: string;
  title: string;
  detail: string;
  onPress: () => void;
  last?: boolean;
}) {
  const styles = useStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && styles.pressed]}>
      <View style={styles.rowIcon}>
        <Text style={styles.rowGlyph}>{glyph}</Text>
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    modal: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: c.scrim },
    sheet: {
      maxHeight: '86%',
      // ================== TEMPORARY DELIVERY PROOF ==================
      // Deliberately, unmissably wrong. The user reported seeing no change
      // at all after a Fast Refresh push, so this establishes whether code
      // is reaching the device before any more time goes into the shadow.
      // REVERT TO `c.sheet` THE MOMENT IT IS CONFIRMED.
      // ==============================================================
      backgroundColor: '#FF0000',
      borderTopLeftRadius: radius.sheet,
      borderTopRightRadius: radius.sheet,
      paddingHorizontal: layout.screenPadding,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
      // A hairline along the top edge separates the sheet from the screen.
      borderTopWidth: 1,
      borderTopColor: c.edge,
      ...shadows.sheet,
    },
    grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: c.chip, alignSelf: 'center', marginBottom: spacing.xl },
    title: { color: c.ink, fontFamily: font.extrabold, fontSize: type.sheetTitle, letterSpacing: -0.6, marginBottom: 22 },
    caption: { color: c.ink, fontFamily: font.bold, fontSize: type.caption, letterSpacing: 1.2, marginBottom: 10 },
    segmentWrap: { marginBottom: 24 },

    // No overflow:'hidden' here: the rows inside paint no background of
    // their own (the group's fill shows through everywhere already), so
    // nothing needs clipping to the rounded corners. Clipping would also
    // cut off this view's own shadow flush at its border — CSS and iOS's
    // clipsToBounds both do that when a shadow and overflow:hidden sit on
    // the same node — which is exactly the hard-edged look being fixed.
    //
    // No border either: the shadow (and, in dark mode, the raised fill)
    // separates this from the sheet behind it. The line between the two
    // rows inside stays — that divides two rows, it does not outline a box.
    groupWrap: { marginBottom: spacing.sm },
    group: {
      backgroundColor: c.sheetCardRaised,
      borderRadius: radius.xl,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, minHeight: layout.minTapTarget + 20 },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: c.sheetDivider },
    rowIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: c.chip, alignItems: 'center', justifyContent: 'center' },
    rowGlyph: { color: c.ink, fontSize: 18, fontFamily: font.bold },
    rowCopy: { flex: 1 },
    rowTitle: { color: c.ink, fontFamily: font.bold, fontSize: type.body, letterSpacing: -0.17 },
    rowDetail: { color: c.mute, fontFamily: font.regular, fontSize: type.label, marginTop: 2 },
    chevron: { color: c.mute, fontSize: 22, fontFamily: font.regular },

    localNote: {
      color: c.mute,
      fontFamily: font.regular,
      fontSize: type.label,
      lineHeight: 20,
      paddingHorizontal: 4,
      marginBottom: spacing.xl,
    },
    pressed: { opacity: 0.7 },
  });
