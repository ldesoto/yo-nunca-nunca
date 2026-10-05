import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { Field, GlassCard, SectionLabel } from '../components/GlassCard';
import { useGame } from '../GameContext';
import { useRoomState } from '../useRoomState';
import { colors, typography } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Lobby'>;

export function LobbyScreen({ navigation }: Props) {
  const { room, roomCode } = useGame();
  const snap = useRoomState(room);
  const [custom, setCustom] = useState('');
  const [customHint, setCustomHint] = useState('');

  useEffect(() => {
    if (!snap) return;
    if (
      snap.phase === 'QUESTION' ||
      snap.phase === 'WAITING_FOR_ANSWERS' ||
      snap.phase === 'REVEAL' ||
      snap.phase === 'SCORE'
    ) {
      navigation.replace('Play');
    }
    if (snap.phase === 'GAME_OVER') navigation.replace('GameOver');
  }, [snap?.phase, navigation]);

  if (!room || !snap) {
    return (
      <Screen>
        <Text style={typography.title}>Conectando…</Text>
      </Screen>
    );
  }

  const me = snap.players.find((p) => p.sessionId === snap.mySessionId);
  const isHost = me?.isHost;

  const addCustom = () => {
    const text = custom.trim();
    if (text.length < 8) {
      setCustomHint('Escribe una frase más larga');
      return;
    }
    room.send('addCustomQuestion', { text });
    setCustom('');
    setCustomHint('Añadida solo para esta partida');
  };

  return (
    <Screen>
      <Animated.View entering={FadeIn}>
        <Text style={typography.kicker}>CÓDIGO DE SALA</Text>
        <GlassCard glow="pink" style={styles.codeCard}>
          <Text style={styles.code}>{snap.roomCode || roomCode}</Text>
          <Text style={styles.meta}>
            {snap.players.length} jugadores · {snap.totalRounds} rondas
            {snap.mode ? ` · ${snap.mode}` : ''}
          </Text>
        </GlassCard>
      </Animated.View>

      <FlatList
        data={snap.players}
        keyExtractor={(p) => p.sessionId}
        style={{ marginTop: 14, flexGrow: 0, maxHeight: 180 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.avatar}>
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

      <GlassCard style={{ marginTop: 10 }}>
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

      <View style={{ marginTop: 'auto' }}>
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
  codeCard: { marginTop: 10, alignItems: 'center' },
  code: {
    color: colors.text,
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 8,
  },
  meta: { color: colors.muted, marginTop: 4, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.neonPinkSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.strokeHot,
  },
  avatarText: { color: colors.text, fontWeight: '900' },
  name: { color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 },
  ready: { color: colors.neonLime, fontWeight: '800' },
  wait: { color: colors.muted, textAlign: 'center', marginTop: 10 },
  hint: { color: colors.neonCyan, marginTop: 8, marginBottom: 4, fontWeight: '600' },
});
