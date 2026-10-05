import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { joinParty } from '../api';
import { useGame } from '../GameContext';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Join'>;

export function JoinScreen({ navigation }: Props) {
  const { setRoom, setPlayerName, setRoomCode } = useGame();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onJoin = async () => {
    setLoading(true);
    setError('');
    try {
      const { room, roomCode } = await joinParty(code, name || 'Jugador');
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
    <Screen>
      <Text style={styles.title}>Unirse</Text>
      <Text style={styles.label}>Tu nombre</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Ej. Ana"
        placeholderTextColor={colors.muted}
        style={styles.input}
        maxLength={20}
      />
      <Text style={styles.label}>Código de sala</Text>
      <TextInput
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase())}
        placeholder="K7X9P"
        placeholderTextColor={colors.muted}
        autoCapitalize="characters"
        style={styles.input}
        maxLength={5}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator color={colors.neonCyan} style={{ marginTop: 20 }} />
      ) : (
        <View style={{ marginTop: 16 }}>
          <PartyButton label="ENTRAR" variant="cyan" onPress={onJoin} />
          <PartyButton
            label="Volver"
            variant="ghost"
            onPress={() => navigation.goBack()}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 24,
  },
  label: { color: colors.muted, marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  error: { color: colors.danger, marginTop: 12 },
});
