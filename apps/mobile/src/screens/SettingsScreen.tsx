import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
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
import { getRecentAnalytics } from '../analytics';
import {
  isPremiumStubAllowed,
  isPremiumUnlocked,
  loadPremium,
  setPremiumUnlocked,
  subscribePremium,
} from '../premium';
import {
  getSettings,
  loadSettings,
  saveSettings,
  subscribeSettings,
  type AppSettings,
} from '../settingsStore';
import { playBed, playSfx, stopBed } from '../audio';
import { useAmbientMusic } from '../useAmbientMusic';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  useAmbientMusic();
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [serverUrl, setServerUrl] = useState('');
  const [premium, setPremium] = useState(isPremiumUnlocked());
  const [events, setEvents] = useState<Array<{ name: string; at: number }>>([]);

  useEffect(() => {
    void loadSettings().then(setSettings);
    void loadRuntimeServerOverride().then(() => {
      const active = getServerHttp();
      const baked = getBakedServerHttp();
      setServerUrl(active !== baked ? active : '');
    });
    void loadPremium().then(setPremium);
    void getRecentAnalytics(8).then((list) =>
      setEvents(list.map((e) => ({ name: e.name, at: e.at }))),
    );
    const unsubP = subscribePremium(setPremium);
    const unsubS = subscribeSettings(setSettings);
    return () => {
      unsubP();
      unsubS();
    };
  }, []);

  const patch = (partial: Partial<AppSettings>) => {
    void saveSettings(partial).then((next) => {
      setSettings(next);
      if (partial.sfx === true) void playSfx('tap');
      if (partial.music === true) void playBed();
      if (partial.music === false) void stopBed();
    });
  };

  const onSaveServer = async () => {
    try {
      await saveServerOverride(serverUrl.trim() || null);
      resetClient();
    } catch (e) {
      Alert.alert('URL inválida', e instanceof Error ? e.message : 'No se pudo guardar');
    }
  };

  const onClearServer = async () => {
    setServerUrl('');
    await saveServerOverride(null);
    resetClient();
  };

  const onTogglePremium = async (value: boolean) => {
    await setPremiumUnlocked(value);
    setPremium(value);
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>Configuración</Text>
      <GlassCard glow="cyan" style={{ marginTop: 8 }}>
        <Row label="Música de fondo" value={settings.music} onChange={(v) => patch({ music: v })} />
        <Row label="Efectos de sonido" value={settings.sfx} onChange={(v) => patch({ sfx: v })} />
        <Row
          label="Vibración / haptics"
          value={settings.haptics}
          onChange={(v) => patch({ haptics: v })}
        />
      </GlassCard>

      {isPremiumStubAllowed() ? (
        <>
          <SectionLabel>Premium (demo)</SectionLabel>
          <GlassCard glow="pink">
            <Row
              label="Desbloquear Premium"
              value={premium}
              onChange={(v) => void onTogglePremium(v)}
            />
            <Text style={styles.serverHint}>
              Stub local (sin IAP). El servidor sigue bloqueando Picante / Sin filtro hasta
              IAP real o YNN_PREMIUM_OPEN=1. Compra de tienda → al final.
            </Text>
          </GlassCard>
        </>
      ) : (
        <>
          <SectionLabel>Premium</SectionLabel>
          <GlassCard glow="pink">
            <Text style={styles.serverHint}>
              Compra in-app pendiente (Play Billing / App Store). Mientras tanto Picante y
              Sin filtro no están disponibles en partidas online.
            </Text>
          </GlassCard>
        </>
      )}

      <SectionLabel>URL servidor (pruebas)</SectionLabel>
      <GlassCard glow="pink">
        <Text style={styles.serverHint}>
          Por defecto: {getBakedServerHttp()}. Vacío = usar el del build.
          {APP_ENV === 'production' || APP_ENV === 'preview'
            ? ' Solo https:// / wss:// públicos.'
            : ''}
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
      </GlassCard>

      <SectionLabel>Analytics recientes</SectionLabel>
      <GlassCard>
        {events.length === 0 ? (
          <Text style={styles.serverHint}>Aún no hay eventos en este dispositivo.</Text>
        ) : (
          events.map((e, i) => (
            <Text key={`${e.name}-${e.at}-${i}`} style={styles.eventLine}>
              {e.name}
            </Text>
          ))
        )}
      </GlassCard>

      <Text style={styles.note}>
        Música de fondo en inicio, lobby y menús (se apaga en partida). Sube volumen y deja
        “Música de fondo” activada.
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
  label: { color: colors.text, fontSize: 16, fontWeight: '700', flex: 1, paddingRight: 12 },
  note: { color: colors.muted, marginVertical: 18, lineHeight: 20 },
  serverHint: { color: colors.muted, fontSize: 13, lineHeight: 18, marginBottom: 8 },
  eventLine: {
    color: colors.neonCyan,
    fontSize: 13,
    fontWeight: '700',
    paddingVertical: 4,
  },
});
