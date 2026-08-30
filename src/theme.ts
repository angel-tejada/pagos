/**
 * Pagos is monochrome. Black, white and greys carry the whole interface.
 *
 * Green and red are the ONLY colour in the app and they mean exactly one
 * thing: direction. Green = they borrowed (balance up). Red = they paid you
 * back (balance down). Nothing else may use them, and controls never do.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Palette = {
  bg: string;
  bgRaised: string;
  surface: string;
  surfaceRaised: string;
  surfacePressed: string;
  border: string;
  borderSoft: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  /** Controls. Monochrome: a solid black (light) or white (dark) fill. */
  accent: string;
  accentPressed: string;
  accentSoft: string;
  /** Text/glyph colour on top of an accent fill. */
  accentInk: string;
  /** Direction: they borrowed. The only green in the app. */
  up: string;
  upSoft: string;
  upInk: string;
  /** Direction: they paid you back. The only red in the app. */
  down: string;
  downSoft: string;
  downInk: string;
  overlay: string;
  card: string;
  line: string;
  /** Chrome behind the fixed bottom action bars. */
  bar: string;
  /** Circular "•••" affordance on list cards. */
  chip: string;
  chipInk: string;
  /** Sheet rows presented over a dimmed backdrop. */
  sheetRow: string;
  sheetRowBorder: string;
  sheetCancel: string;
  /** Switch track when off. */
  switchOff: string;
  /** Large decorative empty-state glyph. */
  emptyMark: string;
  /** Person silhouette avatar. */
  avatarBg: string;
  avatarInk: string;
  /** Empty-state copy. */
  emptyTitle: string;
  emptyBody: string;
};

/**
 * Default. Dark-on-light is easier for the 50s-60s eyes we build for, but pure
 * white reads as a flashlight, so the ground is a warm off-white. Control edges
 * clear 3:1 against it, since the fill alone only manages 1.11:1.
 */
export const lightColors: Palette = {
  bg: '#F7F6F3',
  bgRaised: '#FCFBF8',
  surface: '#ECEAE4',
  surfaceRaised: '#E1DED6',
  surfacePressed: '#D6D2C8',
  border: '#8C8474',
  borderSoft: '#CFCABF',
  text: '#1A1916',
  textSecondary: '#4C4A43',
  textMuted: '#615E57',
  accent: '#1A1916',
  accentPressed: '#3A3830',
  accentSoft: '#E6E3DA',
  accentInk: '#FBFAF7',
  up: '#177034',
  upSoft: '#E2EEE5',
  upInk: '#FFFFFF',
  down: '#B3261E',
  downSoft: '#F6E7E4',
  downInk: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.32)',
  card: '#ECEAE4',
  line: '#8C8474',
  bar: '#F0EEE8',
  chip: '#D6D2C8',
  chipInk: '#3A3830',
  sheetRow: '#FCFBF8',
  sheetRowBorder: '#CFCABF',
  sheetCancel: '#E1DED6',
  switchOff: '#8C8474',
  emptyMark: '#D6D2C8',
  avatarBg: '#D6D2C8',
  avatarInk: '#FBFAF7',
  emptyTitle: '#857F72',
  emptyBody: '#615E57',
};

export const darkColors: Palette = {
  bg: '#000000',
  bgRaised: '#101012',
  surface: '#1A1A1C',
  surfaceRaised: '#232326',
  surfacePressed: '#2C2C30',
  border: '#6E6E77',
  borderSoft: '#3A3A3E',
  text: '#FFFFFF',
  textSecondary: '#A0A0A6',
  textMuted: '#8A8A90',
  accent: '#FFFFFF',
  accentPressed: '#D8D8DC',
  accentSoft: '#1F1F22',
  accentInk: '#000000',
  up: '#30D158',
  upSoft: '#10301A',
  upInk: '#000000',
  down: '#FF453A',
  downSoft: '#33120F',
  downInk: '#000000',
  overlay: 'rgba(0, 0, 0, 0.68)',
  card: '#1A1A1C',
  line: '#3A3A3E',
  bar: '#101012',
  chip: '#3A3A3E',
  chipInk: '#D8D8DC',
  sheetRow: '#232326',
  sheetRowBorder: '#3A3A3E',
  sheetCancel: '#2C2C30',
  switchOff: '#3A3A3E',
  emptyMark: '#2C2C30',
  avatarBg: '#2C2C30',
  avatarInk: '#101012',
  emptyTitle: '#55555A',
  emptyBody: '#8A8A90',
};

export type ThemeName = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'pagos_theme_v1';
/** Light unless the user says otherwise. Not the system setting. */
export const DEFAULT_THEME: ThemeName = 'light';

const ThemeContext = createContext<Palette | null>(null);
export const ThemeContextProvider = ThemeContext.Provider;

type ThemeControl = { scheme: ThemeName; setScheme: (next: ThemeName) => void };
const ThemeControlContext = createContext<ThemeControl | null>(null);
export const ThemeControlProvider = ThemeControlContext.Provider;

/**
 * Owns the chosen theme and remembers it. The device setting is deliberately
 * NOT consulted: the user picks light or dark in Options and it sticks.
 */
export function useThemePreference(): ThemeControl & { palette: Palette } {
  const [scheme, setSchemeState] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark') setSchemeState(saved);
      })
      .catch(() => undefined);
  }, []);

  const setScheme = useCallback((next: ThemeName) => {
    setSchemeState(next);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => undefined);
  }, []);

  return useMemo(
    () => ({ scheme, setScheme, palette: scheme === 'dark' ? darkColors : lightColors }),
    [scheme, setScheme],
  );
}

export function useThemeControl(): ThemeControl {
  const value = useContext(ThemeControlContext);
  if (!value) throw new Error('useThemeControl must be used inside <ThemeControlProvider>');
  return value;
}

/**
 * Green when they owe you more, red when they have paid you back, muted at
 * zero — zero is the app's happy moment, not an alarm.
 *
 * Colour is never the only signal: history rows also carry the word
 * (Prestado / Pagado) and a + or - sign.
 */
export function balanceColor(cents: number, c: Palette): string {
  if (cents > 0) return c.up;
  if (cents < 0) return c.down;
  return c.textSecondary;
}

export function useColors(): Palette {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useColors must be used inside <ThemeProvider>');
  return value;
}

/**
 * Builds a StyleSheet from the active palette. `factory` must be defined at
 * module scope so the memo key stays stable across renders.
 */
export function useStyles<T>(factory: (c: Palette) => T): T {
  const colors = useColors();
  return useMemo(() => factory(colors), [colors, factory]);
}

/* Density: the whole scale sits about 15% tighter than the first pass.
 * Tap targets stay at or above 44px regardless — see `layout`. */

export const spacing = { xxs: 4, xs: 7, sm: 10, md: 14, lg: 17, xl: 20, xxl: 27, xxxl: 34 } as const;

export const radius = {
  sm: 8,
  md: 11,
  lg: 12,
  xl: 18,
  pill: 999,
  card: 12,
  button: 12,
  key: 11,
} as const;

export const type = {
  caption: 11,
  label: 12,
  body: 15,
  bodyLarge: 17,
  title: 19,
  screenTitle: 18,
  amount: 27,
  heroAmount: 54,
  inputAmount: 26,
} as const;

export const size = {
  body: type.body,
  small: type.label,
  tiny: type.caption,
  name: type.body,
  title: type.bodyLarge,
  cardAmount: type.amount,
  heroAmount: type.heroAmount,
  totalAmount: type.amount,
  padAmount: type.inputAmount,
  key: 22,
} as const;

/** WCAG AAA floor is 44x44; older hands want more. Nothing here goes below 44. */
export const layout = {
  screenPadding: 19,
  controlHeight: 58,
  buttonHeight: 54,
  bottomBarHeight: 52,
  minTapTarget: 44,
} as const;

export const shadows = {
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
