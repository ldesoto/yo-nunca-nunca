import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { useAmbientMusic } from '../useAmbientMusic';
import { colors, fonts } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type GameMode = {
  id: string;
  title: string;
  description: string;
  icon: string;
  players: string;
  badge?: string;
  accent: string;
  accentSoft: string;
  border: [string, string, string];
  ctaColor: string;
  onPlay: () => void;
  onJoin?: () => void;
  onSolo?: () => void;
};

function ModeCard({ mode, index }: { mode: GameMode; index: number }) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const tap = (fn: () => void) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // web / unsupported
    }
    fn();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(70 + index * 85).duration(460)}
      style={anim}
    >
      <View style={[styles.cardShadow, { shadowColor: mode.accent }]}>
        <LinearGradient
          colors={mode.border}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardBorder}
        >
          <LinearGradient
            colors={['#1A0F2E', '#12081F', '#0E0718']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardInner}
          >
            {mode.badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{mode.badge}</Text>
              </View>
            ) : null}

            <View style={styles.cardTop}>
              <View style={[styles.iconGlow, { backgroundColor: mode.accentSoft }]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.03)']}
                  style={[styles.iconWrap, { borderColor: `${mode.accent}55` }]}
                >
                  <Text style={styles.icon}>{mode.icon}</Text>
                </LinearGradient>
              </View>

              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {mode.title}
                </Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {mode.description}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.cardFooter,
                !(mode.onJoin || mode.onSolo) && styles.cardFooterSimple,
              ]}
            >
              <Text style={styles.players}>{mode.players}</Text>

              {mode.onJoin || mode.onSolo ? (
                <View style={styles.actionGrid}>
                  {mode.onSolo ? (
                    <Pressable
                      onPress={() => tap(mode.onSolo!)}
                      style={({ pressed }) => [
                        styles.secondaryBtn,
                        pressed && styles.btnPressed,
                      ]}
                    >
                      <Text style={styles.secondaryLabel}>Solo</Text>
                    </Pressable>
                  ) : null}
                  {mode.onJoin ? (
                    <Pressable
                      onPress={() => tap(mode.onJoin!)}
                      style={({ pressed }) => [
                        styles.secondaryBtn,
                        pressed && styles.btnPressed,
                      ]}
                    >
                      <Text style={styles.secondaryLabel}>Unirse</Text>
                    </Pressable>
                  ) : null}
                  <Pressable
                    onPressIn={() => {
                      scale.value = withSpring(0.985, { damping: 18, stiffness: 280 });
                    }}
                    onPressOut={() => {
                      scale.value = withSpring(1, { damping: 16, stiffness: 220 });
                    }}
                    onPress={() => tap(mode.onPlay)}
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      pressed && styles.btnPressed,
                    ]}
                  >
                    <Text style={[styles.primaryLabel, { color: mode.ctaColor }]}>
                      Crear
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPressIn={() => {
                    scale.value = withSpring(0.985, { damping: 18, stiffness: 280 });
                  }}
                  onPressOut={() => {
                    scale.value = withSpring(1, { damping: 16, stiffness: 220 });
                  }}
                  onPress={() => tap(mode.onPlay)}
                  style={({ pressed }) => [
                    styles.playBtn,
                    pressed && styles.btnPressed,
                  ]}
                >
                  <Text style={[styles.playLabel, { color: mode.ctaColor }]}>JUGAR</Text>
                </Pressable>
              )}
            </View>
          </LinearGradient>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

export function HomeScreen({ navigation }: Props) {
  useAmbientMusic();

  const modes: GameMode[] = [
    {
      id: 'ynn',
      title: 'Yo Nunca Nunca',
      description: 'Confiesa tus secretos. Online con amigos o solo.',
      icon: '🤞',
      players: '1–12 jugadores',
      badge: 'EL CLÁSICO',
      accent: '#C084FC',
      accentSoft: 'rgba(192,132,252,0.22)',
      border: ['#D8B4FE', '#A855F7', '#EC4899'],
      ctaColor: '#A855F7',
      onPlay: () => navigation.navigate('Create'),
      onJoin: () => navigation.navigate('Join'),
      onSolo: () => navigation.navigate('NeverHaveIEver'),
    },
    {
      id: 'most',
      title: '¿Quién es más probable?',
      description: 'Señala al culpable de cada situación.',
      icon: '🫵',
      players: '3+ jugadores',
      accent: '#FB923C',
      accentSoft: 'rgba(251,146,60,0.22)',
      border: ['#FDBA74', '#FB923C', '#F97316'],
      ctaColor: '#EA580C',
      onPlay: () => navigation.navigate('MostLikely'),
    },
    {
      id: 'truths',
      title: '2 verdades, 1 mentira',
      description: 'Adivina quién miente… y quién dice la verdad.',
      icon: '🎭',
      players: '3+ jugadores',
      accent: '#60A5FA',
      accentSoft: 'rgba(96,165,250,0.22)',
      border: ['#93C5FD', '#818CF8', '#6366F1'],
      ctaColor: '#4F46E5',
      onPlay: () => navigation.navigate('TwoTruths'),
    },
    {
      id: 'tod',
      title: 'Verdad o Bebida',
      description: '¿Respondes… o te tomas el trago?',
      icon: '🍹',
      players: '3+ jugadores',
      accent: '#F472B6',
      accentSoft: 'rgba(244,114,182,0.22)',
      border: ['#F9A8D4', '#EC4899', '#E11D48'],
      ctaColor: '#DB2777',
      onPlay: () => navigation.navigate('TruthOrDrink'),
    },
  ];

  return (
    <Screen scroll>
      <Animated.View entering={FadeInUp.duration(500)} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.brandMark}>
            <Text style={styles.brandDot}>✦</Text>
            <Text style={styles.brandText}>PARTY NIGHT</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => navigation.navigate('Profile')}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
              hitSlop={8}
            >
              <Text style={styles.iconBtnText}>👤</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Settings')}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
              hitSlop={8}
            >
              <Text style={styles.iconBtnText}>⚙️</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.hero}>¡A jugar!</Text>
        <Text style={styles.sub}>Elige un modo y empieza la noche</Text>
        <View style={styles.heroLine} />
      </Animated.View>

      <View style={styles.list}>
        {modes.map((mode, index) => (
          <ModeCard key={mode.id} mode={mode} index={index} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  brandMark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandDot: {
    color: colors.neonPink,
    fontSize: 14,
  },
  brandText: {
    fontFamily: fonts.display,
    color: 'rgba(251,247,255,0.55)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPressed: {
    opacity: 0.65,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  iconBtnText: {
    fontSize: 15,
  },
  hero: {
    fontFamily: fonts.display,
    fontSize: 46,
    fontWeight: '900',
    letterSpacing: -1.6,
    color: '#FFFFFF',
    textAlign: 'left',
  },
  sub: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(196,181,253,0.9)',
    textAlign: 'left',
  },
  heroLine: {
    marginTop: 18,
    width: 42,
    height: 3,
    borderRadius: 99,
    backgroundColor: colors.neonPink,
    opacity: 0.85,
  },
  list: {
    marginTop: 26,
    gap: 18,
    paddingBottom: 48,
  },
  cardShadow: {
    borderRadius: 26,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  cardBorder: {
    borderRadius: 26,
    padding: 1.5,
  },
  cardInner: {
    borderRadius: 24.5,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(45,226,230,0.95)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    zIndex: 2,
  },
  badgeText: {
    color: '#071018',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingRight: 72,
  },
  iconGlow: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 32,
  },
  cardCopy: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontFamily: fonts.display,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  cardDesc: {
    marginTop: 6,
    color: 'rgba(251,247,255,0.58)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  cardFooter: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
    gap: 12,
  },
  cardFooterSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0,
  },
  players: {
    color: 'rgba(251,247,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    color: 'rgba(251,247,255,0.88)',
    fontSize: 13,
    fontWeight: '700',
  },
  primaryBtn: {
    flex: 1.15,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  primaryLabel: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  btnPressed: {
    opacity: 0.88,
  },
  playBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 999,
    minWidth: 88,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  playLabel: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
});
