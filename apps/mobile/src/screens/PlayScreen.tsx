import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { useGame } from '../GameContext';
import { useRoomState } from '../useRoomState';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Play'>;

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
        <Text style={styles.muted}>Cargando partida…</Text>
      </Screen>
    );
  }

  const me = snap.players.find((p) => p.sessionId === snap.mySessionId);
  const answered = Boolean(me?.hasAnswered);

  if (snap.phase === 'SCORE') {
    return (
      <Screen>
        <Animated.Text entering={ZoomIn} style={styles.round}>
          RANKING
        </Animated.Text>
        {snap.players.map((p, i) => (
          <Animated.View
            key={p.sessionId}
            entering={FadeInDown.delay(i * 80)}
            style={styles.rankRow}
          >
            <Text style={styles.rankName}>
              {i + 1}. {p.name}
            </Text>
            <Text style={styles.rankScore}>{p.score}</Text>
          </Animated.View>
        ))}
      </Screen>
    );
  }

  if (snap.phase === 'REVEAL') {
    return (
      <Screen>
        <Text style={styles.round}>
          RONDA {snap.currentRound}/{snap.totalRounds}
        </Text>
        <Animated.Text entering={FadeInUp} style={styles.revealTitle}>
          {snap.yesCount} de {snap.totalAnswered} lo han hecho
        </Animated.Text>
        {snap.specialEvent === 'nobody' ? (
          <Text style={styles.special}>Nadie lo ha hecho</Text>
        ) : null}
        {snap.specialEvent === 'everyone' ? (
          <Text style={styles.special}>¡Todos lo han hecho!</Text>
        ) : null}
        <View style={{ marginTop: 24, gap: 10 }}>
          {snap.revealedYesNames.map((name, i) => (
            <Animated.Text
              key={`${name}-${i}`}
              entering={ZoomIn.delay(i * 50)}
              style={styles.revealed}
            >
              {name}
            </Animated.Text>
          ))}
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.round}>
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
      <Animated.Text entering={FadeInUp} style={styles.question}>
        {snap.questionText || '…'}
      </Animated.Text>
      <Text style={styles.eyes}>👀</Text>
      {answered ? (
        <Text style={styles.waiting}>Esperando al resto…</Text>
      ) : (
        <View style={{ marginTop: 20 }}>
          <PartyButton
            label="NUNCA"
            variant="never"
            onPress={() => {
              void Haptics.selectionAsync();
              room.send('submitAnswer', { choice: 'never' });
            }}
          />
          <PartyButton
            label="SÍ, LO HE HECHO"
            variant="yes"
            onPress={() => {
              void Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              room.send('submitAnswer', { choice: 'did' });
            }}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.muted },
  round: {
    color: colors.neonCyan,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },
  progressTrack: {
    height: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    marginBottom: 22,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.neonPink,
  },
  question: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  eyes: { fontSize: 36, marginTop: 18, textAlign: 'center' },
  waiting: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 28,
    fontSize: 16,
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
  revealed: {
    color: colors.neonPink,
    fontSize: 24,
    fontWeight: '800',
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  rankName: { color: colors.text, fontSize: 18, fontWeight: '700' },
  rankScore: { color: colors.neonLime, fontSize: 18, fontWeight: '900' },
});
