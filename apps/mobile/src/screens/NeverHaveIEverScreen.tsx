import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LocalGameChrome } from '../components/LocalGameChrome';
import { PartyButton } from '../components/PartyButton';
import { useGameLogic } from '../hooks/useGameLogic';
import gamesData from '../data/gamesData.json';
import { colors, fonts } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'NeverHaveIEver'>;

export function NeverHaveIEverScreen({ navigation }: Props) {
  const { currentItem, isFinished, drawNext, resetGame } = useGameLogic(
    gamesData.neverHaveIEver,
  );
  const [yesCount, setYesCount] = useState(0);
  const [neverCount, setNeverCount] = useState(0);
  const [answered, setAnswered] = useState(0);

  useEffect(() => {
    drawNext();
  }, [drawNext]);

  const answer = (did: boolean) => {
    if (did) setYesCount((n) => n + 1);
    else setNeverCount((n) => n + 1);
    setAnswered((n) => n + 1);
    drawNext();
  };

  const restart = () => {
    setYesCount(0);
    setNeverCount(0);
    setAnswered(0);
    resetGame();
    setTimeout(() => drawNext(), 0);
  };

  return (
    <LocalGameChrome
      onBack={() => navigation.goBack()}
      accent="#C084FC"
      kicker="Modo solo"
      title="Yo Nunca Nunca"
      footer={
        isFinished ? (
          <PartyButton label="OTRA RONDA" onPress={restart} />
        ) : (
          <>
            <PartyButton
              label="NUNCA"
              variant="never"
              onPress={() => answer(false)}
            />
            <PartyButton
              label="SÍ, LO HE HECHO"
              variant="yes"
              onPress={() => answer(true)}
            />
          </>
        )
      }
    >
      {isFinished ? (
        <Animated.View entering={ZoomIn} style={styles.center}>
          <Text style={styles.doneEmoji}>🤞</Text>
          <Text style={styles.doneTitle}>Fin de la ronda</Text>
          <View style={styles.stats}>
            <Text style={styles.statLine}>Sí: {yesCount}</Text>
            <Text style={styles.statLine}>Nunca: {neverCount}</Text>
            <Text style={styles.statMuted}>{answered} preguntas</Text>
          </View>
        </Animated.View>
      ) : (
        <Animated.View
          entering={FadeInUp.duration(320)}
          key={currentItem ?? 'q'}
          style={styles.center}
        >
          <Text style={styles.roundMeta}>
            Pregunta {answered + 1} · Solo
          </Text>
          <View style={styles.card}>
            <Text style={styles.question}>{currentItem}</Text>
          </View>
          <Text style={styles.hint}>Sé honesto… o bebe 🍻</Text>
        </Animated.View>
      )}
    </LocalGameChrome>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  roundMeta: {
    color: '#C084FC',
    fontWeight: '800',
    letterSpacing: 1,
    fontSize: 12,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(192,132,252,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(192,132,252,0.45)',
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 22,
    minHeight: 220,
    justifyContent: 'center',
  },
  question: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  hint: {
    marginTop: 20,
    color: colors.muted,
    fontWeight: '600',
    textAlign: 'center',
  },
  doneEmoji: { fontSize: 56, marginBottom: 10 },
  doneTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    fontFamily: fonts.display,
  },
  stats: {
    marginTop: 20,
    gap: 8,
    alignItems: 'center',
  },
  statLine: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  statMuted: {
    marginTop: 6,
    color: colors.muted,
    fontWeight: '600',
  },
});
