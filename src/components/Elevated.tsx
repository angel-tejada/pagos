import { useMemo, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { radius as radii } from '../theme';

/**
 * A soft drop shadow built from stacked translucent rounded rects, with no
 * blur anywhere in it.
 *
 * Why this exists instead of a normal shadow: on this project's iOS build,
 * BOTH React Native shadow APIs paint these boxes with a hard straight edge
 * rather than a blur. That was confirmed on device with a 0-offset, 40pt
 * blur, 45% shadow — a shape that cannot produce a straight edge if any
 * blurring is happening at all — and it still came out as a rectangle. The
 * values were never the problem; three separate rounds of retuning them
 * failed before that test was run. See PROJECT_STATE section 3.
 *
 * How it works: N concentric rounded rects, each one `blur/N` larger than the
 * last, all the same low alpha. Near the box every layer overlaps, so the
 * accumulated alpha is high; further out fewer layers reach, so it fades.
 * That produces a linear ramp rather than a true gaussian, which reads as a
 * soft shadow at these sizes and, critically, has no hard boundary anywhere.
 *
 * The layers are plain Views with a backgroundColor and a borderRadius —
 * the most ordinary paint path there is, identical on iOS and
 * react-native-web. So unlike a real shadow, what the browser preview shows
 * here is trustworthy (see section 8 on preview fidelity).
 *
 * The layers are siblings that render *before* the content, never children of
 * it: a child always paints on top of its parent's own background, so a
 * shadow nested inside the box it is shadowing would sit on top of the fill.
 */

/** Enough steps that the ramp reads as smooth, few enough to stay cheap. */
const LAYERS = 8;

export function Elevated({
  /** Corner radius of the box being shadowed, so the shadow follows its shape. */
  radius,
  /** How far the shadow reaches past the box, in points. */
  blur = 16,
  /** Downward offset, in points. */
  offsetY = 4,
  /** Total darkness directly under the box's edge, 0-1. */
  opacity = 0.35,
  /** Applied to the wrapper — put margins here, not on the child. */
  style,
  children,
}: {
  radius: number;
  blur?: number;
  offsetY?: number;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const layers = useMemo(() => {
    // Per-layer alpha chosen so that N fully-overlapping layers compose to
    // `opacity`, rather than N * alpha overshooting it.
    const perLayer = 1 - Math.pow(1 - opacity, 1 / LAYERS);
    return Array.from({ length: LAYERS }, (_, i) => {
      const spread = ((i + 1) / LAYERS) * blur;
      return {
        position: 'absolute' as const,
        top: offsetY - spread,
        bottom: -offsetY - spread,
        left: -spread,
        right: -spread,
        borderRadius: radius + spread,
        backgroundColor: `rgba(0, 0, 0, ${perLayer.toFixed(4)})`,
      };
    });
  }, [radius, blur, offsetY, opacity]);

  return (
    <View style={style}>
      {layers.map((layer, i) => (
        <View key={i} pointerEvents="none" style={layer} />
      ))}
      {children}
    </View>
  );
}

/** The mockup's `.seg` / `.mgrp` / `.close` shadow: `0 4px 16px rgba(0,0,0,.35)`. */
export const RAISED = { blur: 16, offsetY: 4, opacity: 0.35 } as const;

/** Matches the boxes this app actually raises. */
export const RAISED_RADIUS = { segment: radii.lg, group: radii.xl, button: radii.lg } as const;
