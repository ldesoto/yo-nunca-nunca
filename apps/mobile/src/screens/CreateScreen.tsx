import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { CategoryPicker } from '../components/CategoryPicker';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { Field, GlassCard, SectionLabel } from '../components/GlassCard';
import { createParty, wakeServer } from '../api';
import { useGame } from '../GameContext';
import { track } from '../analytics';
import { colors, typography, type CategoryId } from '../theme';
import type { RootStackParamList } from '../navigation';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Create'>;

const ROUND_OPTIONS = [6, 12, 18, 24];

export function CreateScreen({ navigation }: Props) {
  const { setRoom, setPlayerName, setRoomCode } = useGame();
  const [name, setName] = useState('');
  const [rounds, setRounds] = useState(12);
  const [mode, setMode] = useState<'fiesta' | 'parejas'>('fiesta');
  const [categories, setCategories] = useState<CategoryId[]>(
    mode === 'parejas' ? ['relaciones'] : ['todas'],
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    wakeServer();
  }, []);

  const pickMode = (m: 'fiesta' | 'parejas') => {
    setMode(m);
    setCategories(m === 'parejas' ? ['relaciones'] : ['todas']);
  };

  const onCreate = async () => {
    setLoading(true);
    setError('');
    setStatus(t('create.preparing'));
    try {
      const { room, roomCode } = await createParty(
        {
          playerName: name || 'Host',
          rounds,
          categories,
          mode,
        },
        (msg) => setStatus(msg),
      );
      setPlayerName(name || 'Host');
      setRoomCode(roomCode);
      setRoom(room);
      track('game_created', {
        rounds,
        mode,
        categories: categories.length,
      });
      navigation.replace('Lobby');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Pressable
        onPress={() => navigation.goBack()}
        style={({ pressed }) => [styles.backTop, pressed && { opacity: 0.7 }]}
        hitSlop={10}
      >
        <Text style={styles.backTopLabel}>{t('common.backArrow')}</Text>
      </Pressable>

      {loading ? (
        <ConnectionBanner status="connecting" detail={status || undefined} />
      ) : null}
      <Text style={styles.kicker}>{t('create.kicker')}</Text>
      <Text style={typography.title}>{t('create.title')}</Text>
      <Text style={[typography.body, { marginBottom: 12, marginTop: 4 }]}>
        {t('create.lead')}
      </Text>

      <GlassCard glow="cyan">
        <SectionLabel>{t('create.yourName')}</SectionLabel>
        <Field value={name} onChangeText={setName} placeholder={t('create.namePlaceholder')} maxLength={20} />

        <SectionLabel>{t('create.mode')}</SectionLabel>
        <View style={styles.modeRow}>
          <Pressable
            onPress={() => pickMode('fiesta')}
            style={[styles.mode, mode === 'fiesta' && styles.modeOn]}
          >
            <Text style={styles.modeEmoji}>🎉</Text>
            <Text style={styles.modeText}>{t('create.modeFiesta')}</Text>
          </Pressable>
          <Pressable
            onPress={() => pickMode('parejas')}
            style={[styles.mode, mode === 'parejas' && styles.modeOn]}
          >
            <Text style={styles.modeEmoji}>💘</Text>
            <Text style={styles.modeText}>{t('create.modeParejas')}</Text>
          </Pressable>
        </View>

        <SectionLabel>{t('create.rounds')}</SectionLabel>
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

        <SectionLabel>{t('create.categories')}</SectionLabel>
        <CategoryPicker selected={categories} onChange={setCategories} />
      </GlassCard>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <View style={{ marginTop: 22, alignItems: 'center' }}>
          <ActivityIndicator color={colors.neonPink} />
          {status ? <Text style={styles.status}>{status}</Text> : null}
          <PartyButton
            label={t('common.cancel')}
            variant="ghost"
            onPress={() => navigation.goBack()}
          />
        </View>
      ) : (
        <View style={{ marginTop: 18 }}>
          <PartyButton label={t('create.createRoom')} onPress={() => void onCreate()} />
          <PartyButton label={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backTop: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingVertical: 4,
    paddingRight: 12,
  },
  backTopLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
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
  error: { color: colors.danger, marginTop: 12, fontWeight: '700' },
  status: { color: colors.muted, marginTop: 10, fontWeight: '600', textAlign: 'center' },
});
