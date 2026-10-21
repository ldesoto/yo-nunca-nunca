import { useState } from 'react';
import { BackHandler, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AGE_KEY, MIN_AGE, legalUrl } from '../legal';

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
        <Text accessibilityRole="header" style={s.title}>Lo sentimos</Text>
        <Text style={s.body}>Este juego es solo para mayores de {MIN_AGE} años.</Text>
        {Platform.OS === 'android' ? (
          <Pressable style={[s.btn, s.ghost]} accessibilityRole="button" accessibilityLabel="Salir" onPress={() => BackHandler.exitApp()}>
            <Text style={s.btnTxt}>Salir</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
  return (
    <View style={s.wrap}>
      <Text accessibilityRole="header" style={s.title}>Solo mayores de {MIN_AGE}</Text>
      <Text style={s.body}>Incluye contenido para adultos y referencias al alcohol. Juega con responsabilidad.</Text>
      <Text style={s.small}>
        Al continuar aceptas los{' '}
        <Text style={s.link} accessibilityRole="link" onPress={() => Linking.openURL(legalUrl('terminos')).catch(() => {})}>Términos</Text>
        {' '}y la{' '}
        <Text style={s.link} accessibilityRole="link" onPress={() => Linking.openURL(legalUrl('privacidad')).catch(() => {})}>Política de privacidad</Text>.
      </Text>
      <Pressable style={s.btn} accessibilityRole="button" accessibilityLabel={`Tengo ${MIN_AGE} años o más`} onPress={accept}>
        <Text style={s.btnTxt}>Tengo {MIN_AGE} años o más</Text>
      </Pressable>
      <Pressable style={[s.btn, s.ghost]} accessibilityRole="button" accessibilityLabel="Soy menor de edad" onPress={() => setMinor(true)}>
        <Text style={s.btnTxt}>Soy menor de edad</Text>
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
