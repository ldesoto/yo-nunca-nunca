import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { CategoryPicker } from '../components/CategoryPicker';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { Field, GlassCard, SectionLabel } from '../components/GlassCard';
import { createParty } from '../api';
import { useGame } from '../GameContext';
import { track } from '../analytics';
import { gateCategories, isPremiumUnlocked } from '../premium';
import { useAmbientMusic } from '../useAmbientMusic';
import { colors, typography, type CategoryId } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Create'>;

const ROUND_OPTIONS = [6, 12, 18, 24];

export function CreateScreen({ navigation, route }: Props) {
  useAmbientMusic();
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
      const gated = gateCategories(categories) as CategoryId[];
      const { room, roomCode } = await createParty(
        {
          playerName: name || 'Host',
          rounds,
          categories: gated,
          solo,
          mode,
        },
        (msg) => setStatus(msg),
      );
      setPlayerName(name || 'Host');
      setRoomCode(roomCode);
      setRoom(room);
      track('game_created', {
        rounds,
        solo: solo ? 1 : 0,
        mode,
        categories: gated.length,
        premium: isPremiumUnlocked() ? 1 : 0,
      });
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
      <Text style={styles.kicker}>{solo ? 'MODO DEMO' : 'YO NUNCA NUNCA'}</Text>
      <Text style={typography.title}>{solo ? 'Jugar solo' : 'Crear partida'}</Text>
      <Text style={[typography.body, { marginBottom: 12, marginTop: 4 }]}>
        Elige el vibe. Los amigos se unen con el código de 5 letras.
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
        <CategoryPicker
          selected={categories}
          onChange={setCategories}
          onPremiumRequired={() =>
            Alert.alert(
              'Premium',
              'Picante y Sin filtro son Premium. Actívalo en Configuración (demo) o espera la tienda.',
              [
                { text: 'Ir a Config', onPress: () => navigation.navigate('Settings') },
                { text: 'OK', style: 'cancel' },
              ],
            )
          }
        />
        <Text style={styles.premiumHint}>
          ✦ = Premium · gratis: casual, fiesta, vergonzoso, relaciones
        </Text>
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
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.4,
    color: colors.neonPink,
    marginBottom: 8,
  },
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
  premiumHint: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  error: { color: colors.danger, marginTop: 12, fontWeight: '700' },
  status: { color: colors.muted, marginTop: 10, fontWeight: '600', textAlign: 'center' },
});
