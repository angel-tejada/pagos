/**
 * Colores y tamaños de la app. / App colors and sizes.
 *
 * Regla de color: verde = te deben más, rojo = te pagaron.
 * Color rule: green = they owe you more, red = they paid you back.
 */

export const colors = {
  bg: '#0E1116',
  card: '#181D25',
  card2: '#222933',
  line: '#2B3541',

  text: '#FFFFFF',
  dim: '#8E9BAB',

  /** verde — sube lo que deben / green — balance goes up */
  up: '#2DD4A7',
  upInk: '#06231B',

  /** rojo — baja lo que deben / red — balance goes down */
  down: '#FF5F5F',
  downInk: '#2A0A0A',

  accent: '#2DD4A7',
} as const;

export const size = {
  body: 16,
  small: 13,
  tiny: 12,
  name: 15,
  title: 17,
  cardAmount: 25,
  heroAmount: 44,
  totalAmount: 30,
  padAmount: 46,
  key: 26,
} as const;

export const radius = {
  card: 12,
  button: 15,
  key: 13,
} as const;
