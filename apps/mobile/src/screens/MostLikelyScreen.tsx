import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LocalGameChrome } from '../components/LocalGameChrome';
import { PartyButton } from '../components/PartyButton';
import { useGameLogic } from '../hooks/useGameLogic';
import { exitWithOptionalAd } from '../ads';
import { gamesData } from '../data/games';
import { colors, fonts } from '../theme';
import type { RootStackParamList } from '../navigation';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'MostLikely'>;

export function MostLikelyScreen({ navigation }: Props) {
  const { currentItem, isFinished, drawNext, resetGame, ready } = useGameLogic('mostLikely', gamesData.mostLikely);

  useEffect(() => {
    if (ready) drawNext();
  }, [ready, drawNext]);

  const restart = () => {
    void resetGame().then(() => drawNext());
  };

  return (
    <LocalGameChrome
      onBack={() => exitWithOptionalAd(() => navigation.goBack())}
      accent="#FB923C"
      kicker={t('most.kicker')}
      title={t('most.title')}
      footer={
        isFinished ? (
          <PartyButton label={t('most.nextRound')} variant="orange" onPress={restart} />
        ) : (
          <PartyButton label={t('most.next')} variant="orange" onPress={drawNext} />
        )
      }
    >
      {isFinished ? (
        <Animated.View entering={FadeIn} style={styles.center}>
          <Text style={styles.doneEmoji}>🎯</Text>
          <Text style={styles.doneTitle}>{t('most.doneTitle')}</Text>
          <Text style={styles.doneSub}>{t('most.doneSub')}</Text>
        </Animated.View>
      ) : (
        <Pressable onPress={drawNext} style={styles.center}>
          <Animated.View entering={FadeInDown.duration(350)} key={currentItem ?? 'x'}>
            <Text style={styles.prompt}>{t('most.prompt')}</Text>
            <View style={styles.card}>
              <Text style={styles.question}>{currentItem}</Text>
            </View>
            <Text style={styles.hint}>{t('most.hint')}</Text>
          </Animated.View>
        </Pressable>
      )}
    </LocalGameChrome>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  prompt: {
    color: '#FB923C',
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
    textAlign: 'center',
    marginBottom: 18,
  },
  card: {
    backgroundColor: 'rgba(251,146,60,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(251,146,60,0.45)',
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 22,
    minHeight: 200,
    justifyContent: 'center',
  },
  question: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  hint: {
    marginTop: 22,
    color: colors.muted,
    textAlign: 'center',
    fontWeight: '600',
  },
  doneEmoji: { fontSize: 56, marginBottom: 12 },
  doneTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    fontFamily: fonts.display,
  },
  doneSub: { marginTop: 8, color: colors.muted, fontSize: 15 },
});
