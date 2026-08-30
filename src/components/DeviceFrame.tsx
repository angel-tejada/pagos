import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { font, useColors } from '../theme';
import { DialogHost } from './dialogs';
import { OverlayHostContext } from './overlayHost';

/**
 * Browser-only iPhone 16 Pro frame.
 *
 * A React wrapper rather than a custom HTML shell on purpose: `app/+html.tsx`
 * is only honoured when `web.output` is "static", and this project is a
 * default SPA, so that file was silently ignored. Switching `web.output`
 * would edit the Expo config, which is an iOS fingerprint input and would cut
 * the installed build off from over-the-air updates.
 *
 * Measurements are the attached frame's: 402x874 screen at 55px radius inside
 * a 12px bezel at 67px, a 125x37 island 11px down, and a 139x5 home indicator
 * 8px up. The app gets its own content area between the status bar and the
 * home indicator so chrome and content never contend for the same pixels.
 */
const SCREEN_W = 402;
const SCREEN_H = 874;
const BEZEL = 12;
const SCREEN_R = 55;
const DEVICE_R = SCREEN_R + BEZEL; // 67
const DEVICE_W = SCREEN_W + BEZEL * 2; // 426
const DEVICE_H = SCREEN_H + BEZEL * 2; // 898
const MARGIN = 32;

const STATUS_H = 62;
const ISLAND_W = 125;
const ISLAND_H = 37;
const ISLAND_TOP = 11;
const HOME_W = 139;
const HOME_H = 5;
const HOME_BOTTOM = 8;
/** Matches the frame's `.content` bottom: home inset plus its own clearance. */
const CONTENT_BOTTOM = HOME_BOTTOM + HOME_H + 8; // 21

export function DeviceFrame({ children }: { children: ReactNode }) {
  const c = useColors();
  const [overlayHost, setOverlayHost] = useState<unknown>(null);
  const { width, height } = useWindowDimensions();

  useEffect(injectFocusRingStyle, []);

  // Shrink to fit the window; never blow the frame up past life size.
  const scale = Math.min(1, (width - MARGIN) / DEVICE_W, (height - MARGIN) / DEVICE_H);

  return (
    <View style={styles.page}>
      <View style={[styles.device, { transform: [{ scale }] }]}>
        <View style={[styles.screen, { backgroundColor: c.bg }]}>
          <OverlayHostContext.Provider value={overlayHost}>
            {/* The app lives between the status bar and the home indicator. */}
            <View style={styles.content}>{children}</View>

            {/* Sheets mount here, so the screen's overflow and radius clip
                them. Below the chrome: on a real phone the island and home
                indicator sit above everything. */}
            <View ref={(node) => setOverlayHost(node)} style={styles.overlayHost} />
            {/* Above sheets: an alert raised from inside a sheet must sit
                on top of it. */}
            <View style={styles.dialogHost}>
              <DialogHost />
            </View>
          </OverlayHostContext.Provider>

          <StatusBar color={c.ink} />
          <View style={styles.island} />
          <View style={[styles.home, { backgroundColor: c.ink }]} />
        </View>
      </View>
    </View>
  );
}

/**
 * Status chrome. The glyphs take the theme's foreground colour, so they are
 * black on light and white on dark. Icons are the attached frame's SVGs; this
 * file only ever renders on web, so DOM elements are safe here.
 */
function StatusBar({ color }: { color: string }) {
  const [now, setNow] = useState(() => clockLabel());

  useEffect(() => {
    const id = setInterval(() => setNow(clockLabel()), 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.statusBar}>
      <View style={styles.statusLeft}>
        <Text style={[styles.time, { color }]}>{now}</Text>
      </View>
      <View style={styles.statusRight}>
        <svg width="18" height="12" viewBox="0 0 18 12" style={{ display: 'block', color }}>
          <rect x="0" y="7.5" width="3" height="4.5" rx="1.1" fill="currentColor" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1.1" fill="currentColor" />
          <rect x="10" y="3.2" width="3" height="8.8" rx="1.1" fill="currentColor" />
          <rect x="15" y="0.8" width="3" height="11.2" rx="1.1" fill="currentColor" />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" style={{ display: 'block', color }}>
          <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <path d="M1.33 5.98 A8.75 8.75 0 0 1 15.67 5.98" />
            <path d="M4.12 7.93 A5.35 5.35 0 0 1 12.88 7.93" />
          </g>
          <circle cx="8.5" cy="10.3" r="1.6" fill="currentColor" />
        </svg>
        <svg width="26.5" height="13" viewBox="0 0 26.5 13" style={{ display: 'block', color }}>
          <rect
            x="0.5"
            y="0.5"
            width="24"
            height="12"
            rx="3.9"
            fill="none"
            stroke="currentColor"
            strokeOpacity=".35"
            strokeWidth="1"
          />
          <path d="M25.4 4.6 a2.3 2.3 0 0 1 0 3.8 z" fill="currentColor" fillOpacity=".4" />
          <rect x="2" y="2" width="18" height="9" rx="2.5" fill="currentColor" />
        </svg>
      </View>
    </View>
  );
}

function clockLabel(): string {
  const date = new Date();
  const hour = date.getHours() % 12 || 12;
  return `${hour}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * Every RNW Pressable that can take focus renders as a plain
 * `<div tabindex="0">` (regardless of accessibilityRole), which is why the
 * gear button showed the browser's default focus rectangle rather than
 * anything themed. This swaps that default for a visible ring that only
 * appears for keyboard navigation (:focus-visible), never for a mouse or
 * touch tap, and leaves real inputs (TextInput) alone.
 */
const FOCUS_RING_STYLE_ID = 'pagos-focus-ring';

function injectFocusRingStyle(): void {
  if (typeof document === 'undefined' || document.getElementById(FOCUS_RING_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = FOCUS_RING_STYLE_ID;
  style.textContent = `
    div[tabindex]:focus { outline: none; }
    div[tabindex]:focus-visible {
      outline: 2px solid #0A84FF;
      outline-offset: 2px;
      border-radius: 8px;
    }
  `;
  document.head.appendChild(style);
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
  content: {
    position: 'absolute',
    top: STATUS_H,
    bottom: CONTENT_BOTTOM,
    left: 0,
    right: 0,
  },

  overlayHost: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    pointerEvents: 'box-none',
  },

  dialogHost: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 6,
    pointerEvents: 'box-none',
  },

  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: STATUS_H,
    zIndex: 7,
    pointerEvents: 'none',
  },
  statusLeft: {
    position: 'absolute',
    top: ISLAND_TOP,
    left: 0,
    // Optically centred in the gap beside the island.
    width: (SCREEN_W - ISLAND_W) / 2,
    height: ISLAND_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontFamily: font.semibold,
    fontSize: 17,
    letterSpacing: 0.1,
    lineHeight: 17,
    fontVariant: ['tabular-nums'],
  },
  statusRight: {
    position: 'absolute',
    top: ISLAND_TOP,
    right: 21,
    height: ISLAND_H,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  island: {
    position: 'absolute',
    top: ISLAND_TOP,
    left: (SCREEN_W - ISLAND_W) / 2,
    width: ISLAND_W,
    height: ISLAND_H,
    borderRadius: ISLAND_H / 2,
    backgroundColor: '#000000',
    zIndex: 8,
    pointerEvents: 'none',
  },
  home: {
    position: 'absolute',
    bottom: HOME_BOTTOM,
    left: (SCREEN_W - HOME_W) / 2,
    width: HOME_W,
    height: HOME_H,
    borderRadius: HOME_H / 2,
    opacity: 0.85,
    zIndex: 8,
    pointerEvents: 'none',
  },
});
