import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LocalGameChrome } from '../components/LocalGameChrome';
import { PartyButton } from '../components/PartyButton';
import { useGameLogic } from '../hooks/useGameLogic';
import gamesData from '../data/gamesData.json';
import { colors, fonts } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'TruthOrDrink'>;

export function TruthOrDrinkScreen({ navigation }: Props) {
  const { currentItem, isFinished, drawNext, resetGame } = useGameLogic(
    gamesData.truthOrDrink,
  );
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useSharedValue(0);

  useEffect(() => {
    drawNext();
  }, [drawNext]);

  const flipCard = () => {
    const next = !flipped;
    setFlipped(next);
    flipAnim.value = withTiming(next ? 180 : 0, { duration: 480 });
  };

  const handleNext = () => {
    setFlipped(false);
    flipAnim.value = withTiming(0, { duration: 220 });
    setTimeout(() => drawNext(), 220);
  };

  const restart = () => {
    resetGame();
    setFlipped(false);
    flipAnim.value = 0;
    setTimeout(() => drawNext(), 0);
  };

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnim.value, [0, 180], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden' as const,
      position: 'absolute' as const,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnim.value, [0, 180], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden' as const,
    };
  });

  return (
    <LocalGameChrome
      onBack={() => navigation.goBack()}
      accent="#F472B6"
      kicker="Responde o bebe"
      title="Verdad o Bebida"
      footer={
        isFinished ? (
          <PartyButton label="BARAJAR DE NUEVO" onPress={restart} />
        ) : flipped ? (
          <>
            <PartyButton label="DIJE LA VERDAD 😎" variant="orange" onPress={handleNext} />
            <PartyButton label="ME TOCÓ BEBER 🍻" variant="ghost" onPress={handleNext} />
          </>
        ) : (
          <PartyButton label="REVELAR CARTA" onPress={flipCard} />
        )
      }
    >
      {isFinished ? (
        <Animated.View entering={FadeIn} style={styles.center}>
          <Text style={styles.doneEmoji}>🍹</Text>
          <Text style={styles.doneTitle}>Baraja vacía</Text>
          <Text style={styles.doneSub}>¿Otra ronda de verdades?</Text>
        </Animated.View>
      ) : (
        <View style={styles.center}>
          <Pressable onPress={!flipped ? flipCard : undefined}>
            <View style={styles.cardStage}>
              <Animated.View style={[styles.cardFace, backStyle]}>
                <LinearGradient
                  colors={['#F472B6', '#DB2777', '#9D174D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardFill}
                >
                  <Text style={styles.qm}>?</Text>
                  <Text style={styles.tapHint}>Toca para revelar</Text>
                </LinearGradient>
              </Animated.View>

              <Animated.View style={[styles.cardFace, frontStyle]}>
                <View style={[styles.cardFill, styles.cardFront]}>
                  <Text style={styles.frontKicker}>VERDAD</Text>
                  <Text style={styles.question}>{currentItem}</Text>
                </View>
              </Animated.View>
            </View>
          </Pressable>
        </View>
      )}
    </LocalGameChrome>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  cardStage: {
    width: 280,
    height: 380,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFace: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  cardFill: {
    flex: 1,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  cardFront: {
    backgroundColor: '#160B22',
    borderColor: 'rgba(244,114,182,0.55)',
  },
  qm: {
    fontSize: 110,
    fontWeight: '900',
    color: '#FFF',
    fontFamily: fonts.display,
  },
  tapHint: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    fontSize: 15,
  },
  frontKicker: {
    color: '#F472B6',
    fontWeight: '900',
    letterSpacing: 3,
    fontSize: 12,
    marginBottom: 16,
  },
  question: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 30,
    fontFamily: fonts.display,
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
