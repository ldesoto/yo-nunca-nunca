import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { Field, GlassCard, SectionLabel } from '../components/GlassCard';
import { joinParty, wakeServer } from '../api';
import { useGame } from '../GameContext';
import { track } from '../analytics';
import { colors, fonts, typography } from '../theme';
import type { RootStackParamList } from '../navigation';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Join'>;

export function JoinScreen({ navigation }: Props) {
  const { setRoom, setPlayerName, setRoomCode } = useGame();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    wakeServer();
  }, []);

  const onJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 4) {
      setError(t('join.codeError'));
      return;
    }
    if (!name.trim()) {
      setError(t('join.nameError'));
      return;
    }
    setLoading(true);
    setError('');
    setStatus(t('join.entering'));
    try {
      const { room, roomCode } = await joinParty(
        trimmed,
        name.trim() || t('common.player'),
        (msg) => setStatus(msg),
      );
      setPlayerName(name.trim() || t('common.player'));
      setRoomCode(roomCode);
      setRoom(room);
      track('game_joined', { codeLen: trimmed.length });
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
      <Animated.View entering={FadeInUp.duration(400)}>
        <Text style={styles.kicker}>{t('join.kicker')}</Text>
        <Text style={typography.title}>{t('join.title')}</Text>
        <Text style={[typography.body, styles.lead]}>{t('join.lead')}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(400)}>
        <GlassCard glow="cyan" style={{ marginTop: 8 }}>
          <SectionLabel>{t('join.stepName')}</SectionLabel>
          <Field
            value={name}
            onChangeText={setName}
            placeholder={t('join.namePlaceholder')}
            maxLength={20}
            autoFocus
          />
          <SectionLabel>{t('join.stepCode')}</SectionLabel>
          <Field
            value={code}
            onChangeText={(value) =>
              setCode(value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))
            }
            placeholder="K7X9P"
            placeholderTextColor="rgba(255,255,255,0.35)"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={5}
            style={styles.codeField}
          />
          <Text style={styles.codeHint}>{t('join.codeChars', { n: code.length })}</Text>
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
            label={t('join.enter')}
            variant="cyan"
            onPress={() => void onJoin()}
            disabled={code.trim().length < 4 || !name.trim()}
          />
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
    color: '#FFFFFF',
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
