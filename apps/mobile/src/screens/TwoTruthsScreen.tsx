import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LocalGameChrome } from '../components/LocalGameChrome';
import { PartyButton } from '../components/PartyButton';
import { useGameLogic } from '../hooks/useGameLogic';
import gamesData from '../data/gamesData.json';
import { colors, fonts } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'TwoTruths'>;

export function TwoTruthsScreen({ navigation }: Props) {
  const [round, setRound] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const { currentItem, drawNext, isFinished, resetGame } = useGameLogic(
    gamesData.twoTruthsIdeas,
  );

  const handleIdea = () => {
    if (isFinished) resetGame();
    drawNext();
    setModalVisible(true);
  };

  return (
    <LocalGameChrome
      onBack={() => navigation.goBack()}
      accent="#818CF8"
      kicker="Adivina la mentira"
      title="2 verdades, 1 mentira"
      footer={
        <>
          <PartyButton
            label="SIGUIENTE JUGADOR"
            variant="never"
            onPress={() => setRound((n) => n + 1)}
          />
          <PartyButton label="¡DAME UNA IDEA!" variant="cyan" onPress={handleIdea} />
        </>
      }
    >
      <Animated.View entering={FadeIn} style={styles.center}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Jugador {round}</Text>
        </View>
        <Text style={styles.instruction}>
          Cuenta dos verdades y una mentira. El grupo vota cuál es falsa.
        </Text>
        <View style={styles.tips}>
          <Text style={styles.tip}>① Habla con cara de poker</Text>
          <Text style={styles.tip}>② Mezcla algo creíble con algo loco</Text>
          <Text style={styles.tip}>③ Si te trabas… bebida</Text>
        </View>
      </Animated.View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalKicker}>SUGERENCIA</Text>
            <Text style={styles.modalIdea}>
              {currentItem || '¡Piensa en tu infancia!'}
            </Text>
            <PartyButton
              label="CERRAR"
              variant="never"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </LocalGameChrome>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingHorizontal: 6 },
  pill: {
    backgroundColor: 'rgba(129,140,248,0.2)',
    borderColor: 'rgba(129,140,248,0.55)',
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 22,
  },
  pillText: {
    color: '#C7D2FE',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  instruction: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  tips: {
    marginTop: 28,
    gap: 10,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tip: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5,2,12,0.82)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#160B28',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(129,140,248,0.5)',
  },
  modalKicker: {
    color: '#818CF8',
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 11,
    marginBottom: 12,
  },
  modalIdea: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    fontFamily: fonts.display,
    lineHeight: 28,
    marginBottom: 8,
  },
});
