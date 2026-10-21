import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { GameLogo } from '../components/GameLogo';
import { MoreSheet } from '../components/MoreSheet';
import { wakeServer } from '../api';
import { fonts } from '../theme';
import type { RootStackParamList } from '../navigation';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type FilterId = 'todos' | 'jugadores' | 'beber' | 'rapido' | 'picante';

type GameMode = {
  id: string;
  testId: string;
  title: string;
  description: string;
  icon: string;
  players: string;
  badge?: string;
  filters: FilterId[];
  gradient: [string, string, ...string[]];
  ctaGradient: [string, string];
  onPlay: () => void;
};

const FILTERS: { id: FilterId; icon: string }[] = [
  { id: 'todos', icon: '✦' },
  { id: 'jugadores', icon: '👥' },
  { id: 'beber', icon: '🥂' },
  { id: 'rapido', icon: '⚡' },
  { id: 'picante', icon: '🔥' },
];

function haptic() {
  try {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // unsupported
  }
}

function ModeCard({ mode, index }: { mode: GameMode; index: number }) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(60 + index * 70).duration(420)}
      style={anim}
    >
      <Pressable
        testID={mode.testId}
        accessibilityRole="button"
        accessibilityLabel={mode.title}
        onPressIn={() => {
          scale.value = withSpring(0.985, { damping: 18, stiffness: 280 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 16, stiffness: 220 });
        }}
        onPress={() => {
          haptic();
          mode.onPlay();
        }}
      >
        <LinearGradient
          colors={mode.gradient}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {mode.badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeCrown}>♛</Text>
              <Text style={styles.badgeText}>{mode.badge}</Text>
            </View>
          ) : null}

          <View style={styles.cardRow}>
            <View style={styles.iconBubble}>
              <Text style={styles.icon}>{mode.icon}</Text>
            </View>

            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {mode.title}
              </Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {mode.description}
              </Text>
              <Text style={styles.players}>{mode.players}</Text>
            </View>

            <LinearGradient
              colors={mode.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playPill}
            >
              <Text style={styles.playLabel}>{t('home.cta.play')}</Text>
            </LinearGradient>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function PrimaryPlayButton({ onPress }: { onPress: () => void }) {
  const pulse = useSharedValue(1);
  const press = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.035, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value * press.value }],
  }));

  return (
    <Animated.View style={anim}>
      <Pressable
        testID="home-primary-play"
        accessibilityRole="button"
        accessibilityLabel={t('home.playPrimary')}
        onPressIn={() => {
          press.value = withSpring(0.97, { damping: 16, stiffness: 260 });
        }}
        onPressOut={() => {
          press.value = withSpring(1, { damping: 14, stiffness: 220 });
        }}
        onPress={() => {
          haptic();
          onPress();
        }}
      >
        <LinearGradient
          colors={['#FDE047', '#FBBF24', '#F59E0B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primaryCta}
        >
          <Text style={styles.primaryCtaLabel}>{t('home.playPrimary')}</Text>
          <Text style={styles.primaryCtaSub}>{t('home.playSub')}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export function HomeScreen({ navigation }: Props) {
  const [filter, setFilter] = useState<FilterId>('todos');
  const [moreOpen, setMoreOpen] = useState(false);

  const modes: GameMode[] = useMemo(
    () => [
      {
        id: 'tod',
        testId: 'menu-item-TruthOrDrink',
        title: t('home.mode.tod.title'),
        description: t('home.mode.tod.desc'),
        icon: '🥃',
        players: t('home.mode.tod.players'),
        filters: ['todos', 'beber', 'picante'],
        gradient: ['#EA580C', '#DC2626', '#F97316'],
        ctaGradient: ['#FDE68A', '#F59E0B'],
        onPlay: () => navigation.navigate('TruthOrDrink'),
      },
      {
        id: 'charades',
        testId: 'menu-item-Charades',
        title: t('home.mode.charades.title'),
        description: t('home.mode.charades.desc'),
        icon: '😎',
        players: t('home.mode.charades.players'),
        filters: ['todos', 'jugadores', 'rapido'],
        gradient: ['#059669', '#10B981', '#34D399'],
        ctaGradient: ['#A7F3D0', '#6EE7B7'],
        onPlay: () => navigation.navigate('Charades'),
      },
      {
        id: 'bomb',
        testId: 'menu-item-Bomb',
        title: t('home.mode.bomb.title'),
        description: t('home.mode.bomb.desc'),
        icon: '💣',
        players: t('home.mode.bomb.players'),
        filters: ['todos', 'beber', 'rapido'],
        gradient: ['#1D4ED8', '#2563EB', '#38BDF8'],
        ctaGradient: ['#BAE6FD', '#7DD3FC'],
        onPlay: () => navigation.navigate('Bomb'),
      },
      {
        id: 'most',
        testId: 'menu-item-MostLikely',
        title: t('home.mode.most.title'),
        description: t('home.mode.most.desc'),
        icon: '🫵',
        players: t('home.mode.most.players'),
        filters: ['todos', 'jugadores', 'picante'],
        gradient: ['#C2410C', '#EA580C', '#FB923C'],
        ctaGradient: ['#FED7AA', '#FDBA74'],
        onPlay: () => navigation.navigate('MostLikely'),
      },
      {
        id: 'truths',
        testId: 'menu-item-TwoTruths',
        title: t('home.mode.truths.title'),
        description: t('home.mode.truths.desc'),
        icon: '🎭',
        players: t('home.mode.truths.players'),
        filters: ['todos', 'jugadores', 'rapido'],
        gradient: ['#4F46E5', '#6366F1', '#818CF8'],
        ctaGradient: ['#C7D2FE', '#A5B4FC'],
        onPlay: () => navigation.navigate('TwoTruths'),
      },
    ],
    [navigation],
  );

  const visible = modes.filter(
    (m) => filter === 'todos' || m.filters.includes(filter),
  );

  const playClassic = () => {
    wakeServer();
    navigation.navigate('Create');
  };

  const joinClassic = () => {
    wakeServer();
    navigation.navigate('Join');
  };

  return (
    <View style={styles.root}>
      <Screen scroll style={styles.screenPad}>
        <Animated.View entering={FadeInUp.duration(480)} style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerSpacer} />
            <Pressable
              testID="home-more-button"
              accessibilityRole="button"
              accessibilityLabel={t('home.more')}
              onPress={() => setMoreOpen(true)}
              style={({ pressed }) => [styles.moreBtn, pressed && styles.pressed]}
            >
              <Text style={styles.moreGlyph}>☰</Text>
            </Pressable>
          </View>

          <GameLogo />

          <Text style={styles.hero}>
            <Text style={styles.heroWhite}>{t('home.heroA')}</Text>
            <Text style={styles.heroPink}>{t('home.heroPlay')}</Text>
            <Text style={styles.heroYellow}>{t('home.heroBang')}</Text>
          </Text>
          <Text style={styles.sub}>{t('home.sub')}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(420)} style={styles.primaryBlock}>
          <PrimaryPlayButton onPress={playClassic} />
          <Pressable
            testID="home-join-button"
            accessibilityRole="button"
            accessibilityLabel={t('home.cta.join')}
            onPress={() => {
              haptic();
              joinClassic();
            }}
            style={({ pressed }) => [styles.joinBtn, pressed && styles.pressed]}
          >
            <Text style={styles.joinLabel}>{t('home.cta.join')}</Text>
          </Pressable>
        </Animated.View>

        <Text style={styles.sectionLabel}>{t('home.modesTitle')}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.chipsScroll}
        >
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setFilter(f.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipIcon, active && styles.chipIconActive]}>
                  {f.icon}
                </Text>
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                  {t(`home.filter.${f.id}` as 'home.filter.todos')}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.list}>
          {visible.map((mode, index) => (
            <ModeCard key={mode.id} mode={mode} index={index} />
          ))}
        </View>
      </Screen>

      <MoreSheet
        visible={moreOpen}
        onClose={() => setMoreOpen(false)}
        onProfile={() => navigation.navigate('Profile')}
        onSettings={() => navigation.navigate('Settings')}
        onMoreGames={() => navigation.navigate('MoreGames')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B0614',
  },
  screenPad: {
    paddingBottom: 36,
  },
  header: {
    paddingTop: 2,
    alignItems: 'center',
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerSpacer: {
    flex: 1,
  },
  moreBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  moreGlyph: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: -2,
  },
  pressed: {
    opacity: 0.7,
  },
  hero: {
    marginTop: 18,
    fontFamily: fonts.display,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1.1,
    lineHeight: 40,
    textAlign: 'center',
  },
  heroWhite: { color: '#FFFFFF' },
  heroPink: { color: '#FF4DA6' },
  heroYellow: { color: '#FACC15' },
  sub: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(251,247,255,0.72)',
    textAlign: 'center',
  },
  primaryBlock: {
    marginTop: 22,
    gap: 10,
  },
  primaryCta: {
    borderRadius: 28,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    minHeight: 88,
    justifyContent: 'center',
  },
  primaryCtaLabel: {
    fontFamily: fonts.display,
    color: '#1A0A00',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  primaryCtaSub: {
    marginTop: 4,
    color: 'rgba(26,10,0,0.72)',
    fontSize: 13,
    fontWeight: '700',
  },
  joinBtn: {
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  joinLabel: {
    fontFamily: fonts.display,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  sectionLabel: {
    marginTop: 26,
    marginBottom: 10,
    fontFamily: fonts.display,
    color: 'rgba(251,247,255,0.78)',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  chipsScroll: {
    marginHorizontal: -4,
    marginBottom: 8,
  },
  chips: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: {
    backgroundColor: '#FACC15',
    borderColor: '#FACC15',
  },
  chipIcon: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  chipIconActive: {
    color: '#1A0A00',
  },
  chipLabel: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    fontWeight: '700',
  },
  chipLabelActive: {
    color: '#1A0A00',
  },
  list: {
    marginTop: 14,
    gap: 14,
  },
  card: {
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 18,
    minHeight: 108,
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FACC15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    zIndex: 2,
  },
  badgeCrown: {
    fontSize: 10,
    color: '#1A0A00',
  },
  badgeText: {
    color: '#1A0A00',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 30,
  },
  cardCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  cardTitle: {
    fontFamily: fonts.display,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  cardDesc: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  players: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
  },
  playPill: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    minWidth: 84,
    alignItems: 'center',
  },
  playLabel: {
    color: '#1A0A00',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
