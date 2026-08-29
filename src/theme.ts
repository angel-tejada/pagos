/** Shared measurements taken from the supplied iPhone UI references. */
export const colors = {
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
} as const;

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
