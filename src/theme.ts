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
import type { ViewStyle } from 'react-native';

export type Palette = {
  /** App ground. */
  bg: string;
  /** Cards, fields and other raised surfaces on the app ground. */
  card: string;
  /** Boundary of a card or field. Carries identification, so it clears 3:1
   *  against both the surface it edges and the ground behind it. */
  line: string;
  /** Soft separator between rows inside a group. Decorative, not a boundary. */
  divider: string;
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
  /**
   * A control that used to carry a border and now relies on fill and shadow
   * alone (the segment tracks, the Backup/Restore group, the Close button).
   * Equal to `sheetCard` in light, where the shadow already reads clearly
   * against a bright, uniform ground. Stepped a shade lighter in dark,
   * where a black shadow is nearly invisible against near-black and the
   * fill step has to do the separating on its own.
   */
  sheetCardRaised: string;
  /** Boundary of a control inside the sheet. Also clears 3:1. */
  sheetLine: string;
  /** Soft separator between rows inside the sheet. */
  sheetDivider: string;
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
  line: '#8C8474',
  divider: '#DCDAD4',
  ink: '#000000',
  inkOn: '#F7F6F3',
  mute: '#6E6C66',
  red: '#B4322A',
  redOn: '#FFFFFF',
  track: '#E6E4DE',
  sheet: '#F7F6F3',
  sheetCard: '#EFEEEA',
  sheetCardRaised: '#EFEEEA',
  sheetLine: '#8C8474',
  sheetDivider: '#DCDAD4',
  edge: 'rgba(0,0,0,.06)',
  /**
   * The mockup's `.scrim` is a flat `rgba(0,0,0,.7)` with no light-mode
   * override at all — it never lightens. This was `.35` here with no
   * comment and no PROJECT_STATE entry explaining a deliberate deviation,
   * which means it was an oversight, not a decision: half the scrim the
   * mockup specifies leaves the screen behind a sheet much brighter than it
   * should be, so any shadow above the sheet has to cover a much larger
   * brightness gap in the same blur distance — a likely real contributor to
   * shadows reading as "boxy" specifically in light mode. Matched to the
   * mockup exactly; do not soften it back down.
   */
  scrim: 'rgba(0,0,0,.7)',
  chip: '#DCDAD4',
  chipInk: '#6E6C66',
  avatarBg: '#DCDAD4',
  avatarInk: '#F7F6F3',
  emptyMark: '#DCDAD4',
};

export const darkColors: Palette = {
  bg: '#000000',
  card: '#1C1C1E',
  line: '#6A6A73',
  divider: '#3A3A3C',
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
  sheetCardRaised: '#3A3A3E',
  sheetLine: '#787882',
  sheetDivider: '#3E3E42',
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

export type ShadowSpec = { offsetY: number; opacity: number; radius: number; elevation: number };

/**
 * One shadow spec, one native `boxShadow` array entry — the SAME style
 * property and the SAME field names (`offsetX/offsetY/blurRadius/color`) that
 * CSS `box-shadow` uses, on both iOS and web. This used to branch on
 * `Platform.OS`: web got a CSS `boxShadow` string and iOS got the legacy
 * `shadowColor/shadowOffset/shadowOpacity/shadowRadius` quartet. Two rounds
 * of "fix the numbers" (see PROJECT_STATE.md) failed to close a real gap
 * between those two paths — the same numbers looked soft in an actual
 * browser (verified directly against the approved mockup's own HTML/CSS
 * source, which a real browser renders correctly with these exact values)
 * but boxy on the device, regardless of what the opacity was retuned to.
 * `boxShadow` has been a real, cross-platform Fabric prop since RN 0.75+
 * (confirmed: `BoxShadowPropsConversions.h` is shared C++, and iOS's
 * `RCTViewComponentView.mm` paints it) — using it everywhere removes the
 * legacy iOS path entirely, so there is no second implementation left to
 * drift out of sync with the CSS the mockup was authored against.
 */
export function makeShadow(spec: ShadowSpec): ViewStyle {
  const { offsetY, opacity, radius, elevation } = spec;
  return {
    boxShadow: [{ offsetX: 0, offsetY, blurRadius: radius, color: `rgba(0, 0, 0, ${opacity})` }],
    elevation,
  };
}

/**
 * Outward shadows only. An inset never reads as "selected", and on dark the
 * lightness steps above carry elevation instead (these are barely visible
 * against pure black, which is expected). `elevation` only ever matters on
 * Android, which this app does not ship to yet; it rides along for a
 * possible future build and is inert everywhere today.
 *
 * Values below are the approved mockup's literal CSS (`pagos-current.html`,
 * supplied directly by the user — the file this repo's `pagos.html` is not a
 * copy of, despite the similar name; see the provenance note this replaces).
 * Two prior rounds moved these away from the mockup's own numbers while
 * trying to fix a boxy on-device look — do not retune them again without a
 * value taken directly from that file or from the user.
 */
export const shadows = {
  /** Mockup: `.seg`, `.mgrp`, `.close` — `box-shadow: 0 4px 16px rgba(0,0,0,.35)` */
  raised: makeShadow({ offsetY: 4, opacity: 0.35, radius: 16, elevation: 6 }),
  /** Mockup: `.sheet`, `.psheet` — `box-shadow: 0 -8px 40px rgba(0,0,0,.6)`,
   *  cast upward so a sheet anchored to the bottom edge lifts off the screen
   *  behind it. */
  sheet: makeShadow({ offsetY: -8, opacity: 0.6, radius: 40, elevation: 16 }),
  /**
   * Mockup: `.anim-slide .slider` — `box-shadow: 0 4px 14px rgba(0,0,0,.55)`.
   * ONE shadow, not two.
   *
   * The mockup's `.seg button.on` rule does list two
   * (`0 4px 14px .55, 0 1px 3px .4`), and a previous round copied that pair
   * here. That was wrong: the mockup ships `<body class="anim-slide">`, and
   * `.anim-slide .seg button.on` sets `box-shadow: none`, moving the shadow
   * onto the sliding `.slider` element with only the first of the two. This
   * app implements the sliding pill, so `.slider` is the rule that applies.
   *
   * The spurious second layer is why the pill had a hard edge on device. RN's
   * iOS renderer maps CSS `blurRadius` to `CALayer.shadowRadius` at half
   * value (`RCTBoxShadow.mm`), so `3` became a 1.5pt blur — at 40% black,
   * offset 1pt, that is not a shadow, it is a dark outline traced around the
   * pill's shape. Do not reintroduce it.
   */
  pill: makeShadow({ offsetY: 4, opacity: 0.55, radius: 14, elevation: 8 }),
} as const;

/** Segment pill slide and theme crossfade, per the approved mockup. */
export const motion = {
  segmentMs: 280,
  segmentEasing: [0.32, 0.72, 0, 1] as const,
  themeFadeMs: 320,
} as const;
