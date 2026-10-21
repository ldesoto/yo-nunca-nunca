import React from 'react';
import { Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from './theme';
import { t } from './i18n';
import type { RootStackParamList } from './navigation';

/** Botón ☰ arriba a la derecha que abre la pantalla "Más" (menú secundario). 48×48 dp. */
export function MenuButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Pressable
      testID="home-more-button"
      onPress={() => navigation.navigate('Menu')}
      accessibilityRole="button"
      accessibilityLabel={t('menu.open')}
      hitSlop={6}
      style={({ pressed }) => ({
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.glass,
        borderWidth: 1.5,
        borderColor: colors.glassBorder,
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}
    >
      <Text style={{ color: colors.text, fontSize: 22, lineHeight: 24 }} importantForAccessibility="no">
        ☰
      </Text>
    </Pressable>
  );
}
