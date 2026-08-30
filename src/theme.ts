/**
 * Pagos is monochrome with a single accent: red.
 *
 * Red means one thing only — money outstanding. The home total, a person's
 * card amount, their balance, and the Borrowed action. Nothing else.
 *
 * There is no green anywhere. Payment history is fully neutral: direction is
 * carried by the + / - sign and the words Prestado / Pagado, never by colour,
 * so the ledger reads correctly for colour-blind users.
 *
 * Values come from the approved mockup (pagos-current.html).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Palette = {
  /** App ground. */
  bg: string;
  /** Cards, fields and other raised surfaces on the app ground. */
  card: string;
  /** Hairlines on cards and fields. */
  line: string;
  /** Foreground: primary text, and the fill for neutral solid buttons. */
  ink: string;
  /** Text/glyph colour on top of an `ink` fill. */
  inkOn: string;
  /** Secondary text. */
  mute: string;
  /** The only accent. Money outstanding. */
  red: string;
  /** Text on top of a red fill. Kept legible per theme. */
  redOn: string;
  /** Switch track when off. */
  track: string;

  /* Dark mode builds elevation out of lightness, not shadow: shadows are
   * invisible on black, so each layer forward is lighter than the last. */
  /** Options sheet, one layer in front of the screen. */
  sheet: string;
  /** Cards inside the sheet, one layer in front of the sheet. */
  sheetCard: string;
  /** Hairlines inside the sheet. */
  sheetLine: string;
  /** Hairline along the sheet's top edge. */
  edge: string;
  /** Scrim behind the sheet, so the screen behind clearly recedes. */
  scrim: string;

  /** Circular affordances: the card overflow dot and history row chips. */
  chip: string;
  chipInk: string;
  /** Person silhouette avatar. */
  avatarBg: string;
  avatarInk: string;
  /** Large decorative empty-state glyph. */
  emptyMark: string;
};

export const lightColors: Palette = {
  bg: '#F7F6F3',
  card: '#EFEEEA',
  line: '#DCDAD4',
  ink: '#000000',
  inkOn: '#F7F6F3',
  mute: '#6E6C66',
  red: '#B4322A',
  redOn: '#FFFFFF',
  track: '#E6E4DE',
  sheet: '#F7F6F3',
  sheetCard: '#EFEEEA',
  sheetLine: '#DCDAD4',
  edge: 'rgba(0,0,0,.06)',
  scrim: 'rgba(0,0,0,.35)',
  chip: '#DCDAD4',
  chipInk: '#6E6C66',
  avatarBg: '#DCDAD4',
  avatarInk: '#F7F6F3',
  emptyMark: '#DCDAD4',
};

export const darkColors: Palette = {
  bg: '#000000',
  card: '#1C1C1E',
  line: '#3A3A3C',
  ink: '#FFFFFF',
  inkOn: '#000000',
  mute: '#C9C9CE',
  red: '#FF453A',
  /* The mockup puts white on the red fill. At 3.41:1 that is below AA, and
   * black on this red is 6.16:1, so dark mode flips the label ink. */
  redOn: '#000000',
  track: '#3A3A3C',
  sheet: '#1A1A1C',
  sheetCard: '#2A2A2D',
  sheetLine: '#3E3E42',
  edge: 'rgba(255,255,255,.10)',
  scrim: 'rgba(0,0,0,.7)',
  chip: '#3A3A3C',
  chipInk: '#C9C9CE',
  avatarBg: '#2A2A2D',
  avatarInk: '#1A1A1C',
  emptyMark: '#2A2A2D',
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

/** Outstanding money is red; a settled balance is muted. Never green. */
export function balanceColor(cents: number, c: Palette): string {
  return cents === 0 ? c.mute : c.red;
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

/**
 * Inter, everywhere. React Native picks a face by family name, not by numeric
 * weight, so every text style names its face explicitly.
 */
export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

/** Amounts and the clock line up in a column. */
export const tabular = { fontVariant: ['tabular-nums' as const] };

export const spacing = { xxs: 4, xs: 7, sm: 10, md: 14, lg: 17, xl: 20, xxl: 27, xxxl: 34 } as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  sheet: 26,
  pill: 999,
} as const;

export const type = {
  caption: 13,
  label: 14,
  body: 17,
  bodyLarge: 18,
  title: 19,
  sheetTitle: 28,
  cardName: 18,
  cardAmount: 21,
  entryAmount: 19,
  hero: 56,
  input: 26,
} as const;

/** WCAG AAA floor is 44x44; older hands want more. Nothing here goes below 44. */
export const layout = {
  screenPadding: 20,
  controlHeight: 66,
  buttonHeight: 60,
  actionHeight: 56,
  minTapTarget: 44,
} as const;

/**
 * Outward shadows only. An inset never reads as "selected", and on dark the
 * lightness steps above carry elevation instead.
 */
export const shadows = {
  raised: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  pill: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 8,
  },
} as const;

/** Segment pill slide and theme crossfade, per the approved mockup. */
export const motion = {
  segmentMs: 280,
  segmentEasing: [0.32, 0.72, 0, 1] as const,
  themeFadeMs: 320,
} as const;
