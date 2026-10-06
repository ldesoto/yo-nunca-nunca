import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { GlassCard } from '../components/GlassCard';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { useGame } from '../GameContext';
import { useRoomState } from '../useRoomState';
import { useRoomConnection, markIntentionalLeave } from '../useRoomConnection';
import { track } from '../analytics';
import { feedback } from '../feedback';
import { stopBed } from '../audio';
import { colors, fonts, typography } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Play'>;

const EVENT_COPY: Record<string, { title: string; tint: string }> = {
  double_score: { title: '🔥 Doble puntuación esta ronda', tint: '#FF8A3D' },
  mortal: { title: '💀 Pregunta mortal · puntos x2.5', tint: '#FF5A7A' },
  nobody: { title: '😇 Nadie lo ha hecho', tint: '#C8FF4D' },
  everyone: { title: '😂 ¡Todos lo han hecho!', tint: '#FF2D95' },
};

function useCountdown(deadlineAt: number) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!deadlineAt) {
      setLeft(0);
      return;
    }
    const tick = () => {
      setLeft(Math.max(0, Math.ceil((deadlineAt - Date.now()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [deadlineAt]);
  return left;
}

export function PlayScreen({ navigation }: Props) {
  const { room, setRoom } = useGame();
  const snap = useRoomState(room);
  const conn = useRoomConnection(room, setRoom);
  const answerLeft = useCountdown(snap?.answerDeadlineAt ?? 0);
  const whoWasLeft = useCountdown(snap?.whoWasDeadlineAt ?? 0);
  const lastQuestion = useRef('');
  const lastReveal = useRef('');
  const lastPhaseFx = useRef('');
  const [reported, setReported] = useState(false);

  useEffect(() => {
    void stopBed();
  }, []);

  useEffect(() => {
    if (!snap) return;
    if (snap.phase === 'LOBBY') navigation.replace('Lobby');
    if (snap.phase === 'GAME_OVER') navigation.replace('GameOver');
  }, [snap?.phase, navigation]);

  useEffect(() => {
    if (!snap) return;
    const key = `${snap.phase}:${snap.questionId}`;
    if (lastPhaseFx.current === key) return;
    if (snap.phase === 'REVEAL') {
      lastPhaseFx.current = key;
      void feedback({ sfx: 'reveal', haptic: 'medium' });
    } else if (snap.phase === 'WHO_WAS') {
      lastPhaseFx.current = key;
      void feedback({ sfx: 'who', haptic: 'medium' });
    }
  }, [snap?.phase, snap?.questionId]);

  useEffect(() => {
    if (!snap?.questionId) return;
    if (
      (snap.phase === 'QUESTION' || snap.phase === 'WAITING_FOR_ANSWERS') &&
      lastQuestion.current !== snap.questionId
    ) {
      lastQuestion.current = snap.questionId;
      setReported(false);
      track('question_displayed', {
        round: snap.currentRound,
        custom: snap.questionId.startsWith('CUSTOM_') ? 1 : 0,
      });
    }
  }, [snap?.phase, snap?.questionId, snap?.currentRound]);

  useEffect(() => {
    if (!snap) return;
    if (snap.phase === 'REVEAL' && lastReveal.current !== snap.questionId) {
      lastReveal.current = snap.questionId;
      track('question_revealed', {
        round: snap.currentRound,
        yes: snap.yesCount,
        total: snap.totalAnswered,
      });
    }
  }, [snap?.phase, snap?.questionId, snap?.yesCount, snap?.totalAnswered, snap?.currentRound]);

  const goHome = () => {
    markIntentionalLeave();
    try {
      room?.leave();
    } catch {
      // ignore
    }
    setRoom(null);
    navigation.popToTop();
  };

  if (!room || !snap) {
    return (
      <Screen>
        <ConnectionBanner
          status={conn === 'online' ? 'connecting' : conn}
          detail="Cargando estado de la partida…"
          onGoHome={goHome}
        />
        <Text style={typography.body}>Cargando partida…</Text>
      </Screen>
    );
  }

  const me = snap.players.find((p) => p.sessionId === snap.mySessionId);
  const answered = Boolean(me?.hasAnswered);
  const eventKey = snap.activeEvent || snap.specialEvent;
  const eventInfo = EVENT_COPY[eventKey];

  if (snap.phase === 'WHO_WAS') {
    const canVote = Boolean(me?.canVoteWhoWas) && !me?.hasVotedWhoWas;
    const candidates = snap.players.filter(
      (p) => p.connected && p.sessionId !== snap.mySessionId,
    );
    return (
      <Screen scroll>
        <ConnectionBanner status={conn} onGoHome={goHome} />
        <Text style={typography.kicker} testID="who-was-kicker">
          RONDA {snap.currentRound}/{snap.totalRounds}
        </Text>
        <Animated.Text entering={FadeInUp} style={styles.whoTitle}>
          ¿Quién lo ha hecho?
        </Animated.Text>
        <Text style={styles.whoSub}>
          {me?.canVoteWhoWas
            ? 'Tú dijiste NUNCA. Acierta y ganas +60 pts.'
            : 'Los demás están adivinando… tú ya sabes 😏'}
        </Text>
        <Text style={styles.timer} testID="who-was-timer">
          {whoWasLeft}s
        </Text>

        {canVote ? (
          candidates.length === 0 ? (
            <GlassCard glow="cyan" style={{ marginTop: 18 }}>
              <Text style={styles.waiting}>No hay otros jugadores conectados para votar.</Text>
              <Text style={styles.voteMeta}>Esperando fin de fase…</Text>
            </GlassCard>
          ) : (
            <View style={{ marginTop: 12, gap: 10 }} testID="who-was-candidates">
              {candidates.map((p, i) => (
                <Animated.View key={p.sessionId} entering={FadeInDown.delay(i * 50)}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Votar por ${p.name}`}
                    testID={`who-was-vote-${p.sessionId}`}
                    onPress={() =>
                      room.send('voteWhoWas', { targetSessionId: p.sessionId })
                    }
                    style={({ pressed }) => [
                      styles.voteBtn,
                      pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                    ]}
                  >
                    <Text style={styles.voteName}>{p.name}</Text>
                    <Text style={styles.voteCta}>Votar</Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          )
        ) : (
          <GlassCard glow="cyan" style={{ marginTop: 18 }} testID="who-was-waiting">
            <Text style={styles.waiting}>
              {me?.hasVotedWhoWas
                ? 'Voto enviado. Esperando al resto…'
                : 'Esperando votos…'}
            </Text>
            <Text style={styles.voteMeta}>
              {snap.whoWasVotesCast} voto{snap.whoWasVotesCast === 1 ? '' : 's'}
            </Text>
          </GlassCard>
        )}
      </Screen>
    );
  }

  if (snap.phase === 'SCORE') {
    return (
      <Screen>
        <ConnectionBanner status={conn} onGoHome={goHome} />
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
        <ConnectionBanner status={conn} onGoHome={goHome} />
        <Text style={typography.kicker}>
          RONDA {snap.currentRound}/{snap.totalRounds}
        </Text>
        <Animated.Text entering={FadeInUp} style={styles.revealTitle}>
          {snap.yesCount} de {snap.totalAnswered} lo han hecho
        </Animated.Text>
        {EVENT_COPY[snap.specialEvent] ? (
          <Text style={[styles.special, { color: EVENT_COPY[snap.specialEvent]!.tint }]}>
            {EVENT_COPY[snap.specialEvent]!.title}
          </Text>
        ) : null}
        <View style={{ marginTop: 22, gap: 10 }}>
          {snap.revealedYesNames.length === 0 ? (
            <Text style={styles.waiting}>Revelando…</Text>
          ) : (
            snap.revealedYesNames.map((name, i) => (
              <Animated.View key={`${name}-${i}`} entering={ZoomIn.delay(i * 40)}>
                <GlassCard glow="pink" style={styles.revealCard}>
                  <Text style={styles.revealed}>{name}</Text>
                </GlassCard>
              </Animated.View>
            ))
          )}
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ConnectionBanner status={conn} onGoHome={goHome} />
      <View style={styles.top}>
        <View style={styles.topRow}>
          <Text style={typography.kicker}>
            RONDA {snap.currentRound} / {snap.totalRounds}
          </Text>
          {snap.phase === 'WAITING_FOR_ANSWERS' && answerLeft > 0 ? (
            <Text style={styles.timerChip}>{answerLeft}s</Text>
          ) : null}
        </View>
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

      {eventInfo && snap.activeEvent !== 'none' ? (
        <GlassCard
          glow="pink"
          style={[styles.eventBanner, { borderColor: eventInfo.tint }]}
        >
          <Text style={[styles.eventText, { color: eventInfo.tint }]}>
            {eventInfo.title}
          </Text>
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
            onPress={() => {
              track('answer_submitted', { round: snap.currentRound });
              room.send('submitAnswer', { choice: 'never' });
            }}
          />
          <PartyButton
            label="SÍ, LO HE HECHO"
            variant="yes"
            onPress={() => {
              track('answer_submitted', { round: snap.currentRound });
              room.send('submitAnswer', { choice: 'did' });
            }}
          />
        </View>
      )}

      <Pressable
        onPress={() => {
          if (reported || !snap.questionId) return;
          Alert.alert('Reportar pregunta', '¿Marcar esta pregunta como inapropiada?', [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Reportar',
              style: 'destructive',
              onPress: () => {
                room.send('reportQuestion', {
                  questionId: snap.questionId,
                  reason: 'inappropriate',
                });
                setReported(true);
                track('question_reported', {
                  custom: snap.questionId.startsWith('CUSTOM_') ? 1 : 0,
                });
              },
            },
          ]);
        }}
        style={styles.reportBtn}
        disabled={reported}
      >
        <Text style={styles.reportLabel}>
          {reported ? 'Reportada' : 'Reportar pregunta'}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { marginBottom: 8 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerChip: {
    color: colors.neonCyan,
    fontWeight: '900',
    fontSize: 14,
    fontFamily: fonts.display,
  },
  progressTrack: {
    height: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: { height: '100%', backgroundColor: colors.neonPink },
  eventBanner: { marginBottom: 12, paddingVertical: 12 },
  eventText: { fontWeight: '800', textAlign: 'center', fontSize: 15 },
  qCard: { marginTop: 6, minHeight: 220, justifyContent: 'center' },
  question: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    fontFamily: fonts.display,
  },
  eyes: { fontSize: 34, marginTop: 18, textAlign: 'center' },
  waiting: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 28,
    fontSize: 16,
    fontWeight: '600',
  },
  whoTitle: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    marginTop: 10,
    fontFamily: fonts.display,
    letterSpacing: -0.8,
  },
  whoSub: {
    color: colors.muted,
    marginTop: 8,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },
  timer: {
    marginTop: 14,
    color: colors.neonPink,
    fontSize: 28,
    fontWeight: '900',
    fontFamily: fonts.display,
  },
  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,45,149,0.4)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  voteName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  voteCta: {
    color: colors.neonPink,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  voteMeta: {
    marginTop: 10,
    textAlign: 'center',
    color: colors.neonCyan,
    fontWeight: '700',
  },
  revealTitle: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    marginTop: 12,
    fontFamily: fonts.display,
  },
  special: {
    fontWeight: '800',
    marginTop: 10,
    fontSize: 17,
  },
  revealCard: { paddingVertical: 14 },
  revealed: {
    color: colors.neonPink,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  rankName: { color: colors.text, fontSize: 18, fontWeight: '700' },
  rankScore: { color: colors.neonLime, fontSize: 18, fontWeight: '900' },
  reportBtn: {
    marginTop: 20,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  reportLabel: {
    color: 'rgba(251,247,255,0.4)',
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
