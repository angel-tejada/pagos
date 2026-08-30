import { ActionSheetIOS, Alert, Platform } from 'react-native';

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

/**
 * Native path: the real iOS dialogs, unchanged.
 *
 * The browser preview swaps in dialogs.web.tsx, because react-native-web
 * implements Alert as an empty function and has no ActionSheetIOS at all, so
 * these flows are silently inert there. Device behaviour must not change:
 * CLAUDE.md asks for standard native components.
 */
export function showAlert(title: string, message?: string, actions?: DialogAction[]): void {
  Alert.alert(title, message, actions);
}

export function showPrompt(
  title: string,
  message: string | undefined,
  onSubmit: (text: string) => void,
  defaultValue?: string,
): void {
  Alert.prompt(title, message, (text) => onSubmit(text), 'plain-text', defaultValue);
}

export function showActions(config: ActionSheetConfig, onSelect: (index: number) => void): void {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(config, onSelect);
    return;
  }
  Alert.alert(
    config.title ?? '',
    undefined,
    config.options.map((option, index) => ({
      text: option,
      style:
        index === config.cancelButtonIndex
          ? 'cancel'
          : index === config.destructiveButtonIndex
            ? 'destructive'
            : 'default',
      onPress: () => onSelect(index),
    })),
  );
}

/** Nothing to mount on native; the OS presents these itself. */
export function DialogHost(): null {
  return null;
}
