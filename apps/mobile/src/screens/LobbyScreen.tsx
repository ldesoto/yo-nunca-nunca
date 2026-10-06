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
import { stopBed } from '../audio';
import { useAmbientMusic } from '../useAmbientMusic';
import { colors, fonts, typography } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Lobby'>;

export function LobbyScreen({ navigation }: Props) {
  const { room, roomCode, setRoom } = useGame();
  const snap = useRoomState(room);
  const conn = useRoomConnection(room, setRoom);
  const [custom, setCustom] = useState('');
  const [customHint, setCustomHint] = useState('');
  const startedTracked = useRef(false);
  useAmbientMusic();

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
      void stopBed();
      navigation.replace('Play');
    }
    if (snap.phase === 'GAME_OVER') navigation.replace('GameOver');
  }, [snap?.phase, navigation]);

  if (!room || !snap) {
    return (
      <Screen>
        <ConnectionBanner
          status={conn === 'online' ? 'connecting' : conn}
          detail="Esperando estado de la sala…"
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
    const result = sanitizeCustomQuestion(custom);
    if (!result.ok) {
      setCustomHint(CUSTOM_QUESTION_REASON_LABEL[result.reason]);
      return;
    }
    room.send('addCustomQuestion', { text: result.text });
    setCustom('');
    setCustomHint('Añadida solo para esta partida');
    track('custom_question_created', { len: result.text.length });
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
    <Screen>
      <ConnectionBanner status={conn} onGoHome={goHome} />
      <Animated.View entering={FadeIn}>
        <Text style={styles.kicker}>COMPARTE ESTE CÓDIGO</Text>
        <Pressable onPress={pulseCode}>
          <GlassCard glow="pink" style={styles.codeCard}>
            <Text style={styles.code}>{code}</Text>
            <Text style={styles.meta}>
              {snap.players.length} jugadores · {snap.totalRounds} rondas
              {snap.mode === 'parejas' ? ' · parejas' : ' · fiesta'}
            </Text>
          </GlassCard>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60)} style={{ flex: 1 }}>
        <Text style={styles.section}>Jugadores</Text>
        <FlatList
          data={snap.players}
          keyExtractor={(p) => p.sessionId}
          style={{ maxHeight: 160 }}
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
          <Field
            value={custom}
            onChangeText={setCustom}
            placeholder="Yo nunca nunca he…"
            maxLength={140}
          />
          {customHint ? <Text style={styles.hint}>{customHint}</Text> : null}
          <PartyButton label="AÑADIR A LA PARTIDA" variant="orange" onPress={addCustom} />
        </GlassCard>
      </Animated.View>

      <View style={{ marginTop: 12 }}>
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
    color: colors.text,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: 10,
    fontFamily: fonts.display,
  },
  meta: { color: colors.muted, marginTop: 8, fontWeight: '600' },
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
  avatarText: { color: colors.text, fontWeight: '900' },
  name: { color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 },
  ready: { color: colors.neonLime, fontWeight: '800', fontSize: 12 },
  wait: { color: colors.muted, textAlign: 'center', marginTop: 10 },
  hint: { color: colors.neonCyan, marginTop: 8, marginBottom: 4, fontWeight: '600' },
});
