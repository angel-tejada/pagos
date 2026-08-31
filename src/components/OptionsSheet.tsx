import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pickRestoreFile, shareBackup } from '../data/files';
import { useData } from '../data/store';
import { useLang } from '../i18n';
import { font, layout, radius, shadows, spacing, type, useStyles, useThemeControl, type Palette } from '../theme';
import { showAlert } from './dialogs';
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
          {/* The horizontal padding lives on the CONTENT, not on the sheet.
              An iOS ScrollView clips to its bounds, so when the sheet carried
              the padding the ScrollView's edges landed exactly on the boxes'
              edges and sliced every shadow off flush — hard vertical lines
              down both sides and hard corners. Full-width scroller + padded
              content gives each shadow `screenPadding` of room inside the
              clip. The mockup gets this for free: its padding is on the
              scrolling element itself, and CSS clips at the padding box. */}
          {/* REVERTED: contentInsetAdjustmentBehavior="never" was tried here as
              a hypothesis for a reported layout jump and made it WORSE. That
              prop drops the automatic top safe-area inset iOS otherwise adds
              to scroll content, but iOS applies the drop lazily — visually on
              the first relayout after mount, not immediately. That matches
              the reported symptom exactly: normal on reload, jumps on the
              first segment tap (any relayout triggers the catch-up), stays
              jumped, resets on close (remount), jumps again on the next tap.
              Root cause of the ORIGINAL "content jumps" report is still open
              — this only ruled out one guess by making the symptom worse in
              a diagnosable way. Do not reintroduce this prop without a
              measured reason. */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.grabber} />
            <Text style={styles.title}>{t.options}</Text>

            <Text style={styles.caption}>{t.language}</Text>
            <View style={styles.segmentWrap}>
              <Segment
                options={[
                  { value: 'es' as const, label: 'Español' },
                  { value: 'en' as const, label: 'English' },
                ]}
                value={lang}
                onChange={setLang}
              />
            </View>

            <Text style={styles.caption}>{t.appearance}</Text>
            <View style={styles.segmentWrap}>
              <Segment
                options={[
                  { value: 'light' as const, label: t.themeLight },
                  { value: 'dark' as const, label: t.themeDark },
                ]}
                value={scheme}
                onChange={setScheme}
              />
            </View>

            <View style={styles.group}>
              <ActionRow glyph="↓" title={t.mBackup} detail={t.mBackupD} onPress={runBackup} />
              <ActionRow glyph="↑" title={t.mRestore} detail={t.mRestoreD} onPress={runRestore} last />
            </View>


            <Button label={t.close} tone="sheet" onPress={onClose} />
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
      backgroundColor: c.sheet,
      borderTopLeftRadius: radius.sheet,
      borderTopRightRadius: radius.sheet,
      paddingTop: spacing.sm,
      // A hairline along the top edge separates the sheet from the screen.
      borderTopWidth: 1,
      borderTopColor: c.edge,
      ...shadows.sheet,
    },
    // Bottom padding is INSIDE the scroller for the same reason as the
    // horizontal padding: an iOS ScrollView clips to its bounds, so with the
    // padding on the sheet the Close button sat flush against the clip and
    // its shadow was cut off in a hard line along the bottom.
    scrollContent: {
      paddingHorizontal: layout.screenPadding,
      paddingBottom: spacing.xl,
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
    // Mockup `.mgrp`: border:1px solid var(--sheetline), radius 16,
    // margin-bottom 20, + the raised shadow. No overflow:'hidden' though —
    // the mockup has it, but on iOS clipsToBounds would clip this view's own
    // shadow (trap 4), and nothing inside needs clipping.
    group: {
      backgroundColor: c.sheetCardRaised,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.sheetDivider,
      marginBottom: spacing.xl,
      ...shadows.raised,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, minHeight: layout.minTapTarget + 20 },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: c.sheetDivider },
    rowIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: c.chip, alignItems: 'center', justifyContent: 'center' },
    rowGlyph: { color: c.ink, fontSize: 18, fontFamily: font.bold },
    rowCopy: { flex: 1 },
    rowTitle: { color: c.ink, fontFamily: font.bold, fontSize: type.body, letterSpacing: -0.17 },
    rowDetail: { color: c.mute, fontFamily: font.regular, fontSize: type.label, marginTop: 2 },
    chevron: { color: c.mute, fontSize: 22, fontFamily: font.regular },

    pressed: { opacity: 0.7 },
  });
