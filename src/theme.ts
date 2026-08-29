/** Shared measurements taken from the supplied iPhone UI references. */
import { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

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
  accent: string;
  accentPressed: string;
  accentSoft: string;
  up: string;
  upStrong: string;
  upSoft: string;
  upInk: string;
  down: string;
  downSoft: string;
  downInk: string;
  overlay: string;
  white08: string;
  white12: string;
  card: string;
  card2: string;
  line: string;
  dim: string;
  /** Chrome that sits behind the fixed bottom action bars. */
  bar: string;
  /** Circular "•••" affordance on list cards. */
  chip: string;
  chipInk: string;
  /** Sheet rows presented over a dimmed backdrop. */
  sheetRow: string;
  sheetRowBorder: string;
  sheetCancel: string;
  /** Neutral mark used for the "paid" direction in history rows. */
  neutralMark: string;
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

export const darkColors: Palette = {
  bg: '#000000',
  bgRaised: '#111111',
  surface: '#1C1C1E',
  surfaceRaised: '#242426',
  surfacePressed: '#2C2C2E',
  border: '#3A3A3C',
  borderSoft: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#98989D',
  textMuted: '#5E5E63',
  accent: '#FF375F',
  accentPressed: '#E72F55',
  accentSoft: '#3A111D',
  up: '#FF375F',
  upStrong: '#FF375F',
  upSoft: '#3A111D',
  upInk: '#000000',
  down: '#FF6670',
  downSoft: '#3A171B',
  downInk: '#000000',
  overlay: 'rgba(0, 0, 0, 0.68)',
  white08: 'rgba(255, 255, 255, 0.08)',
  white12: 'rgba(255, 255, 255, 0.12)',
  card: '#1C1C1E',
  card2: '#242426',
  line: '#3A3A3C',
  dim: '#98989D',
  bar: '#141414',
  chip: '#48484C',
  chipInk: '#D3D3D6',
  sheetRow: '#242426',
  sheetRowBorder: '#4A4A4D',
  sheetCancel: '#303033',
  neutralMark: '#404043',
  switchOff: '#3A3A40',
  emptyMark: '#303034',
  avatarBg: '#343438',
  avatarInk: '#1D1D1F',
  emptyTitle: '#4D4D50',
  emptyBody: '#5F5F63',
};

/**
 * Light palette. The target user is in their 50s or 60s, and dark-on-light is
 * easier for aging eyes, so this is a first-class theme rather than an
 * afterthought. Text and accent are darkened against white to hold contrast.
 */
export const lightColors: Palette = {
  bg: '#FFFFFF',
  bgRaised: '#F7F7F9',
  surface: '#F1F1F4',
  surfaceRaised: '#E7E7EB',
  surfacePressed: '#DCDCE2',
  border: '#C9C9CE',
  borderSoft: '#DCDCE2',
  text: '#000000',
  textSecondary: '#55555C',
  textMuted: '#77777E',
  accent: '#C8102E',
  accentPressed: '#A50D26',
  accentSoft: '#FBE7EB',
  up: '#C8102E',
  upStrong: '#C8102E',
  upSoft: '#FBE7EB',
  upInk: '#FFFFFF',
  down: '#B3202B',
  downSoft: '#FBE9EA',
  downInk: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.32)',
  white08: 'rgba(0, 0, 0, 0.05)',
  white12: 'rgba(0, 0, 0, 0.09)',
  card: '#F1F1F4',
  card2: '#E7E7EB',
  line: '#C9C9CE',
  dim: '#55555C',
  bar: '#F4F4F6',
  chip: '#C9C9CE',
  chipInk: '#3A3A40',
  sheetRow: '#FFFFFF',
  sheetRowBorder: '#D6D6DB',
  sheetCancel: '#E7E7EB',
  neutralMark: '#C9C9CE',
  switchOff: '#C9C9CE',
  emptyMark: '#D2D2D8',
  avatarBg: '#D2D2D8',
  avatarInk: '#FFFFFF',
  emptyTitle: '#8A8A90',
  emptyBody: '#77777E',
};

export type ThemeName = 'light' | 'dark';

const ThemeContext = createContext<Palette | null>(null);

export const ThemeContextProvider = ThemeContext.Provider;

/** Resolves the palette from the device setting. */
export function useResolvedPalette(): { palette: Palette; scheme: ThemeName } {
  const scheme = useColorScheme() === 'light' ? 'light' : 'dark';
  return useMemo(
    () => ({ palette: scheme === 'light' ? lightColors : darkColors, scheme }),
    [scheme],
  );
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

export const spacing = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 23, xxl: 32, xxxl: 40 } as const;

export const radius = {
  sm: 9,
  md: 13,
  lg: 14,
  xl: 20,
  pill: 999,
  card: 14,
  button: 14,
  key: 13,
} as const;

export const type = {
  caption: 12,
  label: 14,
  body: 17,
  bodyLarge: 20,
  title: 22,
  screenTitle: 21,
  amount: 32,
  heroAmount: 64,
  inputAmount: 30,
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
  key: 26,
} as const;

export const layout = {
  screenPadding: 22,
  controlHeight: 68,
  buttonHeight: 64,
  bottomBarHeight: 58,
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
