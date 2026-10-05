import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewProps,
} from 'react-native';
import { colors, fonts } from '../theme';

export function GlassCard({
  children,
  style,
  glow,
  ...rest
}: ViewProps & { glow?: 'pink' | 'cyan' | 'none' }) {
  return (
    <View
      style={[
        styles.card,
        glow === 'pink' && styles.glowPink,
        glow === 'cyan' && styles.glowCyan,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Field(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      style={styles.input}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.stroke,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  glowPink: {
    borderColor: colors.strokeHot,
    shadowColor: colors.neonPink,
    shadowOpacity: 0.35,
  },
  glowCyan: {
    borderColor: 'rgba(45,226,230,0.45)',
    shadowColor: colors.neonCyan,
    shadowOpacity: 0.3,
  },
  label: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.body,
    borderWidth: 1,
    borderColor: colors.stroke,
  },
});
