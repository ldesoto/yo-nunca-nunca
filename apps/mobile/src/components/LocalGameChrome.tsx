import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from './Screen';
import { colors, fonts } from '../theme';

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
        >
          <Text style={styles.backText}>←</Text>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  backSpacer: { width: 40 },
  titles: { flex: 1, alignItems: 'center' },
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
