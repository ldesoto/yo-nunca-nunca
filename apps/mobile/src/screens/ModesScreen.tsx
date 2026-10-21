import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { colors, fonts } from '../theme';
import { t } from '../i18n';
import { wakeServer } from '../api';
import { FadeIn, AnimatedPress } from '../motion';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Modes'>;
type FilterId = 'todos' | 'jugadores' | 'beber' | 'rapido' | 'picante';

type GameMode = {
  id: string;
  testId: string;
  title: string;
  description: string;
  icon: string;
  players: string;
  filters: FilterId[];
  gradient: [string, string, ...string[]];
  onPlay: () => void;
};

const FILTERS: { id: FilterId; icon: string }[] = [
  { id: 'todos', icon: '✦' },
  { id: 'jugadores', icon: '👥' },
  { id: 'beber', icon: '🥂' },
  { id: 'rapido', icon: '⚡' },
  { id: 'picante', icon: '🔥' },
];

/** Lista de modos locales (equivalente a "Niveles" en la guía). */
export function ModesScreen({ navigation }: Props) {
  const [filter, setFilter] = useState<FilterId>('todos');

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
        onPlay: () => navigation.navigate('TwoTruths'),
      },
    ],
    [navigation],
  );

  const visible = modes.filter(
    (m) => filter === 'todos' || m.filters.includes(filter),
  );

  return (
    <Screen>
      <View style={styles.header}>
        <View accessibilityRole="header" style={{ flex: 1 }}>
          <Text style={styles.title}>{t('home.modes')}</Text>
        </View>
        <AnimatedPress
          label={t('common.back')}
          onPress={() => navigation.goBack()}
          style={styles.closeBtn}
        >
          <Text style={styles.closeGlyph}>✕</Text>
        </AnimatedPress>
      </View>

      <FadeIn index={0} style={{ marginBottom: 12 }}>
        <View testID="home-join-button">
          <AnimatedPress
            label={t('home.cta.join')}
            onPress={() => {
              wakeServer();
              navigation.navigate('Join');
            }}
            style={styles.joinPill}
          >
            <Text style={styles.joinLabel}>{t('home.cta.join')}</Text>
          </AnimatedPress>
        </View>
      </FadeIn>

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
              accessibilityRole="button"
              accessibilityLabel={t(`home.filter.${f.id}` as 'home.filter.todos')}
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

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {visible.map((mode, index) => (
          <FadeIn key={mode.id} index={index}>
            <AnimatedPress
              label={mode.title}
              onPress={mode.onPlay}
              style={{ borderRadius: 28, overflow: 'hidden' }}
            >
              <View testID={mode.testId}>
                <LinearGradient
                  colors={mode.gradient}
                  start={{ x: 0, y: 0.2 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.card}
                >
                  <Text style={styles.icon}>{mode.icon}</Text>
                  <View style={styles.cardCopy}>
                    <Text style={styles.cardTitle}>{mode.title}</Text>
                    <Text style={styles.cardDesc}>{mode.description}</Text>
                    <Text style={styles.players}>{mode.players}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </LinearGradient>
              </View>
            </AnimatedPress>
          </FadeIn>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.display,
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  closeBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
  },
  closeGlyph: { color: colors.text, fontSize: 22 },
  joinPill: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
  },
  joinLabel: {
    fontFamily: fonts.display,
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  chipsScroll: { marginHorizontal: -4, marginBottom: 8, maxHeight: 52 },
  chips: { paddingVertical: 4, paddingHorizontal: 4, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipIcon: { fontSize: 12, color: colors.muted },
  chipIconActive: { color: colors.ink },
  chipLabel: { color: colors.text, fontSize: 13, fontWeight: '700' },
  chipLabelActive: { color: colors.ink },
  list: { gap: 12, paddingBottom: 28 },
  card: {
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 18,
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: { fontSize: 30 },
  cardCopy: { flex: 1, minWidth: 0 },
  cardTitle: {
    fontFamily: fonts.display,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  cardDesc: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    lineHeight: 16,
  },
  players: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
  },
  chevron: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
});
