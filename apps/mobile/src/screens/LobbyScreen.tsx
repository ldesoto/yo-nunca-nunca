import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { sanitizeCustomQuestion } from '@ynn/shared';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { Field, GlassCard, SectionLabel } from '../components/GlassCard';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { useGame } from '../GameContext';
import { useRoomState } from '../useRoomState';
import { useRoomConnection, markIntentionalLeave } from '../useRoomConnection';
import { track } from '../analytics';
import { feedback } from '../feedback';
import { colors, fonts, typography } from '../theme';
import type { RootStackParamList } from '../navigation';
import { t } from '../i18n';

const CUSTOM_REASON_KEYS: Record<string, string> = {
  too_short: 'lobby.customTooShort',
  too_long: 'lobby.customTooLong',
  offensive: 'lobby.customOffensive',
  blocked: 'lobby.customBlocked',
};

type Props = NativeStackScreenProps<RootStackParamList, 'Lobby'>;

export function LobbyScreen({ navigation }: Props) {
  const { room, roomCode, setRoom } = useGame();
  const snap = useRoomState(room);
  const conn = useRoomConnection(room, setRoom);
  const [custom, setCustom] = useState('');
  const [customHint, setCustomHint] = useState('');
  const [customError, setCustomError] = useState(false);
  const startedTracked = useRef(false);
  const lastCustomCount = useRef(0);

  useEffect(() => {
    if (!snap) return;
    if (
      snap.phase === 'QUESTION' ||
      snap.phase === 'WAITING_FOR_ANSWERS' ||
      snap.phase === 'REVEAL' ||
      snap.phase === 'SCORE' ||
      snap.phase === 'WHO_WAS'
    ) {
      if (!startedTracked.current) {
        startedTracked.current = true;
        track('game_started', {
          players: snap.players.length,
          rounds: snap.totalRounds,
          mode: snap.mode,
          custom: snap.customCount,
        });
      }
      navigation.replace('Play');
    }
    if (snap.phase === 'GAME_OVER') navigation.replace('GameOver');
  }, [snap?.phase, navigation]);

  useEffect(() => {
    if (!snap) return;
    if (snap.customCount > lastCustomCount.current) {
      setCustomHint(
        snap.customCount === 1
          ? t('lobby.customReadyOne')
          : t('lobby.customReadyMany', { n: snap.customCount }),
      );
      setCustomError(false);
      lastCustomCount.current = snap.customCount;
    }
  }, [snap?.customCount]);

  useEffect(() => {
    if (!room) return;
    let alive = true;
    room.onMessage(
      'customQuestionResult',
      (msg: { ok?: boolean; reason?: string; count?: number }) => {
        if (!alive) return;
        if (msg?.ok) {
          const n =
            typeof msg.count === 'number' ? msg.count : lastCustomCount.current + 1;
          setCustomHint(
            n === 1
              ? t('lobby.customReadyOne')
              : t('lobby.customReadyMany', { n }),
          );
          setCustomError(false);
          return;
        }
        const reason = msg?.reason;
        const map: Record<string, string> = {
          too_short: t('lobby.customTooShort'),
          too_long: t('lobby.customTooLong'),
          offensive: t('lobby.customOffensive'),
          blocked: t('lobby.customBlocked'),
          limit: t('lobby.customLimit'),
          not_lobby: t('lobby.customNotLobby'),
        };
        setCustomHint(map[reason || ''] || t('lobby.customFail'));
        setCustomError(true);
      },
    );
    return () => {
      alive = false;
    };
  }, [room]);

  if (!room || !snap) {
    return (
      <Screen>
        <ConnectionBanner
          status={conn === 'online' ? 'connecting' : conn}
          detail={t('lobby.entering')}
          onGoHome={() => {
            markIntentionalLeave();
            setRoom(null);
            navigation.popToTop();
          }}
        />
        <Text style={typography.title}>{t('lobby.connecting')}</Text>
      </Screen>
    );
  }

  const me = snap.players.find((p) => p.sessionId === snap.mySessionId);
  const isHost = me?.isHost;
  const code = snap.roomCode || roomCode;

  const addCustom = () => {
    setCustomError(false);
    const result = sanitizeCustomQuestion(custom);
    if (!result.ok) {
      setCustomHint(t(CUSTOM_REASON_KEYS[result.reason] ?? 'lobby.customFail'));
      setCustomError(true);
      return;
    }
    if (snap.customCount >= 20) {
      setCustomHint(t('lobby.customLimit'));
      setCustomError(true);
      return;
    }
    try {
      room.send('addCustomQuestion', { text: result.text });
      setCustom('');
      setCustomHint(t('lobby.customSending'));
      setCustomError(false);
      track('custom_question_created', { len: result.text.length });
      void feedback({ sfx: 'tap', haptic: 'success' });
    } catch {
      setCustomHint(t('lobby.customFail'));
      setCustomError(true);
    }
  };

  const pulseCode = () => {
    void feedback({ sfx: 'tap', haptic: 'success' });
  };

  const goHome = () => {
    markIntentionalLeave();
    try {
      room.leave();
    } catch {
      // ignore
    }
    setRoom(null);
    navigation.popToTop();
  };

  return (
    <Screen scroll>
      <ConnectionBanner status={conn} onGoHome={goHome} />
      <Animated.View entering={FadeIn}>
        <Text style={styles.kicker}>{t('lobby.shareCode')}</Text>
        <Pressable onPress={pulseCode}>
          <GlassCard glow="pink" style={styles.codeCard}>
            <Text style={styles.code} selectable>
              {code}
            </Text>
            <Text style={styles.meta}>
              {t('lobby.meta', { players: snap.players.length, rounds: snap.totalRounds })}
              {snap.mode === 'parejas' ? t('lobby.metaParejas') : t('lobby.metaFiesta')}
            </Text>
          </GlassCard>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60)}>
        <Text style={styles.section}>{t('lobby.players')}</Text>
        <FlatList
          data={snap.players}
          keyExtractor={(p) => p.sessionId}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={[styles.avatar, item.isHost && styles.avatarHost]}>
                <Text style={styles.avatarText}>{item.name.slice(0, 1).toUpperCase()}</Text>
              </View>
              <Text style={styles.name}>
                {item.name}
                {item.isHost ? t('lobby.hostSuffix') : ''}
                {!item.connected ? t('lobby.offlineSuffix') : ''}
              </Text>
              <Text style={[styles.ready, !item.ready && { color: colors.muted }]}>
                {item.ready ? t('common.ready') : '…'}
              </Text>
            </View>
          )}
        />

        <GlassCard style={{ marginTop: 12 }}>
          <SectionLabel>{t('lobby.customTitle')}</SectionLabel>
          <Text style={styles.customHelp}>{t('lobby.customHelp')}</Text>
          <Field
            value={custom}
            onChangeText={setCustom}
            placeholder={t('lobby.customPlaceholder')}
            maxLength={140}
          />
          {customHint ? (
            <Text style={[styles.hint, customError && styles.hintError]}>{customHint}</Text>
          ) : null}
          {snap.customCount > 0 ? (
            <Text style={styles.customCount}>
              {t('lobby.customInDeck', { n: snap.customCount })}
            </Text>
          ) : null}
          <PartyButton label={t('lobby.addCustom')} variant="orange" onPress={addCustom} />
        </GlassCard>
      </Animated.View>

      <View style={{ marginTop: 12, marginBottom: 24 }}>
        <PartyButton
          label={me?.ready ? t('lobby.notReady') : t('lobby.imReady')}
          variant="ghost"
          onPress={() => room.send('setReady', { ready: !me?.ready })}
        />
        {isHost ? (
          <PartyButton label={t('lobby.start')} onPress={() => room.send('startGame')} />
        ) : (
          <Text style={styles.wait}>{t('lobby.waitHost')}</Text>
        )}
        <PartyButton label={t('lobby.leave')} variant="ghost" onPress={goHome} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.2,
    color: colors.neonPink,
    textAlign: 'center',
  },
  codeCard: { marginTop: 10, alignItems: 'center', paddingVertical: 22 },
  code: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: 10,
    fontFamily: fonts.display,
    textShadowColor: 'rgba(255,45,149,0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  meta: { color: 'rgba(255,255,255,0.75)', marginTop: 8, fontWeight: '600' },
  section: {
    marginTop: 16,
    marginBottom: 6,
    color: colors.muted,
    fontWeight: '800',
    letterSpacing: 1.2,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  avatarHost: {
    backgroundColor: colors.neonPinkSoft,
    borderColor: colors.strokeHot,
  },
  avatarText: { color: '#FFFFFF', fontWeight: '900' },
  name: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', flex: 1 },
  ready: { color: colors.neonLime, fontWeight: '800', fontSize: 12 },
  wait: { color: colors.muted, textAlign: 'center', marginTop: 10 },
  customHelp: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
  },
  hint: { color: colors.neonCyan, marginTop: 8, marginBottom: 4, fontWeight: '600' },
  hintError: { color: colors.danger },
  customCount: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 13,
  },
});
