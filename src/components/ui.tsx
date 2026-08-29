import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLang } from '../i18n';
import { colors, layout, radius, spacing, type } from '../theme';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionHeading({ title, trailing }: { title: string; trailing?: ReactNode }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {trailing}
    </View>
  );
}

type IconButtonProps = Omit<PressableProps, 'style'> & {
  glyph: string;
  accessibilityLabel: string;
  tone?: 'neutral' | 'accent' | 'danger';
  size?: 'small' | 'regular';
  style?: StyleProp<ViewStyle>;
};

export function IconButton({ glyph, tone = 'neutral', size = 'regular', style, ...props }: IconButtonProps) {
  return (
    <Pressable
      {...props}
      hitSlop={10}
      style={({ pressed }) => [
        styles.iconButton,
        size === 'small' && styles.iconButtonSmall,
        tone === 'accent' && styles.iconButtonAccent,
        tone === 'danger' && styles.iconButtonDanger,
        pressed && styles.pressed,
        style,
      ]}>
      <Text style={[styles.iconGlyph, tone === 'accent' && styles.iconGlyphAccent, tone === 'danger' && styles.iconGlyphDanger]}>
        {glyph}
      </Text>
    </Pressable>
  );
}

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  tone?: 'primary' | 'danger' | 'secondary';
  glyph?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, glyph, tone = 'primary', style, disabled, ...props }: ButtonProps) {
  const textStyle: StyleProp<TextStyle> = [styles.buttonText, tone === 'secondary' && styles.buttonTextSecondary];
  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        tone === 'danger' && styles.buttonDanger,
        tone === 'secondary' && styles.buttonSecondary,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      {glyph ? <Text style={textStyle}>{glyph}</Text> : null}
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

export function FieldShell({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.fieldShell, style]}>{children}</View>;
}

export function InitialAvatar({ name: _name, size = 46 }: { name: string; size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.avatarHead, { width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15 }]} />
      <View style={[styles.avatarBody, { width: size * 0.56, height: size * 0.24, borderTopLeftRadius: size * 0.28, borderTopRightRadius: size * 0.28 }]} />
    </View>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {action ? <View style={styles.emptyAction}>{action}</View> : null}
    </View>
  );
}

export function BottomNav({ active }: { active: 'home' | 'people' }) {
  const { t } = useLang();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bottomNav, { height: layout.bottomBarHeight + insets.bottom, paddingBottom: insets.bottom }]}>
      <NavItem onPress={() => router.replace('/')} tab="home" active={active === 'home'} label={t.homeTab} />
      <NavItem onPress={() => router.replace('/people')} tab="people" active={active === 'people'} label={t.peopleTab} />
    </View>
  );
}

function NavItem({ onPress, tab, active, label }: { onPress: () => void; tab: 'home' | 'people'; active: boolean; label: string }) {
  const tint = active ? colors.accent : colors.textSecondary;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}>
      {tab === 'home' ? <ListTabIcon color={tint} /> : <PersonTabIcon color={tint} />}
      <Text style={[styles.navLabel, { color: tint }]}>{label}</Text>
    </Pressable>
  );
}

function ListTabIcon({ color }: { color: string }) {
  return (
    <View style={styles.listIcon}>
      {[0, 1, 2].map((row) => (
        <View key={row} style={styles.listIconRow}>
          <View style={[styles.listDot, { backgroundColor: color }]} />
          <View style={[styles.listLine, { backgroundColor: color }]} />
        </View>
      ))}
    </View>
  );
}

function PersonTabIcon({ color }: { color: string }) {
  return (
    <View style={styles.personIcon}>
      <View style={[styles.personHead, { backgroundColor: color }]} />
      <View style={[styles.personBody, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: type.title, fontWeight: '700' },
  iconButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  iconButtonSmall: { width: 32, height: 32, borderRadius: 16 },
  iconButtonAccent: { backgroundColor: colors.accent },
  iconButtonDanger: { backgroundColor: colors.accent },
  iconGlyph: { color: colors.accent, fontSize: 27, fontWeight: '700', lineHeight: 30 },
  iconGlyphAccent: { color: colors.bg, fontSize: 25 },
  iconGlyphDanger: { color: colors.bg },
  button: { minHeight: layout.buttonHeight, paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colors.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  buttonDanger: { backgroundColor: colors.accent },
  buttonSecondary: { backgroundColor: colors.surfaceRaised },
  buttonText: { color: colors.text, fontSize: type.bodyLarge, fontWeight: '700' },
  buttonTextSecondary: { color: colors.text },
  pressed: { opacity: 0.66 },
  disabled: { opacity: 0.4 },
  fieldLabel: { color: colors.text, fontSize: type.title, fontWeight: '700', marginBottom: spacing.sm },
  fieldShell: { minHeight: layout.controlHeight, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center' },
  avatar: { backgroundColor: '#343438', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarHead: { backgroundColor: '#1D1D1F', marginTop: 2 },
  avatarBody: { backgroundColor: '#1D1D1F', marginTop: 3 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  emptyTitle: { color: '#4D4D50', fontSize: 31, fontWeight: '800', textAlign: 'center' },
  emptyBody: { color: '#5F5F63', fontSize: 18, fontWeight: '400', textAlign: 'center', marginTop: 4 },
  emptyAction: { marginTop: spacing.xl },
  bottomNav: { width: '100%', flexDirection: 'row', backgroundColor: colors.bg },
  navItem: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4 },
  navLabel: { fontSize: 10, lineHeight: 12, fontWeight: '500', marginTop: 4 },
  listIcon: { width: 22, height: 18, justifyContent: 'space-between' },
  listIconRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  listDot: { width: 2, height: 2, borderRadius: 1 },
  listLine: { width: 16, height: 2, borderRadius: 1 },
  personIcon: { width: 20, height: 19, alignItems: 'center' },
  personHead: { width: 7, height: 7, borderRadius: 4 },
  personBody: { width: 17, height: 9, borderTopLeftRadius: 9, borderTopRightRadius: 9, marginTop: 2 },
});
