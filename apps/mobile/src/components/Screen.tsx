import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import {
  ScrollView,
  StyleSheet,
  View,
  type ViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors } from '../theme';

function GlowOrb({
  color,
  style,
  delay = 0,
}: {
  color: string;
  style: StyleProp<ViewStyle>;
  delay?: number;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 5200 + delay, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [delay, t]);
  const anim = useAnimatedStyle(() => ({
    transform: [
      { translateY: (t.value - 0.5) * 18 },
      { scale: 0.92 + t.value * 0.12 },
    ],
    opacity: 0.35 + t.value * 0.25,
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.orb, { backgroundColor: color }, style, anim]}
    />
  );
}

export function Screen({
  children,
  style,
  scroll,
  ...rest
}: ViewProps & { scroll?: boolean }) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.inner, style]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.inner, style]} {...rest}>
      {children}
    </View>
  );

  return (
    <View style={styles.fill}>
      <LinearGradient
        colors={[colors.bg0, colors.bg1, '#1C0A3A', '#0A0618']}
        locations={[0, 0.35, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />
      <GlowOrb color={colors.neonPink} style={styles.orbA} />
      <GlowOrb color={colors.neonCyan} style={styles.orbB} delay={800} />
      <GlowOrb color="#7B61FF" style={styles.orbC} delay={1400} />
      <View pointerEvents="none" style={styles.grain} />
      <StatusBar style="light" />
      <SafeAreaView style={styles.fill}>{content}</SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  inner: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 22 },
  orb: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
  },
  orbA: { top: -40, right: -60 },
  orbB: { bottom: 80, left: -90 },
  orbC: { top: '42%', right: -100, width: 160, height: 160 },
  grain: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    borderWidth: 0,
    opacity: 0.05,
    shadowColor: '#fff',
    shadowOpacity: 0.02,
  },
});
