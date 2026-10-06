import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
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
import { recordGameResult } from '../profileStats';
import { isPremiumUnlocked } from '../premium';
import { colors, typography } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'GameOver'>;

export function GameOverScreen({ navigation }: Props) {
  const { room, setRoom } = useGame();
  const snap = useRoomState(room);
  const conn = useRoomConnection(room, setRoom);
  const me = snap?.players.find((p) => p.sessionId === snap.mySessionId);
  const logged = useRef(false);
  const premium = isPremiumUnlocked();

  useEffect(() => {
    if (!snap || !me || logged.current) return;
    logged.current = true;
    const won = snap.winnerName === me.name;
    track('game_completed', {
      rounds: snap.totalRounds,
      players: snap.players.length,
      won: won ? 1 : 0,
    });
    void feedback({ sfx: 'win', haptic: 'success' });
    void recordGameResult({
      name: me.name,
      won,
      yesCount: me.yesCount || 0,
      majorityCount: me.majorityCount || 0,
      minorityCount: me.minorityCount || 0,
      score: me.score || 0,
    });
  }, [snap?.winnerName, me?.sessionId]);

  const leave = () => {
    markIntentionalLeave();
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
      <ConnectionBanner status={conn} onGoHome={leave} />
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
        {premium ? (
          <Text style={styles.premiumNote}>✦ Stats de esta partida guardadas en Premium</Text>
        ) : (
          <Text style={styles.locked}>
            Activa Premium (Config) para acumular racha, mejor score y % de Sí.
          </Text>
        )}
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
  premiumNote: {
    marginTop: 6,
    color: colors.neonOrange,
    fontWeight: '800',
    fontSize: 13,
  },
  locked: { marginTop: 6, color: colors.muted, fontSize: 13, lineHeight: 18 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  name: { color: colors.text, fontWeight: '700' },
  score: { color: colors.neonPink, fontWeight: '900' },
});
