import type { ReactNode } from 'react';
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
 * values were never the problem; four separate rounds of retuning them
 * failed before that test was run. See PROJECT_STATE section 3.
 *
 * The layers are plain Views with a backgroundColor and a borderRadius — the
 * most ordinary paint path there is, identical on iOS and react-native-web.
 * So unlike a real shadow, what the browser preview shows here is
 * trustworthy (see section 8 on preview fidelity).
 *
 * The layers are siblings rendered *before* the content, never children of
 * it: a child always paints on top of its parent's own background, so a
 * shadow nested inside the box it is shadowing would sit on top of the fill.
 */

/**
 * The banding story, since this got it wrong twice.
 *
 * v1 used 8 layers spaced evenly by distance. At blur 16 that is a step every
 * 2pt — 6 physical pixels at 3x — with up to 3.1% alpha per step, which read
 * as stacked bars rather than a fade.
 *
 * What actually matters is the alpha jump per step, not the layer count, so
 * the layers are now spaced evenly in ALPHA (see below). At 32 layers the
 * largest step is 1.7% and the outermost layer is 1.1%, fading to nothing
 * with no cutoff. Verified numerically before shipping, not by eye.
 *
 * If banding ever reappears, raise this — the alpha step scales as 1/LAYERS.
 */
const LAYERS = 32;

/**
 * A real gaussian falloff, not the linear ramp v1 used. Linear coverage put
 * full opacity hard against the box edge and cut to zero at a fixed distance,
 * which is what made it look like a stack of plates sitting under each box.
 *
 * `sigma = blur / 2.2` approximates the CSS convention (a CSS blur radius is
 * roughly twice its gaussian sigma), so a value copied straight from the
 * mockup's `box-shadow` lands in about the right place.
 */
function sigmaFor(blur: number): number {
  return blur / 2.2;
}

export function Elevated({
  /** Corner radius of the box being shadowed, so the shadow follows its shape. */
  radius,
  /** How far the shadow reaches past the box, in points. */
  blur = 16,
  /** Downward bias. The shadow still falls on all four sides. */
  offsetY = 4,
  /** Peak darkness at the box's edge, 0-1. */
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
  // NOT useMemo, deliberately. React Fast Refresh preserves hook state for a
  // component whose hook signature has not changed, so a useMemo whose deps
  // are unchanged keeps handing back the value computed by the OLD code after
  // an edit. That is exactly what happened here: the layer maths was rewritten
  // and the device kept rendering the previous version's layers, which looked
  // to the user like the push had never arrived. Building 32 plain objects per
  // render is far cheaper than that class of ghost bug.
  const layers = (() => {
    const sigma = sigmaFor(blur);
    const out: ViewStyle[] = [];

    // Layers are spaced by equal steps in ALPHA, not in distance, by
    // inverting the gaussian. Spacing them evenly by distance (the first
    // attempt) put the biggest alpha jumps exactly where the curve is
    // steepest, and left the outermost layer at ~3.6% alpha with nothing
    // beyond it — a hard cutoff, which is the same straight-edge artefact
    // this component exists to avoid. Even alpha steps put the layers close
    // together where the gradient is steep and far apart out in the tail,
    // so every step is the same small size and the outer edge fades to
    // nothing on its own.
    let accumulated = 0;
    for (let k = 1; k <= LAYERS; k++) {
      const target = (opacity * k) / LAYERS;
      // Distance at which the gaussian equals `target`.
      const spread = sigma * Math.sqrt(-2 * Math.log(k / LAYERS));
      // Compositing is multiplicative — two 10% blacks give 19%, not 20% —
      // so solve each layer's own alpha from the outside inwards.
      const alpha = accumulated >= 1 ? 0 : 1 - (1 - target) / (1 - accumulated);
      accumulated = target;

      out.push({
        position: 'absolute',
        // All four sides, biased downward by `offsetY`.
        top: offsetY - spread,
        bottom: -offsetY - spread,
        left: -spread,
        right: -spread,
        borderRadius: radius + spread,
        backgroundColor: `rgba(0, 0, 0, ${alpha.toFixed(5)})`,
      });
    }
    return out;
  })();

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
