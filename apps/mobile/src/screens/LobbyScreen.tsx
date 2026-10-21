import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  CUSTOM_QUESTION_REASON_LABEL,
  sanitizeCustomQuestion,
} from '@ynn/shared';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { Field, GlassCard, SectionLabel } from '../components/GlassCard';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { useGame } from '../GameContext';
import { useRoomState } from '../useRoomState';
import { useRoomConnection, markIntentionalLeave } from '../useRoomConnection';
import { track } from '../analytics';
import { feedback } from '../feedback';
import { colors, fonts, typography } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Lobby'>;

export function LobbyScreen({ navigation }: Props) {
  const { room, roomCode, setRoom } = useGame();
  const snap = useRoomState(room);
  const conn = useRoomConnection(room, setRoom);
  const [custom, setCustom] = useState('');
  const [customHint, setCustomHint] = useState('');
  const [customError, setCustomError] = useState(false);
  const startedTracked = useRef(false);
  const lastCustomCount = useRef(0);

  useEffect(() => {
    if (!snap) return;
    if (
      snap.phase === 'QUESTION' ||
      snap.phase === 'WAITING_FOR_ANSWERS' ||
      snap.phase === 'REVEAL' ||
      snap.phase === 'SCORE' ||
      snap.phase === 'WHO_WAS'
    ) {
      if (!startedTracked.current) {
        startedTracked.current = true;
        track('game_started', {
          players: snap.players.length,
          rounds: snap.totalRounds,
          mode: snap.mode,
          custom: snap.customCount,
        });
      }
      navigation.replace('Play');
    }
    if (snap.phase === 'GAME_OVER') navigation.replace('GameOver');
  }, [snap?.phase, navigation]);

  useEffect(() => {
    if (!snap) return;
    if (snap.customCount > lastCustomCount.current) {
      setCustomHint(
        snap.customCount === 1
          ? '1 pregunta personalizada lista para la partida'
          : `${snap.customCount} preguntas personalizadas listas`,
      );
      setCustomError(false);
      lastCustomCount.current = snap.customCount;
    }
  }, [snap?.customCount]);

  useEffect(() => {
    if (!room) return;
    let alive = true;
    room.onMessage(
      'customQuestionResult',
      (msg: { ok?: boolean; reason?: string; count?: number }) => {
        if (!alive) return;
        if (msg?.ok) {
          const n =
            typeof msg.count === 'number' ? msg.count : lastCustomCount.current + 1;
          setCustomHint(
            n === 1
              ? '1 pregunta personalizada lista para la partida'
              : `${n} preguntas personalizadas listas`,
          );
          setCustomError(false);
          return;
        }
        const reason = msg?.reason;
        const map: Record<string, string> = {
          too_short: CUSTOM_QUESTION_REASON_LABEL.too_short,
          too_long: CUSTOM_QUESTION_REASON_LABEL.too_long,
          offensive: CUSTOM_QUESTION_REASON_LABEL.offensive,
          blocked: CUSTOM_QUESTION_REASON_LABEL.blocked,
          limit: 'Máximo 20 preguntas personalizadas por partida',
          not_lobby: 'Solo se pueden añadir en el lobby',
        };
        setCustomHint(map[reason || ''] || 'No se pudo añadir. Intenta de nuevo.');
        setCustomError(true);
      },
    );
    return () => {
      alive = false;
    };
  }, [room]);

  if (!room || !snap) {
    return (
      <Screen>
        <ConnectionBanner
          status={conn === 'online' ? 'connecting' : conn}
          detail="Entrando a la sala…"
          onGoHome={() => {
            markIntentionalLeave();
            setRoom(null);
            navigation.popToTop();
          }}
        />
        <Text style={typography.title}>Conectando…</Text>
      </Screen>
    );
  }

  const me = snap.players.find((p) => p.sessionId === snap.mySessionId);
  const isHost = me?.isHost;
  const code = snap.roomCode || roomCode;

  const addCustom = () => {
    setCustomError(false);
    const result = sanitizeCustomQuestion(custom);
    if (!result.ok) {
      setCustomHint(CUSTOM_QUESTION_REASON_LABEL[result.reason]);
      setCustomError(true);
      return;
    }
    if (snap.customCount >= 20) {
      setCustomHint('Máximo 20 preguntas personalizadas por partida');
      setCustomError(true);
      return;
    }
    try {
      room.send('addCustomQuestion', { text: result.text });
      setCustom('');
      setCustomHint('Enviando…');
      setCustomError(false);
      track('custom_question_created', { len: result.text.length });
      void feedback({ sfx: 'tap', haptic: 'success' });
    } catch {
      setCustomHint('No se pudo añadir. Intenta de nuevo.');
      setCustomError(true);
    }
  };

  const pulseCode = () => {
    void feedback({ sfx: 'tap', haptic: 'success' });
  };

  const goHome = () => {
    markIntentionalLeave();
    try {
      room.leave();
    } catch {
      // ignore
    }
    setRoom(null);
    navigation.popToTop();
  };

  return (
    <Screen scroll>
      <ConnectionBanner status={conn} onGoHome={goHome} />
      <Animated.View entering={FadeIn}>
        <Text style={styles.kicker}>COMPARTE ESTE CÓDIGO</Text>
        <Pressable onPress={pulseCode}>
          <GlassCard glow="pink" style={styles.codeCard}>
            <Text style={styles.code} selectable>
              {code}
            </Text>
            <Text style={styles.meta}>
              {snap.players.length} jugadores · {snap.totalRounds} rondas
              {snap.mode === 'parejas' ? ' · parejas' : ' · fiesta'}
            </Text>
          </GlassCard>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60)}>
        <Text style={styles.section}>Jugadores</Text>
        <FlatList
          data={snap.players}
          keyExtractor={(p) => p.sessionId}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={[styles.avatar, item.isHost && styles.avatarHost]}>
                <Text style={styles.avatarText}>{item.name.slice(0, 1).toUpperCase()}</Text>
              </View>
              <Text style={styles.name}>
                {item.name}
                {item.isHost ? ' · host' : ''}
                {!item.connected ? ' · offline' : ''}
              </Text>
              <Text style={[styles.ready, !item.ready && { color: colors.muted }]}>
                {item.ready ? 'LISTO' : '…'}
              </Text>
            </View>
          )}
        />

        <GlassCard style={{ marginTop: 12 }}>
          <SectionLabel>Pregunta personalizada</SectionLabel>
          <Text style={styles.customHelp}>
            Escribe algo de la noche. Se mezclará solo en esta partida.
          </Text>
          <Field
            value={custom}
            onChangeText={setCustom}
            placeholder="Ej. he fingido no ver un mensaje"
            maxLength={140}
          />
          {customHint ? (
            <Text style={[styles.hint, customError && styles.hintError]}>{customHint}</Text>
          ) : null}
          {snap.customCount > 0 ? (
            <Text style={styles.customCount}>
              {snap.customCount} en el mazo de esta partida
            </Text>
          ) : null}
          <PartyButton label="AÑADIR A LA PARTIDA" variant="orange" onPress={addCustom} />
        </GlassCard>
      </Animated.View>

      <View style={{ marginTop: 12, marginBottom: 24 }}>
        <PartyButton
          label={me?.ready ? 'NO ESTOY LISTO' : 'ESTOY LISTO'}
          variant="ghost"
          onPress={() => room.send('setReady', { ready: !me?.ready })}
        />
        {isHost ? (
          <PartyButton label="INICIAR PARTIDA" onPress={() => room.send('startGame')} />
        ) : (
          <Text style={styles.wait}>Esperando al host…</Text>
        )}
        <PartyButton label="Salir de la sala" variant="ghost" onPress={goHome} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.2,
    color: colors.neonPink,
    textAlign: 'center',
  },
  codeCard: { marginTop: 10, alignItems: 'center', paddingVertical: 22 },
  code: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: 10,
    fontFamily: fonts.display,
    textShadowColor: 'rgba(255,45,149,0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  meta: { color: 'rgba(255,255,255,0.75)', marginTop: 8, fontWeight: '600' },
  section: {
    marginTop: 16,
    marginBottom: 6,
    color: colors.muted,
    fontWeight: '800',
    letterSpacing: 1.2,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  avatarHost: {
    backgroundColor: colors.neonPinkSoft,
    borderColor: colors.strokeHot,
  },
  avatarText: { color: '#FFFFFF', fontWeight: '900' },
  name: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', flex: 1 },
  ready: { color: colors.neonLime, fontWeight: '800', fontSize: 12 },
  wait: { color: colors.muted, textAlign: 'center', marginTop: 10 },
  customHelp: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
  },
  hint: { color: colors.neonCyan, marginTop: 8, marginBottom: 4, fontWeight: '600' },
  hintError: { color: colors.danger },
  customCount: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 13,
  },
});
