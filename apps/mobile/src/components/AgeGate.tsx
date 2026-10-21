import { useState } from 'react';
import { BackHandler, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AGE_KEY, MIN_AGE, legalUrl } from '../legal';
import { t } from '../i18n';

/** Puerta de edad obligatoria 18+ (contenido para adultos; IARC madura, no Families). */
export function AgeGate({ onOk }: { onOk: () => void }) {
  const [minor, setMinor] = useState(false);
  const accept = async () => {
    await AsyncStorage.setItem(AGE_KEY, JSON.stringify({ ok: true, at: new Date().toISOString() })).catch(() => {});
    onOk();
  };
  if (minor) {
    return (
      <View style={s.wrap}>
        <Text accessibilityRole="header" style={s.title}>{t('age.sorry')}</Text>
        <Text style={s.body}>{t('age.onlyMinorsMsg', { age: MIN_AGE })}</Text>
        {Platform.OS === 'android' ? (
          <Pressable
            style={[s.btn, s.ghost]}
            accessibilityRole="button"
            accessibilityLabel={t('common.exit')}
            onPress={() => BackHandler.exitApp()}
          >
            <Text style={s.btnTxt}>{t('common.exit')}</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
  return (
    <View style={s.wrap}>
      <Text accessibilityRole="header" style={s.title}>{t('age.title', { age: MIN_AGE })}</Text>
      <Text style={s.body}>{t('age.body')}</Text>
      <Text style={s.small}>
        {t('age.acceptPrefix')}
        <Text
          style={s.link}
          accessibilityRole="link"
          onPress={() => Linking.openURL(legalUrl('terminos')).catch(() => {})}
        >
          {t('age.terms')}
        </Text>
        {t('age.acceptMid')}
        <Text
          style={s.link}
          accessibilityRole="link"
          onPress={() => Linking.openURL(legalUrl('privacidad')).catch(() => {})}
        >
          {t('age.privacy')}
        </Text>
        {t('age.acceptSuffix')}
      </Text>
      <Pressable
        style={s.btn}
        accessibilityRole="button"
        accessibilityLabel={t('age.amOldEnough', { age: MIN_AGE })}
        onPress={accept}
      >
        <Text style={s.btnTxt}>{t('age.amOldEnough', { age: MIN_AGE })}</Text>
      </Pressable>
      <Pressable
        style={[s.btn, s.ghost]}
        accessibilityRole="button"
        accessibilityLabel={t('age.amMinor')}
        onPress={() => setMinor(true)}
      >
        <Text style={s.btnTxt}>{t('age.amMinor')}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0B0614', justifyContent: 'center', padding: 28, gap: 14 },
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '900' },
  body: { color: '#E4DDF2', fontSize: 16, lineHeight: 22 },
  small: { color: '#C9C0DB', fontSize: 14, lineHeight: 20, marginBottom: 8 },
  link: { color: '#FFFFFF', textDecorationLine: 'underline', fontWeight: '700' },
  btn: { backgroundColor: '#C2185B', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  ghost: { backgroundColor: 'rgba(255,255,255,0.12)' },
  btnTxt: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
});
