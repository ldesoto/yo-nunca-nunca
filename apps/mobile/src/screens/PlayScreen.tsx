import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { GlassCard } from '../components/GlassCard';
import { useGame } from '../GameContext';
import { useRoomState } from '../useRoomState';
import { colors, typography } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Play'>;

const EVENT_COPY: Record<string, string> = {
  double_score: '🔥 Doble puntuación',
  mortal: '💀 Pregunta mortal',
  nobody: '😇 Nadie lo ha hecho',
  everyone: '😂 ¡Todos lo han hecho!',
};

export function PlayScreen({ navigation }: Props) {
  const { room } = useGame();
  const snap = useRoomState(room);

  useEffect(() => {
    if (!snap) return;
    if (snap.phase === 'LOBBY') navigation.replace('Lobby');
    if (snap.phase === 'GAME_OVER') navigation.replace('GameOver');
  }, [snap?.phase, navigation]);

  useEffect(() => {
    if (snap?.phase === 'REVEAL') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [snap?.phase, snap?.revealedYesNames.length]);

  if (!room || !snap) {
    return (
      <Screen>
        <Text style={typography.body}>Cargando partida…</Text>
      </Screen>
    );
  }

  const me = snap.players.find((p) => p.sessionId === snap.mySessionId);
  const answered = Boolean(me?.hasAnswered);
  const eventKey = snap.activeEvent || snap.specialEvent;

  if (snap.phase === 'SCORE') {
    return (
      <Screen>
        <Text style={typography.kicker}>RANKING EN VIVO</Text>
        <GlassCard glow="cyan" style={{ marginTop: 12 }}>
          {snap.players.map((p, i) => (
            <Animated.View
              key={p.sessionId}
              entering={FadeInDown.delay(i * 70)}
              style={styles.rankRow}
            >
              <Text style={styles.rankName}>
                {i + 1}. {p.name}
              </Text>
              <Text style={styles.rankScore}>{p.score}</Text>
            </Animated.View>
          ))}
        </GlassCard>
      </Screen>
    );
  }

  if (snap.phase === 'REVEAL') {
    return (
      <Screen>
        <Text style={typography.kicker}>
          RONDA {snap.currentRound}/{snap.totalRounds}
        </Text>
        <Animated.Text entering={FadeInUp} style={styles.revealTitle}>
          {snap.yesCount} de {snap.totalAnswered} lo han hecho
        </Animated.Text>
        {EVENT_COPY[snap.specialEvent] ? (
          <Text style={styles.special}>{EVENT_COPY[snap.specialEvent]}</Text>
        ) : null}
        <View style={{ marginTop: 22, gap: 10 }}>
          {snap.revealedYesNames.map((name, i) => (
            <Animated.View key={`${name}-${i}`} entering={ZoomIn.delay(i * 40)}>
              <GlassCard glow="pink" style={styles.revealCard}>
                <Text style={styles.revealed}>{name}</Text>
              </GlassCard>
            </Animated.View>
          ))}
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.top}>
        <Text style={typography.kicker}>
          RONDA {snap.currentRound} / {snap.totalRounds}
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(
                  100,
                  (snap.currentRound / Math.max(1, snap.totalRounds)) * 100,
                )}%`,
              },
            ]}
          />
        </View>
      </View>

      {EVENT_COPY[eventKey] ? (
        <GlassCard glow="pink" style={styles.eventBanner}>
          <Text style={styles.eventText}>{EVENT_COPY[eventKey]}</Text>
        </GlassCard>
      ) : null}

      <GlassCard glow="cyan" style={styles.qCard}>
        <Animated.Text entering={FadeInUp} style={styles.question}>
          {snap.questionText || '…'}
        </Animated.Text>
        <Text style={styles.eyes}>👀</Text>
      </GlassCard>

      {answered ? (
        <Text style={styles.waiting}>Esperando al resto…</Text>
      ) : (
        <View style={{ marginTop: 18 }}>
          <PartyButton
            label="NUNCA"
            variant="never"
            onPress={() => room.send('submitAnswer', { choice: 'never' })}
          />
          <PartyButton
            label="SÍ, LO HE HECHO"
            variant="yes"
            onPress={() => room.send('submitAnswer', { choice: 'did' })}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { marginBottom: 8 },
  progressTrack: {
    height: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: { height: '100%', backgroundColor: colors.neonPink },
  eventBanner: { marginBottom: 12, paddingVertical: 12 },
  eventText: { color: colors.text, fontWeight: '800', textAlign: 'center' },
  qCard: { marginTop: 6, minHeight: 220, justifyContent: 'center' },
  question: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  eyes: { fontSize: 34, marginTop: 18, textAlign: 'center' },
  waiting: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 28,
    fontSize: 16,
    fontWeight: '600',
  },
  revealTitle: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    marginTop: 12,
  },
  special: {
    color: colors.neonLime,
    fontWeight: '800',
    marginTop: 10,
    fontSize: 18,
  },
  revealCard: { paddingVertical: 14 },
  revealed: { color: colors.neonPink, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  rankName: { color: colors.text, fontSize: 18, fontWeight: '700' },
  rankScore: { color: colors.neonLime, fontSize: 18, fontWeight: '900' },
});
