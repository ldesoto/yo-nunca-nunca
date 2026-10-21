/**
 * Animaciones sutiles del menú con la API Animated de React Native (sin dependencias nativas nuevas).
 * Respeta "Reducir movimiento" del sistema: sin desplazamientos ni pulsos, solo aparición inmediata.
 */
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, ViewStyle, StyleProp } from 'react-native';

export const MOTION = {
  enterMs: 420,        // fade + slide de entrada
  staggerMs: 70,       // retraso entre elementos
  slidePx: 16,
  pulseMs: 1400,       // medio ciclo del pulso del CTA
  pulseScale: 1.035,
  pressScale: 0.96,
  pressMs: 110,
  easeOut: Easing.out(Easing.cubic),
  easeInOut: Easing.inOut(Easing.sin),
};

/** true si el usuario pidió reducir movimiento (se actualiza en vivo). */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then(v => { if (alive) setReduce(!!v); }).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', v => setReduce(!!v));
    return () => { alive = false; sub?.remove?.(); };
  }, []);
  return reduce;
}

/** Entrada escalonada: fade + slide hacia arriba. `index` define el orden. */
export function FadeIn({ index = 0, children, style }: { index?: number; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) { v.setValue(1); return; }
    Animated.timing(v, { toValue: 1, duration: MOTION.enterMs, delay: index * MOTION.staggerMs, easing: MOTION.easeOut, useNativeDriver: true }).start();
  }, [reduce]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [MOTION.slidePx, 0] });
  return <Animated.View style={[style, { opacity: v, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

/** Botón con press-scale y, opcionalmente, pulso suave en bucle (desactivado con reducir movimiento). */
export function AnimatedPress({ onPress, pulse, children, style, label, hint, role = 'button' }: {
  onPress: () => void; pulse?: boolean; children: React.ReactNode; style?: StyleProp<ViewStyle>; label: string; hint?: string; role?: 'button' | 'link';
}) {
  const reduce = useReduceMotion();
  const press = useRef(new Animated.Value(1)).current;
  const beat = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!pulse || reduce) { beat.setValue(1); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(beat, { toValue: MOTION.pulseScale, duration: MOTION.pulseMs, easing: MOTION.easeInOut, useNativeDriver: true }),
      Animated.timing(beat, { toValue: 1, duration: MOTION.pulseMs, easing: MOTION.easeInOut, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [pulse, reduce]);
  const to = (x: number) => Animated.timing(press, { toValue: x, duration: reduce ? 0 : MOTION.pressMs, easing: MOTION.easeOut, useNativeDriver: true }).start();
  return <Animated.View style={{ transform: [{ scale: Animated.multiply(press, beat) }] }}>
    <Pressable onPress={onPress} onPressIn={() => to(MOTION.pressScale)} onPressOut={() => to(1)}
      accessibilityRole={role} accessibilityLabel={label} accessibilityHint={hint} style={style}>{children}</Pressable>
  </Animated.View>;
}
