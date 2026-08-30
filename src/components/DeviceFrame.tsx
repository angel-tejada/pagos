import type { ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { useColors } from '../theme';

/**
 * Browser-only iPhone 16 Pro frame.
 *
 * This is a React wrapper rather than a custom HTML shell on purpose:
 * `app/+html.tsx` is only honoured when `web.output` is "static", and this
 * project is a default SPA ("single"), so that file was silently ignored.
 * Switching `web.output` would edit the Expo config, which is an iOS
 * fingerprint input and would break over-the-air updates for the installed
 * build. Framing in JS keeps the native fingerprint untouched.
 */
const SCREEN_W = 402;
const SCREEN_H = 874;
const BEZEL = 12;
const SCREEN_R = 55;
const DEVICE_R = SCREEN_R + BEZEL; // 67
const DEVICE_W = SCREEN_W + BEZEL * 2; // 426
const DEVICE_H = SCREEN_H + BEZEL * 2; // 898
const MARGIN = 32;

export function DeviceFrame({ children }: { children: ReactNode }) {
  const c = useColors();
  const { width, height } = useWindowDimensions();

  // Shrink to fit the window; never blow the frame up past life size.
  const scale = Math.min(1, (width - MARGIN) / DEVICE_W, (height - MARGIN) / DEVICE_H);

  return (
    <View style={styles.page}>
      <View style={[styles.device, { transform: [{ scale }] }]}>
        <View style={[styles.screen, { backgroundColor: c.bg }]}>
          {children}
          {/* Chrome floats over the app and never swallows a tap. */}
          <View pointerEvents="none" style={styles.island} />
          <View pointerEvents="none" style={[styles.home, { backgroundColor: c.ink }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCDCDF',
    overflow: 'hidden',
  },
  device: {
    width: DEVICE_W,
    height: DEVICE_H,
    padding: BEZEL,
    borderRadius: DEVICE_R,
    backgroundColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.45,
    shadowRadius: 60,
  },
  screen: {
    width: SCREEN_W,
    height: SCREEN_H,
    borderRadius: SCREEN_R,
    overflow: 'hidden',
    position: 'relative',
  },
  island: {
    position: 'absolute',
    top: 11,
    alignSelf: 'center',
    width: 125,
    height: 37,
    borderRadius: 18.5,
    backgroundColor: '#000000',
  },
  home: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    width: 139,
    height: 5,
    borderRadius: 2.5,
    opacity: 0.85,
  },
});
