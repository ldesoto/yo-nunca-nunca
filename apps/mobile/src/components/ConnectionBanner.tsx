import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { PartyButton } from './PartyButton';
import { fonts } from '../theme';
import { t } from '../i18n';
import type { ConnectionStatus } from '../useRoomConnection';

function copyFor(status: Exclude<ConnectionStatus, 'online'>) {
  if (status === 'connecting') {
    return {
      title: t('conn.connectingTitle'),
      sub: t('conn.connectingSub'),
      tint: 'rgba(45,226,230,0.92)',
    };
  }
  if (status === 'reconnecting') {
    return {
      title: t('conn.reconnectingTitle'),
      sub: t('conn.reconnectingSub'),
      tint: 'rgba(255,138,61,0.92)',
    };
  }
  return {
    title: t('conn.lostTitle'),
    sub: t('conn.lostSub'),
    tint: 'rgba(255,45,149,0.92)',
  };
}

export function ConnectionBanner({
  status,
  onGoHome,
  detail,
}: {
  status: ConnectionStatus;
  onGoHome?: () => void;
  /** Mensaje extra (p. ej. progreso de cold start). */
  detail?: string;
}) {
  if (status === 'online') return null;

  const copy = copyFor(status);
  const busy = status === 'connecting' || status === 'reconnecting';
  return (
    <View
      style={[styles.wrap, { backgroundColor: copy.tint }]}
      accessibilityRole="alert"
      testID={`connection-banner-${status}`}
    >
      <View style={styles.row}>
        {busy ? <ActivityIndicator color="#0B0614" style={{ marginRight: 10 }} /> : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.sub}>{detail?.trim() || copy.sub}</Text>
        </View>
      </View>
      {status === 'lost' && onGoHome ? (
        <PartyButton label={t('conn.backHome')} variant="ghost" onPress={onGoHome} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: {
    color: '#0B0614',
    fontFamily: fonts.display,
    fontWeight: '900',
    fontSize: 15,
  },
  sub: {
    color: 'rgba(11,6,20,0.75)',
    marginTop: 4,
    fontWeight: '600',
    fontSize: 13,
  },
});
