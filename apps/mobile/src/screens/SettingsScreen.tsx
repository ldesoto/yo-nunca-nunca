import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const [music, setMusic] = useState(true);
  const [sfx, setSfx] = useState(true);
  const [haptics, setHaptics] = useState(true);

  return (
    <Screen>
      <Text style={styles.title}>Configuración</Text>
      <Row label="Música" value={music} onChange={setMusic} />
      <Row label="Efectos" value={sfx} onChange={setSfx} />
      <Row label="Vibración" value={haptics} onChange={setHaptics} />
      <Text style={styles.note}>
        Fase 1: preferencias locales. Audio completo en Fase 2.
      </Text>
      <PartyButton
        label="Volver"
        variant="ghost"
        onPress={() => navigation.goBack()}
      />
    </Screen>
  );
}

function Row({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.neonPink, false: '#444' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  label: { color: colors.text, fontSize: 16, fontWeight: '600' },
  note: { color: colors.muted, marginVertical: 18, lineHeight: 20 },
});
