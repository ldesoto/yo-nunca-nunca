import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBombTimer } from '../hooks/useBombTimer';
import { useGameLogic } from '../hooks/useGameLogic';
import { ExitGadget } from '../components/ExitGadget';
import { exitWithOptionalAd } from '../ads';
import { gamesData } from '../data/games';
import type { RootStackParamList } from '../navigation';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Bomb'>;

/** No importar expo-av aquí: App carga esta pantalla al boot y expo-av tumba el proceso nativo. */
export function BombScreen({ navigation }: Props) {
  const { currentItem, drawNext, resetGame } = useGameLogic('bomb', gamesData.bomb);
  const exit = () => exitWithOptionalAd(() => navigation.goBack());
  const { isExploded, isActive, timeLeft, startBomb } = useBombTimer(10, 35);

  const scale = useSharedValue(1);

  const intensityFactor = Math.max(0.1, timeLeft / 35);
  const animDuration = Math.max(80, intensityFactor * 400);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: animDuration, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: animDuration, easing: Easing.in(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else {
      scale.value = withTiming(1);
    }
  }, [isActive, animDuration, scale, timeLeft]);

  useEffect(() => {
    let tickInterval: ReturnType<typeof setInterval> | undefined;

    if (isActive && timeLeft > 0) {
      const tickSpeed = Math.max(150, intensityFactor * 1000);

      tickInterval = setInterval(() => {
        Haptics.impactAsync(
          timeLeft < 10
            ? Haptics.ImpactFeedbackStyle.Heavy
            : Haptics.ImpactFeedbackStyle.Light,
        ).catch(() => {});
      }, tickSpeed);
    } else if (isExploded) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {},
      );
    }

    return () => {
      if (tickInterval) clearInterval(tickInterval);
    };
  }, [isActive, timeLeft, intensityFactor, isExploded]);

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: scale.value }] };
  });

  const handlePass = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    drawNext();
  };

  const startRound = () => {
    void resetGame().then(() => {
      drawNext();
      startBomb();
    });
  };

  if (isExploded) {
    return (
      <View style={[styles.container, { backgroundColor: '#FF2D95' }]}>
        <ExitGadget onPress={exit} light />
        <Text style={styles.explosionText}>{t('bomb.boom')}</Text>
        <Text style={styles.punishmentText}>{t('bomb.punishment')}</Text>
        <TouchableOpacity style={styles.passBtn} onPress={startRound}>
          <Text style={styles.passBtnText}>{t('common.playAgain')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exitBtn} onPress={exit}>
          <Text style={styles.exitBtnText}>{t('common.exitHome')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isActive) {
    return (
      <View style={styles.container}>
        <ExitGadget onPress={exit} />
        <Text style={styles.title}>{t('bomb.title')}</Text>
        <Text style={styles.desc}>{t('bomb.desc')}</Text>
        <TouchableOpacity style={styles.passBtn} onPress={startRound}>
          <Text style={styles.passBtnText}>{t('bomb.start')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ExitGadget onPress={exit} />
      <Text style={[styles.timer, timeLeft <= 5 && styles.timerDanger]}>
        00:{timeLeft.toString().padStart(2, '0')}
      </Text>

      <Text style={styles.categoryTitle}>{t('bomb.category')}</Text>
      <Text style={styles.categoryItem}>{currentItem}</Text>

      <Animated.Text style={[styles.bombEmoji, animatedStyle]}>💣</Animated.Text>

      <TouchableOpacity style={styles.massiveBtn} onPress={handlePass}>
        <Text style={styles.massiveBtnText}>{t('bomb.pass')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  exitBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  exitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  timer: {
    position: 'absolute',
    top: 50,
    right: 24,
    fontSize: 40,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
  },
  timerDanger: { color: '#FF2D95', transform: [{ scale: 1.2 }] },
  title: { fontSize: 48, fontWeight: '900', color: '#FFF', marginBottom: 20 },
  desc: { fontSize: 18, color: '#AAA', textAlign: 'center', marginBottom: 40 },
  categoryTitle: {
    fontSize: 24,
    color: '#2DE2E6',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoryItem: {
    fontSize: 36,
    color: '#FFF',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 40,
  },
  bombEmoji: { fontSize: 140, marginBottom: 40 },
  massiveBtn: {
    backgroundColor: '#FF8A3D',
    width: '100%',
    paddingVertical: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  massiveBtnText: { color: '#FFF', fontSize: 40, fontWeight: '900' },
  passBtn: {
    backgroundColor: '#2DE2E6',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 30,
  },
  passBtnText: { color: '#000', fontSize: 24, fontWeight: 'bold' },
  explosionText: { fontSize: 80, fontWeight: '900', color: '#FFF', marginBottom: 20 },
  punishmentText: {
    fontSize: 24,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
