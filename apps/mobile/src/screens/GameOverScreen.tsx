import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { GlassCard } from '../components/GlassCard';
import { useGame } from '../GameContext';
import { useRoomState } from '../useRoomState';
import { colors, typography } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'GameOver'>;

export function GameOverScreen({ navigation }: Props) {
  const { room, setRoom } = useGame();
  const snap = useRoomState(room);
  const me = snap?.players.find((p) => p.sessionId === snap.mySessionId);

  useEffect(() => {
    if (!snap || !me) return;
    const won = snap.winnerName === me.name;
    void (async () => {
      const raw = await AsyncStorage.getItem('ynn.profile.v1');
      const profile = raw
        ? JSON.parse(raw)
        : { name: me.name, avatar: '🦊', gamesPlayed: 0, gamesWon: 0, yesAnswers: 0 };
      profile.gamesPlayed = (profile.gamesPlayed || 0) + 1;
      if (won) profile.gamesWon = (profile.gamesWon || 0) + 1;
      profile.yesAnswers = (profile.yesAnswers || 0) + (me.yesCount || 0);
      profile.name = me.name;
      await AsyncStorage.setItem('ynn.profile.v1', JSON.stringify(profile));
    })();
  }, [snap?.winnerName, me?.sessionId]);

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
    <Screen scroll>
      <Animated.Text entering={ZoomIn} style={typography.kicker}>
        GANADOR
      </Animated.Text>
      <GlassCard glow="pink" style={{ marginTop: 12, alignItems: 'center' }}>
        <Text style={styles.trophy}>🏆</Text>
        <Text style={styles.winner}>{snap?.winnerName || '—'}</Text>
        <Text style={styles.meta}>
          {snap?.totalRounds ?? 0} rondas · tu score {me?.score ?? 0}
        </Text>
      </GlassCard>

      <GlassCard style={{ marginTop: 14 }}>
        <Text style={styles.stat}>Veces “Sí”: {me?.yesCount ?? 0}</Text>
        <Text style={styles.stat}>Veces mayoría: {me?.majorityCount ?? 0}</Text>
        <Text style={styles.stat}>Veces minoría: {me?.minorityCount ?? 0}</Text>
      </GlassCard>

      <View style={{ marginTop: 12 }}>
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
  trophy: { fontSize: 48, marginBottom: 6 },
  winner: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '900',
  },
  meta: { color: colors.muted, marginTop: 6, fontWeight: '600' },
  stat: { color: colors.text, fontSize: 16, marginBottom: 8, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  name: { color: colors.text, fontWeight: '700' },
  score: { color: colors.neonPink, fontWeight: '900' },
});
