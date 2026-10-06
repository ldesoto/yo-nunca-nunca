import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { Field, GlassCard, SectionLabel } from '../components/GlassCard';
import { joinParty } from '../api';
import { useGame } from '../GameContext';
import { track } from '../analytics';
import { useAmbientMusic } from '../useAmbientMusic';
import { colors, fonts, typography } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Join'>;

export function JoinScreen({ navigation }: Props) {
  useAmbientMusic();
  const { setRoom, setPlayerName, setRoomCode } = useGame();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const onJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 4) {
      setError('El código tiene 5 caracteres');
      return;
    }
    if (!name.trim()) {
      setError('Pon tu nombre primero');
      return;
    }
    setLoading(true);
    setError('');
    setStatus('');
    try {
      const { room, roomCode } = await joinParty(
        trimmed,
        name.trim() || 'Jugador',
        (msg) => setStatus(msg),
      );
      setPlayerName(name.trim() || 'Jugador');
      setRoomCode(roomCode);
      setRoom(room);
      track('game_joined', { codeLen: trimmed.length });
      navigation.replace('Lobby');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      {loading ? (
        <ConnectionBanner status="connecting" detail={status || undefined} />
      ) : null}
      <Animated.View entering={FadeInUp.duration(400)}>
        <Text style={styles.kicker}>MULTIJUGADOR</Text>
        <Text style={typography.title}>Unirse a una sala</Text>
        <Text style={[typography.body, styles.lead]}>
          Nombre arriba, código abajo. No los mezcles 😉
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(400)}>
        <GlassCard glow="cyan" style={{ marginTop: 8 }}>
          <SectionLabel>1 · Tu nombre</SectionLabel>
          <Field
            value={name}
            onChangeText={setName}
            placeholder="Ej. Ana"
            maxLength={20}
            autoFocus
          />
          <SectionLabel>2 · Código de sala</SectionLabel>
          <Field
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))}
            placeholder="K7X9P"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={5}
            style={styles.codeField}
          />
          <Text style={styles.codeHint}>{code.length}/5 caracteres</Text>
        </GlassCard>
      </Animated.View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.neonCyan} />
          {status ? <Text style={styles.status}>{status}</Text> : null}
        </View>
      ) : (
        <View style={{ marginTop: 18 }}>
          <PartyButton
            label="ENTRAR A LA SALA"
            variant="cyan"
            onPress={() => void onJoin()}
            disabled={code.trim().length < 4 || !name.trim()}
          />
          <PartyButton label="Volver" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.4,
    color: colors.neonCyan,
    marginBottom: 8,
  },
  lead: { marginTop: 6, marginBottom: 14 },
  codeField: {
    letterSpacing: 8,
    fontWeight: '900',
    fontSize: 26,
    textAlign: 'center',
    fontFamily: fonts.display,
  },
  codeHint: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  error: { color: colors.danger, marginTop: 12, fontWeight: '700' },
  loading: { marginTop: 22, alignItems: 'center' },
  status: { color: colors.muted, marginTop: 10, fontWeight: '600', textAlign: 'center' },
});
