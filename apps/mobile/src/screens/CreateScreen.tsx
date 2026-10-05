import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { CategoryPicker } from '../components/CategoryPicker';
import { Field, GlassCard, SectionLabel } from '../components/GlassCard';
import { createParty } from '../api';
import { useGame } from '../GameContext';
import { colors, typography, type CategoryId } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Create'>;

const ROUND_OPTIONS = [6, 12, 18, 24];

export function CreateScreen({ navigation, route }: Props) {
  const { setRoom, setPlayerName, setRoomCode } = useGame();
  const solo = Boolean(route.params?.solo);
  const [name, setName] = useState(solo ? 'Solo' : '');
  const [rounds, setRounds] = useState(12);
  const [mode, setMode] = useState<'fiesta' | 'parejas'>(solo ? 'fiesta' : 'fiesta');
  const [categories, setCategories] = useState<CategoryId[]>(
    mode === 'parejas' ? ['relaciones'] : ['todas'],
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const pickMode = (m: 'fiesta' | 'parejas') => {
    setMode(m);
    setCategories(m === 'parejas' ? ['relaciones'] : ['todas']);
  };

  const onCreate = async () => {
    setLoading(true);
    setError('');
    setStatus('');
    try {
      const { room, roomCode } = await createParty(
        {
          playerName: name || 'Host',
          rounds,
          categories,
          solo,
          mode,
        },
        (msg) => setStatus(msg),
      );
      setPlayerName(name || 'Host');
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
      <Text style={typography.title}>{solo ? 'Jugar solo' : 'Crear partida'}</Text>
      <Text style={[typography.body, { marginBottom: 8 }]}>
        Elige el vibe. Las preguntas salen del servidor (SQLite), no de CardNexus.
      </Text>

      <GlassCard glow="cyan">
        <SectionLabel>Tu nombre</SectionLabel>
        <Field value={name} onChangeText={setName} placeholder="Ej. Luis" maxLength={20} />

        <SectionLabel>Modo</SectionLabel>
        <View style={styles.modeRow}>
          <Pressable
            onPress={() => pickMode('fiesta')}
            style={[styles.mode, mode === 'fiesta' && styles.modeOn]}
          >
            <Text style={styles.modeEmoji}>🎉</Text>
            <Text style={styles.modeText}>Fiesta</Text>
          </Pressable>
          <Pressable
            onPress={() => pickMode('parejas')}
            style={[styles.mode, mode === 'parejas' && styles.modeOn]}
          >
            <Text style={styles.modeEmoji}>💘</Text>
            <Text style={styles.modeText}>Parejas</Text>
          </Pressable>
        </View>

        <SectionLabel>Rondas</SectionLabel>
        <View style={styles.modeRow}>
          {ROUND_OPTIONS.map((n) => (
            <Pressable
              key={n}
              onPress={() => setRounds(n)}
              style={[styles.roundChip, rounds === n && styles.roundOn]}
            >
              <Text style={[styles.roundText, rounds === n && { color: '#0B0614' }]}>{n}</Text>
            </Pressable>
          ))}
        </View>

        <SectionLabel>Categorías</SectionLabel>
        <CategoryPicker selected={categories} onChange={setCategories} />
      </GlassCard>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <View style={{ marginTop: 22, alignItems: 'center' }}>
          <ActivityIndicator color={colors.neonPink} />
          {status ? <Text style={styles.status}>{status}</Text> : null}
        </View>
      ) : (
        <View style={{ marginTop: 18 }}>
          <PartyButton label="CREAR SALA" onPress={onCreate} />
          <PartyButton label="Volver" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mode: {
    flex: 1,
    minWidth: 120,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(0,0,0,0.22)',
    padding: 14,
    alignItems: 'center',
  },
  modeOn: {
    borderColor: colors.neonPink,
    backgroundColor: colors.neonPinkSoft,
  },
  modeEmoji: { fontSize: 22, marginBottom: 4 },
  modeText: { color: colors.text, fontWeight: '800' },
  roundChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  roundOn: { backgroundColor: colors.neonCyan, borderColor: colors.neonCyan },
  roundText: { color: colors.text, fontWeight: '800' },
  error: { color: colors.danger, marginTop: 12, fontWeight: '700' },
  status: { color: colors.muted, marginTop: 10, fontWeight: '600', textAlign: 'center' },
});
