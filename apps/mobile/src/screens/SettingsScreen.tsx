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
import { t } from '../i18n';

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
      <Text style={styles.title}>{t('settings.title')}</Text>
      <GlassCard glow="cyan" style={{ marginTop: 8 }}>
        <LinkRow
          label={t('home.tabProfile')}
          onPress={() => navigation.navigate('Profile')}
        />
        <Row label={t('settings.sfx')} value={settings.sfx} onChange={(v) => patch({ sfx: v })} />
        <Row
          label={t('settings.haptics')}
          value={settings.haptics}
          onChange={(v) => patch({ haptics: v })}
        />
      </GlassCard>

      <Text style={[styles.title, { marginTop: 20 }]}>{t('settings.legalTitle')}</Text>
      <GlassCard glow="cyan" style={{ marginTop: 8 }}>
        <LinkRow label={t('settings.privacy')} onPress={() => Linking.openURL(legalUrl('privacidad')).catch(() => {})} />
        <LinkRow label={t('settings.terms')} onPress={() => Linking.openURL(legalUrl('terminos')).catch(() => {})} />
        <LinkRow label={t('settings.cookies')} onPress={() => Linking.openURL(legalUrl('cookies')).catch(() => {})} />
        <LinkRow label={t('settings.adPrivacy')} onPress={() => void showAdPrivacyOptions()} />
        <LinkRow
          label={t('settings.deleteData')}
          danger
          onPress={() =>
            Alert.alert(t('settings.deleteTitle'), t('settings.deleteBody'), [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('settings.deleteConfirm'),
                style: 'destructive',
                onPress: () =>
                  void AsyncStorage.clear()
                    .then(() => Alert.alert(t('settings.deleteDoneTitle'), t('settings.deleteDoneBody')))
                    .catch(() => {}),
              },
            ])
          }
        />
        <LinkRow
          label={t('common.contact', { email: CONTACT_EMAIL })}
          onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`).catch(() => {})}
        />
      </GlassCard>

      <PartyButton label={t('settings.back')} variant="ghost" onPress={() => navigation.goBack()} />
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
