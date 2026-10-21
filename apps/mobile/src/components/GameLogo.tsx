import { useEffect } from 'react';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { fonts } from '../theme';
import { t } from '../i18n';

type Props = {
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export function GameLogo({ style, compact }: Props) {
  const float = useSharedValue(0);
  const enter = useSharedValue(0.86);

  useEffect(() => {
    enter.value = withSpring(1, { damping: 14, stiffness: 160 });
    float.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
  }, [enter, float]);

  const anim = useAnimatedStyle(() => ({
    transform: [
      { translateY: (float.value - 0.5) * 8 },
      { scale: enter.value },
    ],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(480)}
      style={[styles.wrap, compact && styles.compact, style, anim]}
      accessibilityRole="header"
      accessibilityLabel={t('home.brand')}
    >
      <View style={[styles.iconRing, compact && styles.iconRingCompact]}>
        <Image
          source={require('../../assets/icon.png')}
          style={[styles.icon, compact && styles.iconCompact]}
          resizeMode="contain"
        />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.brand, compact && styles.brandCompact]}>{t('home.brand')}</Text>
        <Text style={styles.crown}>♛</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 12,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconRing: {
    width: 112,
    height: 112,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconRingCompact: {
    width: 44,
    height: 44,
    borderRadius: 14,
  },
  icon: {
    width: 96,
    height: 96,
  },
  iconCompact: {
    width: 36,
    height: 36,
  },
  copy: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  brand: {
    fontFamily: fonts.display,
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  brandCompact: {
    fontSize: 22,
    letterSpacing: 0.6,
  },
  crown: {
    marginTop: -2,
    color: '#FACC15',
    fontSize: 14,
  },
});
