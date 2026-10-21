import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '../i18n';

/** Chip compacto para salir sin depender del gesto swipe. */
export function ExitGadget({
  onPress,
  label,
  style,
  light,
  corner = 'top-left',
}: {
  onPress: () => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
  /** Fondo claro (p. ej. boom rosa) → texto oscuro */
  light?: boolean;
  corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) {
  const insets = useSafeAreaInsets();
  const resolvedLabel = label ?? t('common.exit');
  const pad = {
    top: Math.max(10, insets.top + 4),
    bottom: Math.max(14, insets.bottom + 8),
    left: Math.max(12, insets.left + 8),
    right: Math.max(12, insets.right + 8),
  };
  const pos =
    corner === 'top-right'
      ? { top: pad.top, right: pad.right }
      : corner === 'bottom-left'
        ? { bottom: pad.bottom, left: pad.left }
        : corner === 'bottom-right'
          ? { bottom: pad.bottom, right: pad.right }
          : { top: pad.top, left: pad.left };

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={resolvedLabel}
      style={({ pressed }) => [
        styles.chip,
        pos,
        light && styles.chipLight,
        pressed && { opacity: 0.75 },
        style,
      ]}
    >
      <Text style={[styles.icon, light && styles.textDark]}>✕</Text>
      <Text style={[styles.label, light && styles.textDark]}>{resolvedLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  chipLight: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderColor: 'rgba(0,0,0,0.12)',
  },
  icon: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  textDark: {
    color: '#0B0614',
  },
});
