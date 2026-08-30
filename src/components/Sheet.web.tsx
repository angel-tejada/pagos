import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { useOverlayHost } from './overlayHost';

/**
 * Browser preview only.
 *
 * React Native's Modal portals to the document root, so on web it renders as
 * a full-window overlay and escapes the phone frame. This mounts into a host
 * node inside the screen instead, so the frame's overflow and 55px radius
 * clip it and the scrim dims only what is on the screen.
 *
 * Slides up like Modal's animationType="slide", and stays mounted through the
 * exit so the sheet does not vanish before it has left.
 */
export function Sheet({
  visible,
  onClose: _onClose,
  children,
  presentation = 'overlay',
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  presentation?: 'overlay' | 'page';
}) {
  const host = useOverlayHost();
  const [mounted, setMounted] = useState(visible);
  const slide = useRef(new Animated.Value(visible ? 0 : 1)).current;

  useEffect(() => {
    if (visible) setMounted(true);
    const animation = Animated.timing(slide, {
      toValue: visible ? 0 : 1,
      duration: visible ? 300 : 220,
      easing: Easing.bezier(0.32, 0.72, 0, 1),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
    return () => animation.stop();
  }, [visible, slide]);

  if (!mounted || !host) return null;

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [0, 900] });

  return createPortal(
    <Animated.View
      style={[styles.overlay, presentation === 'page' && styles.page, { transform: [{ translateY }] }]}>
      {children}
    </Animated.View>,
    host as Element,
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  // Mirrors iOS pageSheet, which leaves the screen visible behind the top.
  page: { top: 24, borderTopLeftRadius: 12, borderTopRightRadius: 12, overflow: 'hidden' },
});
