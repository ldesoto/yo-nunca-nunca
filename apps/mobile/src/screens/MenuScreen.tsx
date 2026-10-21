import React from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { colors, fonts } from '../theme';
import { t } from '../i18n';
import { inviteWhatsApp, shareApp } from '../growth';
import { legalUrl } from '../legal';
import { FadeIn, AnimatedPress } from '../motion';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Menu'>;
type Row = { icon: string; label: string; onPress: () => void; role?: 'button' | 'link' };

/** Menú secundario "Más": todo lo que no es jugar. */
export function MenuScreen({ navigation }: Props) {
  const rows: Row[] = [
    {
      icon: '⚙️',
      label: t('home.tabSettings'),
      onPress: () => navigation.navigate('Settings'),
    },
    { icon: '💬', label: t('growth.invite'), onPress: () => void inviteWhatsApp() },
    { icon: '📲', label: t('growth.share'), onPress: () => void shareApp() },
    {
      icon: '🎮',
      label: t('growth.moreGames'),
      onPress: () => navigation.navigate('MoreGames'),
    },
    {
      icon: '🔒',
      label: t('menu.privacy'),
      onPress: () => {
        void Linking.openURL(legalUrl('privacidad')).catch(() => {});
      },
      role: 'link',
    },
  ];

  return (
    <Screen style={{ paddingHorizontal: 0, paddingTop: 0 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 8,
        }}
      >
        <View accessibilityRole="header">
          <Text
            style={{
              fontFamily: fonts.display,
              color: colors.text,
              fontSize: 30,
              fontWeight: '800',
            }}
          >
            {t('menu.title')}
          </Text>
        </View>
        <AnimatedPress
          label={t('menu.close')}
          onPress={() => navigation.goBack()}
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.glass,
            borderWidth: 1.5,
            borderColor: colors.glassBorder,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 22 }}>✕</Text>
        </AnimatedPress>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
        {rows.map((r, i) => (
          <FadeIn key={r.label} index={i}>
            <AnimatedPress
              label={r.label}
              role={r.role}
              onPress={r.onPress}
              style={{
                minHeight: 60,
                borderRadius: 20,
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                backgroundColor: colors.glass,
                borderWidth: 1.5,
                borderColor: colors.glassBorder,
              }}
            >
              <Text style={{ fontSize: 22 }}>{r.icon}</Text>
              <Text
                style={{
                  flex: 1,
                  fontFamily: fonts.display,
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: '700',
                }}
              >
                {r.label}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.display,
                  color: colors.accent,
                  fontSize: 20,
                  fontWeight: '800',
                }}
              >
                ›
              </Text>
            </AnimatedPress>
          </FadeIn>
        ))}
      </ScrollView>
    </Screen>
  );
}
