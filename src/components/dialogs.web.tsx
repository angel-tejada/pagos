import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useLang } from '../i18n';
import { font, layout, radius, shadows, type, useColors, useStyles, type Palette } from '../theme';

export type DialogAction = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

export type ActionSheetConfig = {
  title?: string;
  options: string[];
  cancelButtonIndex: number;
  destructiveButtonIndex?: number;
};

type Request =
  | { kind: 'alert'; title: string; message?: string; actions: DialogAction[] }
  | { kind: 'prompt'; title: string; message?: string; defaultValue: string; onSubmit: (text: string) => void }
  | { kind: 'actions'; config: ActionSheetConfig; onSelect: (index: number) => void };

/**
 * Browser preview only.
 *
 * react-native-web ships `Alert.alert` as an empty function and has no
 * ActionSheetIOS, so the ..., delete, rename and limit flows do nothing in a
 * browser. These render inside the phone frame instead, themed like the app.
 * Native is untouched and keeps using the real OS dialogs.
 */
let present: ((request: Request) => void) | null = null;

function queue(request: Request): void {
  if (present) present(request);
}

export function showAlert(title: string, message?: string, actions?: DialogAction[]): void {
  queue({ kind: 'alert', title, message, actions: actions ?? [] });
}

export function showPrompt(
  title: string,
  message: string | undefined,
  onSubmit: (text: string) => void,
  defaultValue?: string,
): void {
  queue({ kind: 'prompt', title, message, defaultValue: defaultValue ?? '', onSubmit });
}

export function showActions(config: ActionSheetConfig, onSelect: (index: number) => void): void {
  queue({ kind: 'actions', config, onSelect });
}

export function DialogHost() {
  const styles = useStyles(makeStyles);
  const c = useColors();
  const { t } = useLang();
  const [request, setRequest] = useState<Request | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    present = (next) => {
      if (next.kind === 'prompt') setDraft(next.defaultValue);
      setRequest(next);
    };
    return () => {
      present = null;
    };
  }, []);

  if (!request) return null;

  const dismiss = () => setRequest(null);

  const runAction = (action: DialogAction) => {
    dismiss();
    action.onPress?.();
  };

  if (request.kind === 'actions') {
    const { config, onSelect } = request;
    return (
      <View style={styles.host}>
        <Pressable style={styles.scrim} onPress={dismiss} />
        <View style={styles.actionsWrap}>
          <View style={styles.actionGroup}>
            {config.title ? (
              <View style={styles.actionTitleRow}>
                <Text style={styles.actionTitle}>{config.title}</Text>
              </View>
            ) : null}
            {config.options.map((option, index) =>
              index === config.cancelButtonIndex ? null : (
                <Pressable
                  key={option}
                  onPress={() => {
                    dismiss();
                    onSelect(index);
                  }}
                  style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}>
                  <Text
                    style={[
                      styles.actionText,
                      index === config.destructiveButtonIndex && styles.destructiveText,
                    ]}>
                    {option}
                  </Text>
                </Pressable>
              ),
            )}
          </View>
          <Pressable
            onPress={() => {
              dismiss();
              onSelect(config.cancelButtonIndex);
            }}
            style={({ pressed }) => [styles.cancelRow, pressed && styles.pressed]}>
            <Text style={styles.cancelText}>{config.options[config.cancelButtonIndex]}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isPrompt = request.kind === 'prompt';
  const fallback: DialogAction[] = [{ text: t.close }];
  const actions: DialogAction[] = isPrompt
    ? [
        { text: t.cancel, style: 'cancel' },
        { text: t.confirm, onPress: () => request.onSubmit(draft) },
      ]
    : request.actions.length
      ? request.actions
      : fallback;

  return (
    <View style={styles.host}>
      <Pressable style={styles.scrim} onPress={dismiss} />
      <View style={styles.alertCard}>
        <Text style={styles.alertTitle}>{request.title}</Text>
        {request.message ? <Text style={styles.alertMessage}>{request.message}</Text> : null}
        {isPrompt ? (
          <TextInput
            autoFocus
            value={draft}
            onChangeText={setDraft}
            selectionColor={c.ink}
            style={styles.input}
          />
        ) : null}
        <View style={styles.alertActions}>
          {actions.map((action) => (
            <Pressable
              key={action.text}
              onPress={() => runAction(action)}
              style={({ pressed }) => [styles.alertButton, pressed && styles.pressed]}>
              <Text
                style={[
                  styles.alertButtonText,
                  action.style === 'destructive' && styles.destructiveText,
                  action.style === 'cancel' && styles.cancelButtonText,
                ]}>
                {action.text}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    host: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
    scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.scrim },

    alertCard: {
      width: 300,
      backgroundColor: c.sheetCard,
      borderWidth: 1,
      borderColor: c.sheetLine,
      borderRadius: radius.xl,
      paddingTop: 20,
      paddingHorizontal: 20,
      ...shadows.raised,
    },
    alertTitle: { color: c.ink, fontFamily: font.bold, fontSize: type.body, textAlign: 'center', letterSpacing: -0.17 },
    alertMessage: {
      color: c.mute,
      fontFamily: font.regular,
      fontSize: type.label,
      lineHeight: 20,
      textAlign: 'center',
      marginTop: 8,
    },
    input: {
      height: 44,
      marginTop: 14,
      borderWidth: 1,
      borderColor: c.sheetLine,
      borderRadius: radius.sm,
      backgroundColor: c.sheet,
      paddingHorizontal: 12,
      color: c.ink,
      fontFamily: font.medium,
      fontSize: type.body,
    },
    alertActions: { flexDirection: 'row', marginTop: 18, marginHorizontal: -20, borderTopWidth: 1, borderTopColor: c.sheetDivider },
    alertButton: { flex: 1, minHeight: layout.minTapTarget + 4, alignItems: 'center', justifyContent: 'center' },
    alertButtonText: { color: c.ink, fontFamily: font.bold, fontSize: type.body },
    cancelButtonText: { fontFamily: font.regular },
    destructiveText: { color: c.red },

    actionsWrap: { position: 'absolute', left: 8, right: 8, bottom: 8, gap: 8 },
    actionGroup: {
      backgroundColor: c.sheetCard,
      borderWidth: 1,
      borderColor: c.sheetLine,
      borderRadius: radius.lg,
      overflow: 'hidden',
      ...shadows.raised,
    },
    actionTitleRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.sheetDivider },
    actionTitle: { color: c.mute, fontFamily: font.semibold, fontSize: type.label, textAlign: 'center' },
    actionRow: {
      minHeight: layout.minTapTarget + 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 1,
      borderBottomColor: c.sheetDivider,
    },
    actionText: { color: c.ink, fontFamily: font.semibold, fontSize: type.bodyLarge },
    cancelRow: {
      minHeight: layout.minTapTarget + 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.sheetCard,
      borderWidth: 1,
      borderColor: c.sheetLine,
      borderRadius: radius.lg,
      ...shadows.raised,
    },
    cancelText: { color: c.ink, fontFamily: font.bold, fontSize: type.bodyLarge },
    pressed: { opacity: 0.7 },
  });
