import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { Field, GlassCard, SectionLabel } from '../components/GlassCard';
import { colors, typography, APP_ENV } from '../theme';
import type { RootStackParamList } from '../navigation';
import {
  getBakedServerHttp,
  getServerHttp,
  loadRuntimeServerOverride,
  saveServerOverride,
} from '../serverEndpoints';
import { resetClient } from '../api';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const KEY = 'ynn.settings.v1';

export function SettingsScreen({ navigation }: Props) {
  const [music, setMusic] = useState(true);
  const [sfx, setSfx] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [serverUrl, setServerUrl] = useState('');

  useEffect(() => {
    void AsyncStorage.getItem(KEY).then((raw) => {
      if (!raw) return;
      try {
        const s = JSON.parse(raw) as {
          music?: boolean;
          sfx?: boolean;
          haptics?: boolean;
        };
        if (typeof s.music === 'boolean') setMusic(s.music);
        if (typeof s.sfx === 'boolean') setSfx(s.sfx);
        if (typeof s.haptics === 'boolean') setHaptics(s.haptics);
      } catch {
        // ignore
      }
    });
    void loadRuntimeServerOverride().then(() => {
      const active = getServerHttp();
      const baked = getBakedServerHttp();
      setServerUrl(active !== baked ? active : '');
    });
  }, []);

  useEffect(() => {
    void AsyncStorage.setItem(KEY, JSON.stringify({ music, sfx, haptics }));
  }, [music, sfx, haptics]);

  const onSaveServer = async () => {
    await saveServerOverride(serverUrl.trim() || null);
    resetClient();
  };

  const onClearServer = async () => {
    setServerUrl('');
    await saveServerOverride(null);
    resetClient();
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>Configuración</Text>
      <GlassCard glow="cyan" style={{ marginTop: 8 }}>
        <Row label="Música de fondo" value={music} onChange={setMusic} />
        <Row label="Efectos de sonido" value={sfx} onChange={setSfx} />
        <Row label="Vibración / haptics" value={haptics} onChange={setHaptics} />
      </GlassCard>

      <SectionLabel>URL servidor (pruebas)</SectionLabel>
      <GlassCard glow="pink">
        <Text style={styles.serverHint}>
          Por defecto: {getBakedServerHttp()}. Vacío = usar el del build. Solo para probar otro
          host (p. ej. Render staging).
        </Text>
        <Field
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="https://yo-nunca-nunca.onrender.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <PartyButton label="Guardar URL" variant="cyan" onPress={() => void onSaveServer()} />
          <PartyButton label="Restaurar" variant="ghost" onPress={() => void onClearServer()} />
        </View>
        {APP_ENV === 'production' ? (
          <Text style={styles.serverHint}>
            Build production: el override es opcional; Play Store sigue exigiendo https/wss en el
            build.
          </Text>
        ) : null}
      </GlassCard>

      <Text style={styles.note}>
        Audio completo llega en Fase 3. Aquí ya quedan guardadas tus preferencias.
      </Text>
      <PartyButton label="Volver" variant="ghost" onPress={() => navigation.goBack()} />
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
  label: { color: colors.text, fontSize: 16, fontWeight: '700' },
  note: { color: colors.muted, marginVertical: 18, lineHeight: 20 },
  serverHint: { color: colors.muted, fontSize: 13, lineHeight: 18, marginBottom: 8 },
});
