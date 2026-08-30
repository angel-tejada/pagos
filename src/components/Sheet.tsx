import type { ReactNode } from 'react';
import { Modal } from 'react-native';

/**
 * Native: a real Modal, which is the correct presentation on a device.
 * The browser preview uses Sheet.web.tsx instead, because Modal portals to
 * the document root and escapes the phone frame.
 */
export function Sheet({
  visible,
  onClose,
  children,
  presentation = 'overlay',
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** 'page' is a full-height sheet; 'overlay' floats over a scrim. */
  presentation?: 'overlay' | 'page';
}) {
  if (presentation === 'page') {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
        {children}
      </Modal>
    );
  }
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      {children}
    </Modal>
  );
}
