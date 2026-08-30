import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
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

import { font, layout, motion, radius, shadows, spacing, type, useStyles, type Palette } from '../theme';

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
      useNativeDriver: true,
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
        <Animated.View
          pointerEvents="none"
          style={[styles.segmentPill, { width: cell, transform: [{ translateX }] }]}
        />
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
    // No border: the shadow (and, in dark mode, the raised fill) separates
    // this from the sheet behind it.
    buttonSheet: { backgroundColor: c.sheetCardRaised, ...shadows.raised },
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

    // No border on the track: the shadow (and, in dark mode, the raised
    // fill) separates it from the sheet behind it.
    segment: {
      flexDirection: 'row',
      backgroundColor: c.sheetCardRaised,
      borderRadius: radius.lg,
      padding: SEGMENT_PAD,
      ...shadows.raised,
    },
    segmentPill: {
      position: 'absolute',
      top: SEGMENT_PAD,
      bottom: SEGMENT_PAD,
      left: SEGMENT_PAD,
      borderRadius: radius.md,
      backgroundColor: c.ink,
      ...shadows.pill,
    },
    segmentButton: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
    segmentLabel: { fontSize: type.body, letterSpacing: -0.17 },
    segmentLabelOn: { color: c.inkOn, fontFamily: font.extrabold },
    segmentLabelOff: { color: c.ink, fontFamily: font.semibold, opacity: 0.45 },
  });
