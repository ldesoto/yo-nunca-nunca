import { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { useGame } from '../GameContext';
import { useRoomState } from '../useRoomState';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Lobby'>;

export function LobbyScreen({ navigation }: Props) {
  const { room, roomCode } = useGame();
  const snap = useRoomState(room);

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
        <Text style={styles.title}>Conectando…</Text>
      </Screen>
    );
  }

  const me = snap.players.find((p) => p.sessionId === snap.mySessionId);
  const isHost = me?.isHost;

  return (
    <Screen>
      <Text style={styles.kicker}>CÓDIGO DE SALA</Text>
      <Text style={styles.code}>{snap.roomCode || roomCode}</Text>
      <Text style={styles.meta}>
        {snap.players.length} jugadores · {snap.totalRounds} rondas
      </Text>
      <FlatList
        data={snap.players}
        keyExtractor={(p) => p.sessionId}
        style={{ marginTop: 18, flex: 1 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>
              {item.name}
              {item.isHost ? ' · host' : ''}
              {!item.connected ? ' · offline' : ''}
            </Text>
            <Text style={styles.ready}>{item.ready ? 'LISTO' : '…'}</Text>
          </View>
        )}
      />
      <PartyButton
        label={me?.ready ? 'NO ESTOY LISTO' : 'ESTOY LISTO'}
        variant="ghost"
        onPress={() => room.send('setReady', { ready: !me?.ready })}
      />
      {isHost ? (
        <PartyButton
          label="INICIAR PARTIDA"
          onPress={() => room.send('startGame')}
          disabled={snap.players.length < 1}
        />
      ) : (
        <Text style={styles.wait}>Esperando al host…</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  kicker: { color: colors.neonCyan, letterSpacing: 2, fontWeight: '700' },
  code: {
    color: colors.text,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: 6,
    marginTop: 8,
  },
  meta: { color: colors.muted, marginTop: 6 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  name: { color: colors.text, fontSize: 16, fontWeight: '600' },
  ready: { color: colors.neonLime, fontWeight: '800' },
  wait: { color: colors.muted, textAlign: 'center', marginTop: 10 },
});
