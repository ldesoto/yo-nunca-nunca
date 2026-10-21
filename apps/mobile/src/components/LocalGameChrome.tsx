import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from './Screen';
import { colors, fonts } from '../theme';
import { t } from '../i18n';

export function LocalGameChrome({
  onBack,
  accent,
  kicker,
  title,
  children,
  footer,
}: {
  onBack: () => void;
  accent: string;
  kicker: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Screen>
      <View style={styles.top}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('common.exit')}
        >
          <Text style={styles.backIcon}>✕</Text>
          <Text style={styles.backLabel}>{t('common.exit')}</Text>
        </Pressable>
        <View style={styles.titles}>
          <Text style={[styles.kicker, { color: accent }]}>{kicker}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.backSpacer} />
      </View>
      <View style={styles.body}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  back: {
    minWidth: 72,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  backLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  backSpacer: { minWidth: 72 },
  titles: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },
  kicker: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 4,
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  body: { flex: 1, justifyContent: 'center' },
  footer: { paddingBottom: 8, gap: 8 },
});
