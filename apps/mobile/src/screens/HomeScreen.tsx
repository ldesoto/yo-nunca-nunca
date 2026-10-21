import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { MenuButton } from '../MenuButton';
import { FadeIn, AnimatedPress } from '../motion';
import { wakeServer } from '../api';
import { colors, fonts } from '../theme';
import { t } from '../i18n';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const LOGO = require('../../assets/logo.png');
/** alto/ancho del logo generado (421×1024). */
const LOGO_RATIO = 421 / 1024;

/** Menú principal: logo → lema → CTA "Jugar" → acción secundaria. Lo demás vive en ☰ (Menu). */
export function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const logoW = Math.min(width - 48, 400);

  const playClassic = () => {
    wakeServer();
    navigation.navigate('Create');
  };

  return (
    <Screen style={styles.screenPad}>
      <View style={styles.topBar}>
        <MenuButton />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <FadeIn index={0} style={styles.logoWrap}>
          <Image
            source={LOGO}
            accessibilityRole="image"
            accessibilityLabel={t('home.brand')}
            resizeMode="contain"
            style={{ width: logoW, height: logoW * LOGO_RATIO }}
          />
        </FadeIn>

        <FadeIn index={1} style={styles.tagWrap}>
          <Text style={styles.tagline}>{t('home.tagline')}</Text>
          <Text style={styles.context}>{t('home.playSub')}</Text>
        </FadeIn>

        <FadeIn index={2} style={styles.ctaWrap}>
          <AnimatedPress
            pulse
            label={`${t('home.play')}, ${t('home.mode.ynn.title')}`}
            onPress={playClassic}
            style={styles.primaryCta}
          >
            <Text style={styles.primaryLabel}>{t('home.play')}</Text>
          </AnimatedPress>
        </FadeIn>

        <FadeIn index={3} style={styles.secondaryWrap}>
          <AnimatedPress
            label={t('home.modes')}
            onPress={() => navigation.navigate('Modes')}
            style={styles.secondaryPill}
          >
            <Text style={styles.secondaryLabel}>{t('home.modes')}</Text>
          </AnimatedPress>
        </FadeIn>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenPad: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
  },
  tagWrap: {
    alignItems: 'center',
    marginTop: 14,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 17,
    fontWeight: '600',
    color: colors.dim,
    textAlign: 'center',
  },
  context: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '500',
    color: colors.muted,
    textAlign: 'center',
  },
  ctaWrap: {
    marginTop: 34,
  },
  primaryCta: {
    minHeight: 70,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  primaryLabel: {
    fontFamily: fonts.display,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: colors.ink,
  },
  secondaryWrap: {
    marginTop: 14,
    alignItems: 'center',
  },
  secondaryPill: {
    minHeight: 48,
    paddingHorizontal: 22,
    borderRadius: 16,
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
  },
  secondaryLabel: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
});
