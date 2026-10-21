import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { wakeServer } from '../api';
import { fonts } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type FilterId = 'todos' | 'jugadores' | 'beber' | 'rapido' | 'picante';

type GameMode = {
  id: string;
  title: string;
  description: string;
  icon: string;
  players: string;
  badge?: string;
  filters: FilterId[];
  gradient: [string, string, ...string[]];
  ctaGradient: [string, string];
  onPlay: () => void;
  onJoin?: () => void;
  playLabel?: string;
};

const FILTERS: { id: FilterId; label: string; icon: string }[] = [
  { id: 'todos', label: 'Todos', icon: '✦' },
  { id: 'jugadores', label: 'Jugadores', icon: '👥' },
  { id: 'beber', label: 'Beber', icon: '🥂' },
  { id: 'rapido', label: 'Rápido', icon: '⚡' },
  { id: 'picante', label: 'Picante', icon: '🔥' },
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
  const hasExtras = Boolean(mode.onJoin);

  return (
    <Animated.View
      entering={FadeInDown.delay(60 + index * 70).duration(420)}
      style={anim}
    >
        <LinearGradient
          colors={mode.gradient}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, hasExtras && styles.cardTall]}
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

            {!hasExtras ? (
              <Pressable
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
                  colors={mode.ctaGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.playPill}
                >
                  <Text style={styles.playLabel}>{mode.playLabel ?? 'JUGAR →'}</Text>
                </LinearGradient>
              </Pressable>
            ) : null}
          </View>

          {hasExtras ? (
            <View style={styles.actionRow}>
              <Pressable
                onPress={() => {
                  haptic();
                  mode.onJoin!();
                }}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.secondaryLabel}>Unirse</Text>
              </Pressable>
              <Pressable
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
                style={{ flex: 1.2 }}
              >
                <LinearGradient
                  colors={mode.ctaGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryPill}
                >
                  <Text style={styles.playLabel}>{mode.playLabel ?? 'Crear →'}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          ) : null}
        </LinearGradient>
    </Animated.View>
  );
}

export function HomeScreen({ navigation }: Props) {
  const [filter, setFilter] = useState<FilterId>('todos');

  const modes: GameMode[] = useMemo(
    () => [
      {
        id: 'ynn',
        title: 'Yo Nunca Nunca',
        description: 'Confiesa tus secretos. Online con amigos.',
        icon: '🤞',
        players: '3–12 jugadores',
        badge: 'EL CLÁSICO',
        filters: ['todos', 'jugadores', 'beber', 'picante'],
        gradient: ['#7C3AED', '#DB2777', '#F472B6'],
        ctaGradient: ['#FDE047', '#FBBF24'],
        playLabel: 'Crear →',
        onPlay: () => {
          wakeServer();
          navigation.navigate('Create');
        },
        onJoin: () => {
          wakeServer();
          navigation.navigate('Join');
        },
      },
      {
        id: 'tod',
        title: 'Verdad o Bebida',
        description: '¿Respondes… o te tomas el trago?',
        icon: '🥃',
        players: '3+ jugadores',
        filters: ['todos', 'beber', 'picante'],
        gradient: ['#EA580C', '#DC2626', '#F97316'],
        ctaGradient: ['#FDE68A', '#F59E0B'],
        onPlay: () => navigation.navigate('TruthOrDrink'),
      },
      {
        id: 'charades',
        title: 'Charadas',
        description: 'Teléfono en la frente. Inclina para acertar.',
        icon: '😎',
        players: '2+ jugadores',
        filters: ['todos', 'jugadores', 'rapido'],
        gradient: ['#059669', '#10B981', '#34D399'],
        ctaGradient: ['#A7F3D0', '#6EE7B7'],
        onPlay: () => navigation.navigate('Charades'),
      },
      {
        id: 'bomb',
        title: 'La Bomba',
        description: 'Cultura chupística. Que no te explote.',
        icon: '💣',
        players: '3+ jugadores',
        filters: ['todos', 'beber', 'rapido'],
        gradient: ['#1D4ED8', '#2563EB', '#38BDF8'],
        ctaGradient: ['#BAE6FD', '#7DD3FC'],
        onPlay: () => navigation.navigate('Bomb'),
      },
      {
        id: 'most',
        title: '¿Quién es más probable?',
        description: 'Señala al culpable de cada situación.',
        icon: '🫵',
        players: '3+ jugadores',
        filters: ['todos', 'jugadores', 'picante'],
        gradient: ['#C2410C', '#EA580C', '#FB923C'],
        ctaGradient: ['#FED7AA', '#FDBA74'],
        onPlay: () => navigation.navigate('MostLikely'),
      },
      {
        id: 'truths',
        title: '2 verdades, 1 mentira',
        description: 'Adivina quién miente en la mesa.',
        icon: '🎭',
        players: '3+ jugadores',
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

  return (
    <View style={styles.root}>
      <Screen scroll style={styles.screenPad}>
        <Animated.View entering={FadeInUp.duration(480)} style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.brandRow}>
              <Text style={styles.brand}>EL CORO</Text>
              <Text style={styles.brandCrown}>♛</Text>
            </View>
          </View>

          <View style={styles.heroRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.hero}>
                <Text style={styles.heroWhite}>¡A </Text>
                <Text style={styles.heroPink}>jugar</Text>
                <Text style={styles.heroYellow}>!</Text>
              </Text>
              <Text style={styles.sub}>Elige un modo y empieza la noche</Text>
            </View>
            <View style={styles.heroCrownWrap}>
              <LinearGradient
                colors={['#FDE047', '#F59E0B', '#EA580C']}
                style={styles.heroCrown}
              >
                <Text style={styles.heroCrownGlyph}>♛</Text>
              </LinearGradient>
            </View>
          </View>
        </Animated.View>

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
                  {f.label}
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

      <View style={styles.tabBar}>
        <View style={styles.tabItemActive}>
          <Text style={styles.tabIconActive}>⌂</Text>
          <Text style={styles.tabLabelActive}>Inicio</Text>
        </View>
        <Pressable
          style={styles.tabItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.tabIcon}>🏆</Text>
          <Text style={styles.tabLabel}>Perfil</Text>
        </Pressable>
        <Pressable
          style={styles.tabItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.tabIcon}>⚙</Text>
          <Text style={styles.tabLabel}>Ajustes</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B0614',
  },
  screenPad: {
    paddingBottom: 108,
  },
  header: {
    paddingTop: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  brand: {
    fontFamily: fonts.display,
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandCrown: {
    marginTop: -2,
    color: '#FACC15',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  hero: {
    fontFamily: fonts.display,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1.2,
    lineHeight: 44,
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
  },
  heroCrownWrap: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCrown: {
    width: 78,
    height: 78,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '12deg' }],
  },
  heroCrownGlyph: {
    fontSize: 40,
    color: '#1A0A00',
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
  cardTall: {
    minHeight: 148,
    paddingBottom: 14,
  },
  actionRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
  },
  secondaryLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  primaryPill: {
    paddingVertical: 11,
    borderRadius: 999,
    alignItems: 'center',
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
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    height: 68,
    borderRadius: 28,
    backgroundColor: 'rgba(18,10,32,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    alignItems: 'center',
    gap: 2,
    minWidth: 88,
    opacity: 0.55,
  },
  tabItemActive: {
    alignItems: 'center',
    gap: 2,
    minWidth: 88,
  },
  tabIcon: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  tabIconActive: {
    fontSize: 18,
    color: '#C084FC',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
  },
  tabLabelActive: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C084FC',
  },
});
