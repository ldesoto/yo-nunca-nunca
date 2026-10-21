import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { PartyButton } from './PartyButton';
import { fonts } from '../theme';
import type { ConnectionStatus } from '../useRoomConnection';

const COPY: Record<
  Exclude<ConnectionStatus, 'online'>,
  { title: string; sub: string; tint: string }
> = {
  connecting: {
    title: 'Preparando la partida…',
    sub: 'Un momento, estamos conectando a tus amigos.',
    tint: 'rgba(45,226,230,0.92)',
  },
  reconnecting: {
    title: 'Reconectando…',
    sub: 'Volviendo a la partida. Un momento…',
    tint: 'rgba(255,138,61,0.92)',
  },
  lost: {
    title: 'Sin conexión',
    sub: 'No pudimos volver a la partida. Intenta de nuevo.',
    tint: 'rgba(255,45,149,0.92)',
  },
};

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

  const copy = COPY[status];
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
        <PartyButton label="Volver al inicio" variant="ghost" onPress={onGoHome} />
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
