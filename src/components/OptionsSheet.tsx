import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pickRestoreFile, shareBackup } from '../data/files';
import { useData } from '../data/store';
import { useLang } from '../i18n';
import { radius, spacing, type, useStyles, type Palette } from '../theme';
import { Button } from './ui';

export function OptionsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const styles = useStyles(makeStyles);
  const { t, lang, setLang } = useLang();
  const { data, restoreData, markBackupComplete } = useData();

  const runBackup = () => {
    void shareBackup(data)
      .then(markBackupComplete)
      .catch(() => Alert.alert(t.backupFailed));
  };

  const runRestore = () => {
    void pickRestoreFile()
      .then((restored) => {
        if (!restored) return;
        Alert.alert(t.mRestore, t.restoreConfirm, [
          { text: t.cancel, style: 'cancel' },
          {
            text: t.confirm,
            style: 'destructive',
            onPress: () => {
              restoreData(restored);
              onClose();
              Alert.alert(t.restored);
            },
          },
        ]);
      })
      .catch(() => Alert.alert(t.restoreFailed));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.modal}>
        <Pressable accessibilityLabel={t.close} style={styles.backdrop} onPress={onClose} />
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.grabber} />
          <Text style={styles.title}>{t.options}</Text>

          <Text style={styles.label}>{t.language}</Text>
          <View style={styles.segment}>
            <LanguageButton label="Español" active={lang === 'es'} onPress={() => setLang('es')} />
            <LanguageButton label="English" active={lang === 'en'} onPress={() => setLang('en')} />
          </View>

          <View style={styles.actions}>
            <ActionRow glyph="↓" title={t.mBackup} detail={t.mBackupD} onPress={runBackup} />
            <ActionRow glyph="↑" title={t.mRestore} detail={t.mRestoreD} onPress={runRestore} last />
          </View>

          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>{t.localOnlyTitle}</Text>
            <Text style={styles.noticeBody}>{t.localOnlyBody}</Text>
          </View>

          <Button label={t.close} tone="secondary" onPress={onClose} />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function LanguageButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const styles = useStyles(makeStyles);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.langButton, active && styles.langButtonActive, pressed && styles.pressed]}>
      <Text style={[styles.langText, active && styles.langTextActive]}>{label}</Text>
    </Pressable>
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
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionRow, !last && styles.actionBorder, pressed && styles.pressed]}>
      <View style={styles.actionIcon}><Text style={styles.actionGlyph}>{glyph}</Text></View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDetail}>{detail}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const makeStyles = (c: Palette) => StyleSheet.create({
  modal: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: c.overlay },
  sheet: { backgroundColor: c.bgRaised, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md, borderWidth: 1, borderColor: c.borderSoft },
  grabber: { width: 40, height: 5, borderRadius: radius.pill, backgroundColor: c.border, alignSelf: 'center', marginBottom: spacing.lg },
  title: { color: c.text, fontSize: type.title, fontWeight: '800', marginBottom: spacing.xl },
  label: { color: c.textSecondary, fontSize: type.caption, fontWeight: '800', letterSpacing: 1.15, textTransform: 'uppercase', marginBottom: spacing.xs },
  segment: { flexDirection: 'row', backgroundColor: c.surface, borderRadius: radius.md, padding: 4, gap: 4, marginBottom: spacing.lg },
  langButton: { flex: 1, minHeight: 48, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  langButtonActive: { backgroundColor: c.accent },
  langText: { color: c.textSecondary, fontSize: type.body, fontWeight: '700' },
  langTextActive: { color: c.accentInk, fontWeight: '800' },
  actions: { backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.borderSoft, overflow: 'hidden', marginBottom: spacing.md },
  actionRow: { minHeight: 74, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, gap: spacing.sm },
  actionBorder: { borderBottomWidth: 1, borderBottomColor: c.borderSoft },
  actionIcon: { width: 38, height: 38, borderRadius: radius.sm, backgroundColor: c.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  actionGlyph: { color: c.accent, fontSize: 20, fontWeight: '800' },
  actionCopy: { flex: 1 },
  actionTitle: { color: c.text, fontSize: type.body, fontWeight: '700', marginBottom: 2 },
  actionDetail: { color: c.textMuted, fontSize: type.caption, lineHeight: 17 },
  chevron: { color: c.textMuted, fontSize: 25 },
  notice: { backgroundColor: c.accentSoft, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: c.borderSoft },
  noticeTitle: { color: c.accent, fontSize: type.label, fontWeight: '800', marginBottom: 3 },
  noticeBody: { color: c.textSecondary, fontSize: type.caption, lineHeight: 17 },
  pressed: { opacity: 0.72 },
});
