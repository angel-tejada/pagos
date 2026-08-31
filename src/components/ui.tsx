import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { font, layout, motion, radius, spacing, type, useStyles, type Palette } from '../theme';

type ButtonTone = 'debt' | 'payment' | 'outline' | 'sheet';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  /**
   * 'debt' is the only red control in the app: money going out.
   * 'payment' is the neutral solid. 'outline' is quiet and never filled.
   */
  tone?: ButtonTone;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, tone = 'payment', style, disabled, ...props }: ButtonProps) {
  const styles = useStyles(makeStyles);
  const textStyle: StyleProp<TextStyle> = [
    styles.buttonText,
    tone === 'debt' && styles.buttonTextDebt,
    tone === 'payment' && styles.buttonTextPayment,
    (tone === 'outline' || tone === 'sheet') && styles.buttonTextQuiet,
  ];
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        tone === 'debt' && styles.buttonDebt,
        tone === 'payment' && styles.buttonPayment,
        tone === 'outline' && styles.buttonOutline,
        tone === 'sheet' && styles.buttonSheet,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  const styles = useStyles(makeStyles);
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

export function InitialAvatar({ size = 46 }: { name?: string; size?: number }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.avatarHead, { width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15 }]} />
      <View
        style={[
          styles.avatarBody,
          {
            width: size * 0.56,
            height: size * 0.24,
            borderTopLeftRadius: size * 0.28,
            borderTopRightRadius: size * 0.28,
          },
        ]}
      />
    </View>
  );
}

export function EmptyState({ body }: { body: string }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

export type SegmentOption<T extends string> = { value: T; label: string };

/**
 * The selected pill slides to whatever was tapped. Never a fade, never a pop.
 * Unselected labels sit at 45% so chosen versus not-chosen reads at a glance,
 * and the shadow is outward — an inset would read as "pressed", not "on".
 */
export function Segment<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (next: T) => void;
}) {
  const styles = useStyles(makeStyles);
  const [trackWidth, setTrackWidth] = useState(0);
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  const position = useRef(new Animated.Value(index)).current;

  useEffect(() => {
    Animated.timing(position, {
      toValue: index,
      duration: motion.segmentMs,
      easing: Easing.bezier(...motion.segmentEasing),
      // react-native-web has no native driver and warns on every animation
      // that asks for one; native keeps it, since offloading this transform
      // to the UI thread is a real benefit there.
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [index, position]);

  const inner = Math.max(0, trackWidth - SEGMENT_PAD * 2);
  const cell = options.length ? inner / options.length : 0;
  const translateX =
    options.length > 1
      ? position.interpolate({
          inputRange: options.map((_, i) => i),
          outputRange: options.map((_, i) => i * cell),
        })
      : 0;

  const onLayout = (event: LayoutChangeEvent) => setTrackWidth(event.nativeEvent.layout.width);

  return (
    <View style={styles.segment} onLayout={onLayout}>
      {cell > 0 ? (
        <Animated.View style={[styles.segmentPill, { width: cell, transform: [{ translateX }] }]} />
      ) : null}
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={styles.segmentButton}>
            <Text style={[styles.segmentLabel, active ? styles.segmentLabelOn : styles.segmentLabelOff]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const SEGMENT_PAD = 5;

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    button: {
      minHeight: layout.buttonHeight,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: spacing.xs,
    },
    buttonDebt: { backgroundColor: c.red },
    buttonPayment: { backgroundColor: c.ink },
    buttonOutline: { backgroundColor: c.card, borderWidth: 1, borderColor: c.line },
    // No border: the raised fill plus the <Elevated> shadow behind it
    // separate this from the sheet. The shadow is NOT applied here — the
    // caller wraps the button, because a shadow nested inside the box it
    // shadows would paint on top of that box's own fill.
    buttonSheet: { backgroundColor: c.sheetCardRaised },
    buttonText: { fontFamily: font.extrabold, fontSize: type.bodyLarge, letterSpacing: -0.18 },
    buttonTextDebt: { color: c.redOn },
    buttonTextPayment: { color: c.inkOn },
    buttonTextQuiet: { color: c.ink, fontFamily: font.bold },
    pressed: { opacity: 0.7 },
    disabled: { opacity: 0.3 },

    fieldLabel: {
      color: c.ink,
      fontFamily: font.extrabold,
      fontSize: 22,
      letterSpacing: -0.4,
      marginBottom: spacing.sm,
    },

    avatar: { backgroundColor: c.avatarBg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    avatarHead: { backgroundColor: c.avatarInk, marginTop: 2 },
    avatarBody: { backgroundColor: c.avatarInk, marginTop: 3 },

    emptyState: { paddingVertical: 60, paddingHorizontal: spacing.xl },
    emptyBody: {
      color: c.mute,
      fontFamily: font.regular,
      fontSize: 16,
      lineHeight: 26,
      textAlign: 'center',
    },

    // No border on the track: the raised fill plus the <Elevated> shadow
    // behind it separate it from the sheet. The shadow is applied by the
    // caller wrapping <Segment>, not here — see Elevated.tsx for why it
    // cannot be a child of the box it shadows.
    segment: {
      flexDirection: 'row',
      backgroundColor: c.sheetCardRaised,
      borderRadius: radius.lg,
      padding: SEGMENT_PAD,
    },
    segmentPill: {
      position: 'absolute',
      top: SEGMENT_PAD,
      bottom: SEGMENT_PAD,
      left: SEGMENT_PAD,
      borderRadius: radius.md,
      backgroundColor: c.ink,
      pointerEvents: 'none',
      // No shadow: the pill is solid ink against a light track, so it already
      // reads as raised, and it is absolutely positioned and transform-
      // animated, which <Elevated> cannot wrap cleanly. Revisit only if the
      // user asks for depth on it specifically.
    },
    segmentButton: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
    segmentLabel: { fontSize: type.body, letterSpacing: -0.17 },
    segmentLabelOn: { color: c.inkOn, fontFamily: font.extrabold },
    segmentLabelOff: { color: c.ink, fontFamily: font.semibold, opacity: 0.45 },
  });
