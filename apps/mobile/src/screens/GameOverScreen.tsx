import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { useGame } from '../GameContext';
import { useRoomState } from '../useRoomState';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'GameOver'>;

export function GameOverScreen({ navigation }: Props) {
  const { room, setRoom } = useGame();
  const snap = useRoomState(room);
  const me = snap?.players.find((p) => p.sessionId === snap.mySessionId);

  const leave = () => {
    try {
      room?.leave();
    } catch {
      // ignore
    }
    setRoom(null);
    navigation.popToTop();
  };

  return (
    <Screen>
      <Animated.Text entering={ZoomIn} style={styles.trophy}>
        GANADOR
      </Animated.Text>
      <Text style={styles.winner}>{snap?.winnerName || '—'}</Text>
      <Text style={styles.meta}>
        {snap?.totalRounds ?? 0} rondas · tu score {me?.score ?? 0}
      </Text>

      <View style={{ marginTop: 24 }}>
        <Text style={styles.stat}>
          Veces “Sí”: {me?.yesCount ?? 0}
        </Text>
        <Text style={styles.stat}>
          Veces mayoría: {me?.majorityCount ?? 0}
        </Text>
        <Text style={styles.stat}>
          Veces minoría: {me?.minorityCount ?? 0}
        </Text>
      </View>

      <View style={{ marginTop: 18, flex: 1 }}>
        {(snap?.players ?? []).map((p, i) => (
          <Animated.View
            key={p.sessionId}
            entering={FadeInDown.delay(i * 60)}
            style={styles.row}
          >
            <Text style={styles.name}>
              {i + 1}. {p.name}
            </Text>
            <Text style={styles.score}>{p.score}</Text>
          </Animated.View>
        ))}
      </View>

      <PartyButton label="VOLVER AL INICIO" onPress={leave} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  trophy: {
    color: colors.neonLime,
    fontWeight: '900',
    letterSpacing: 3,
    fontSize: 18,
  },
  winner: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '900',
    marginTop: 8,
  },
  meta: { color: colors.muted, marginTop: 6 },
  stat: { color: colors.text, fontSize: 16, marginBottom: 6 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  name: { color: colors.text, fontWeight: '700' },
  score: { color: colors.neonPink, fontWeight: '900' },
});
