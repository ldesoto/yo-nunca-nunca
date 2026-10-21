import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONTACT_EMAIL, legalUrl } from '../legal';
import { showAdPrivacyOptions } from '../ads';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { GlassCard } from '../components/GlassCard';
import { colors, typography } from '../theme';
import type { RootStackParamList } from '../navigation';
import { saveServerOverride } from '../serverEndpoints';
import { resetClient } from '../api';
import {
  getSettings,
  loadSettings,
  saveSettings,
  subscribeSettings,
  type AppSettings,
} from '../settingsStore';
import { playSfx } from '../audio';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  useEffect(() => {
    void loadSettings().then(setSettings);
    void saveServerOverride(null).then(() => resetClient());
    return subscribeSettings(setSettings);
  }, []);

  const patch = (partial: Partial<AppSettings>) => {
    void saveSettings(partial).then((next) => {
      setSettings(next);
      if (partial.sfx === true) void playSfx('tap');
    });
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>Configuración</Text>
      <GlassCard glow="cyan" style={{ marginTop: 8 }}>
        <Row label="Efectos de sonido" value={settings.sfx} onChange={(v) => patch({ sfx: v })} />
        <Row
          label="Vibración / haptics"
          value={settings.haptics}
          onChange={(v) => patch({ haptics: v })}
        />
      </GlassCard>

      <Text style={[styles.title, { marginTop: 20 }]}>Legal y privacidad</Text>
      <GlassCard glow="cyan" style={{ marginTop: 8 }}>
        <LinkRow label="Política de privacidad" onPress={() => Linking.openURL(legalUrl('privacidad')).catch(() => {})} />
        <LinkRow label="Términos y condiciones" onPress={() => Linking.openURL(legalUrl('terminos')).catch(() => {})} />
        <LinkRow label="Política de cookies" onPress={() => Linking.openURL(legalUrl('cookies')).catch(() => {})} />
        <LinkRow label="Privacidad de anuncios" onPress={() => void showAdPrivacyOptions()} />
        <LinkRow label="Borrar mis datos" danger onPress={() => Alert.alert('Borrar mis datos', 'Se borrarán tu perfil, ajustes y preguntas guardadas en este teléfono.', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Borrar', style: 'destructive', onPress: () => void AsyncStorage.clear().then(() => Alert.alert('Listo', 'Tus datos locales se borraron.')).catch(() => {}) },
        ])} />
        <LinkRow label={`Contacto: ${CONTACT_EMAIL}`} onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`).catch(() => {})} />
      </GlassCard>

      <PartyButton label="Volver" variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

function LinkRow({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.row}>
      <Text style={[styles.label, danger && { color: '#FF8A80' }]}>{label}</Text>
    </Pressable>
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
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.neonPink, false: '#444' }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: typography.title,
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  label: { color: colors.text, fontSize: 16, fontWeight: '700', flex: 1, paddingRight: 12 },
});
