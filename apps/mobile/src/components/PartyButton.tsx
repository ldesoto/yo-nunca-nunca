import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../theme';

export function PartyButton({
  label,
  onPress,
  variant = 'pink',
  style,
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'pink' | 'cyan' | 'ghost' | 'yes' | 'never';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const bg =
    variant === 'pink'
      ? colors.neonPink
      : variant === 'cyan'
        ? colors.neonCyan
        : variant === 'yes'
          ? colors.yes
          : variant === 'never'
            ? colors.never
            : 'transparent';
  const textColor =
    variant === 'ghost' ? colors.text : variant === 'yes' ? '#102000' : '#0B0614';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
        variant === 'ghost' && styles.ghost,
        style,
      ]}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginVertical: 6,
  },
  ghost: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  label: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
