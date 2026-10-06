import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LocalGameChrome } from '../components/LocalGameChrome';
import { PartyButton } from '../components/PartyButton';
import { useGameLogic } from '../hooks/useGameLogic';
import gamesData from '../data/gamesData.json';
import { colors, fonts } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'MostLikely'>;

export function MostLikelyScreen({ navigation }: Props) {
  const { currentItem, isFinished, drawNext, resetGame } = useGameLogic(
    gamesData.mostLikely,
  );

  useEffect(() => {
    drawNext();
  }, [drawNext]);

  const restart = () => {
    resetGame();
    setTimeout(() => drawNext(), 0);
  };

  return (
    <LocalGameChrome
      onBack={() => navigation.goBack()}
      accent="#FB923C"
      kicker="Señala al culpable"
      title="¿Quién es más probable?"
      footer={
        isFinished ? (
          <PartyButton label="OTRA RONDA" variant="orange" onPress={restart} />
        ) : (
          <PartyButton label="SIGUIENTE" variant="orange" onPress={drawNext} />
        )
      }
    >
      {isFinished ? (
        <Animated.View entering={FadeIn} style={styles.center}>
          <Text style={styles.doneEmoji}>🎯</Text>
          <Text style={styles.doneTitle}>Ronda terminada</Text>
          <Text style={styles.doneSub}>¿Otra tanda de señalamientos?</Text>
        </Animated.View>
      ) : (
        <Pressable onPress={drawNext} style={styles.center}>
          <Animated.View entering={FadeInDown.duration(350)} key={currentItem ?? 'x'}>
            <Text style={styles.prompt}>¿Quién es más probable que…</Text>
            <View style={styles.card}>
              <Text style={styles.question}>{currentItem}</Text>
            </View>
            <Text style={styles.hint}>Toca para la siguiente</Text>
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
