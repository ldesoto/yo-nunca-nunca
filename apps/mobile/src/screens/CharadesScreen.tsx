import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useGameLogic } from '../hooks/useGameLogic';
import { useTiltSensor } from '../hooks/useTiltSensor';
import { ExitGadget } from '../components/ExitGadget';
import { exitWithOptionalAd } from '../ads';
import { gamesData } from '../data/games';
import type { RootStackParamList } from '../navigation';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Charades'>;

export function CharadesScreen({ navigation }: Props) {
  const { currentItem, drawNext, resetGame } = useGameLogic(
    'charades',
    gamesData.charades,
  );

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bgColor, setBgColor] = useState('#121212');

  const exit = useCallback(() => {
    void ScreenOrientation.unlockAsync();
    exitWithOptionalAd(() => navigation.goBack());
  }, [navigation]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      void ScreenOrientation.unlockAsync();
    };
  }, []);

  const handleCorrect = useCallback(() => {
    setBgColor('#00FF00');
    setScore((s) => s + 1);
    setTimeout(() => {
      setBgColor('#121212');
      drawNext();
    }, 500);
  }, [drawNext]);

  const handlePass = useCallback(() => {
    setBgColor('#FF0000');
    setTimeout(() => {
      setBgColor('#121212');
      drawNext();
    }, 500);
  }, [drawNext]);

  useTiltSensor(handleCorrect, handlePass, isPlaying);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    void resetGame().then(() => {
      drawNext();
      setIsPlaying(true);
    });
  };

  if (!isPlaying && timeLeft === 60) {
    return (
      <View style={styles.container}>
        <ExitGadget onPress={exit} />
        <Text style={styles.title}>{t('charades.title')}</Text>
        <Text style={styles.instruction}>{t('charades.inst1')}</Text>
        <Text style={styles.instruction}>{t('charades.inst2')}</Text>
        <Text style={styles.instruction}>{t('charades.inst3')}</Text>
        <TouchableOpacity style={styles.btn} onPress={startGame}>
          <Text style={styles.btnText}>{t('charades.start')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isPlaying && timeLeft === 0) {
    return (
      <View style={styles.container}>
        <ExitGadget onPress={exit} />
        <Text style={styles.title}>{t('charades.timeUp')}</Text>
        <Text style={styles.scoreText}>{t('charades.score', { n: score })}</Text>
        <TouchableOpacity style={styles.btn} onPress={startGame}>
          <Text style={styles.btnText}>{t('common.playAgain')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exitBtn} onPress={exit}>
          <Text style={styles.exitBtnText}>{t('common.exitHome')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ExitGadget onPress={exit} corner="bottom-left" />
      <Text style={styles.timer}>{timeLeft}s</Text>
      <Text style={styles.wordText}>{currentItem}</Text>
      <Text style={styles.scoreFloat}>{t('charades.points', { n: score })}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#121212',
  },
  title: { fontSize: 40, color: '#FFF', fontWeight: 'bold', marginBottom: 20 },
  instruction: { fontSize: 20, color: '#AAA', marginBottom: 10, textAlign: 'center' },
  btn: { backgroundColor: '#FF2D95', padding: 20, borderRadius: 30, marginTop: 30 },
  btnText: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  exitBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  exitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  wordText: { fontSize: 70, color: '#FFF', fontWeight: '900', textAlign: 'center' },
  timer: {
    position: 'absolute',
    top: 20,
    right: 30,
    fontSize: 30,
    color: '#FFF',
    fontWeight: 'bold',
  },
  scoreFloat: {
    position: 'absolute',
    top: 20,
    left: 30,
    fontSize: 30,
    color: '#FFF',
    fontWeight: 'bold',
  },
  scoreText: { fontSize: 60, color: '#2DE2E6', fontWeight: '900' },
});
