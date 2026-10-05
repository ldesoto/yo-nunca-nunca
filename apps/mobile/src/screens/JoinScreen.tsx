import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { Field, GlassCard, SectionLabel } from '../components/GlassCard';
import { joinParty } from '../api';
import { useGame } from '../GameContext';
import { colors, typography } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Join'>;

export function JoinScreen({ navigation }: Props) {
  const { setRoom, setPlayerName, setRoomCode } = useGame();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const onJoin = async () => {
    setLoading(true);
    setError('');
    setStatus('');
    try {
      const { room, roomCode } = await joinParty(
        code,
        name || 'Jugador',
        (msg) => setStatus(msg),
      );
      setPlayerName(name || 'Jugador');
      setRoomCode(roomCode);
      setRoom(room);
      navigation.replace('Lobby');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Text style={typography.title}>Unirse</Text>
      <Text style={[typography.body, { marginBottom: 10 }]}>
        Pide el código al anfitrión. 5 caracteres, sin confusiones.
      </Text>
      <GlassCard glow="cyan">
        <SectionLabel>Tu nombre</SectionLabel>
        <Field value={name} onChangeText={setName} placeholder="Ej. Ana" maxLength={20} />
        <SectionLabel>Código de sala</SectionLabel>
        <Field
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          placeholder="K7X9P"
          autoCapitalize="characters"
          maxLength={5}
          style={{ letterSpacing: 4, fontWeight: '800', fontSize: 22 }}
        />
      </GlassCard>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <View style={{ marginTop: 22, alignItems: 'center' }}>
          <ActivityIndicator color={colors.neonCyan} />
          {status ? <Text style={styles.status}>{status}</Text> : null}
        </View>
      ) : (
        <View style={{ marginTop: 18 }}>
          <PartyButton label="ENTRAR" variant="cyan" onPress={onJoin} />
          <PartyButton label="Volver" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, marginTop: 12, fontWeight: '700' },
  status: { color: colors.muted, marginTop: 10, fontWeight: '600', textAlign: 'center' },
});
