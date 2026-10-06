import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts } from '../theme';
import { feedback } from '../feedback';
import type { SfxName } from '../audio';

type Variant = 'pink' | 'cyan' | 'ghost' | 'yes' | 'never' | 'orange';

const FILLS: Record<Exclude<Variant, 'ghost'>, { solid: string; gradient: [string, string] }> = {
  pink: { solid: '#FF2D95', gradient: ['#FF4DB8', '#FF1F7A'] },
  cyan: { solid: '#2DE2E6', gradient: ['#5CFFF3', '#1AC6D8'] },
  yes: { solid: '#C8FF4D', gradient: ['#D8FF6A', '#9BE02A'] },
  never: { solid: '#8B6CFF', gradient: ['#A78BFF', '#6B4EFF'] },
  orange: { solid: '#FF8A3D', gradient: ['#FFB347', '#FF7A1A'] },
};

const VARIANT_SFX: Partial<Record<Variant, SfxName>> = {
  yes: 'yes',
  never: 'never',
};

export function PartyButton({
  label,
  onPress,
  variant = 'pink',
  style,
  disabled,
  subtitle,
  sound = true,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  subtitle?: string;
  /** false = solo haptic; true = sfx por variante o tap */
  sound?: boolean | SfxName;
}) {
  const handle = () => {
    const sfx =
      sound === false ? undefined : typeof sound === 'string' ? sound : VARIANT_SFX[variant] ?? 'tap';
    void feedback({
      sfx,
      haptic: variant === 'yes' || variant === 'never' ? 'light' : 'selection',
    });
    onPress();
  };

  if (variant === 'ghost') {
    return (
      <Pressable
        disabled={disabled}
        onPress={handle}
        style={({ pressed }) => [
          styles.base,
          styles.ghost,
          { opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
          style,
        ]}
      >
        <Text style={styles.ghostLabel}>{label}</Text>
        {subtitle ? <Text style={styles.subMuted}>{subtitle}</Text> : null}
      </Pressable>
    );
  }

  const fill = FILLS[variant];
  const darkText = variant === 'yes' || variant === 'cyan' || variant === 'orange';
  const labelStyle = [styles.label, { color: darkText ? '#0B0614' : '#FFFFFF' }];

  const inner = (
    <>
      <Text style={labelStyle}>{label}</Text>
      {subtitle ? (
        <Text
          style={[
            styles.sub,
            { color: darkText ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.85)' },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </>
  );

  return (
    <Pressable
      disabled={disabled}
      onPress={handle}
      style={({ pressed }) => [
        styles.wrap,
        {
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      <View
        style={[
          styles.glow,
          {
            backgroundColor:
              variant === 'pink'
                ? colors.neonPinkSoft
                : variant === 'cyan'
                  ? colors.neonCyanSoft
                  : 'rgba(255,255,255,0.14)',
          },
        ]}
      />
      {Platform.OS === 'web' ? (
        <View style={[styles.base, { backgroundColor: fill.solid }]}>{inner}</View>
      ) : (
        <LinearGradient
          colors={fill.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.base}
        >
          {inner}
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 7 },
  glow: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: -4,
    height: 20,
    borderRadius: 20,
  },
  base: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
  },
  ghost: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: colors.stroke,
    marginVertical: 7,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  ghostLabel: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.4,
  },
  sub: { marginTop: 3, fontSize: 12, fontWeight: '600' },
  subMuted: { marginTop: 3, fontSize: 12, fontWeight: '600', color: colors.muted },
});
