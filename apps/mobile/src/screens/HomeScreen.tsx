import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>PARTY GAME</Text>
        <Text style={styles.title}>YO NUNCA{'\n'}NUNCA</Text>
        <Text style={styles.sub}>
          Responde en secreto. Revela con drama. Que gane el más atrevido.
        </Text>
      </View>
      <View style={styles.actions}>
        <PartyButton
          label="CREAR PARTIDA"
          onPress={() => navigation.navigate('Create')}
        />
        <PartyButton
          label="UNIRSE"
          variant="cyan"
          onPress={() => navigation.navigate('Join')}
        />
        <PartyButton
          label="JUGAR SOLO"
          variant="ghost"
          onPress={() => navigation.navigate('Create', { solo: true })}
        />
        <PartyButton
          label="CONFIGURACIÓN"
          variant="ghost"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, justifyContent: 'center' },
  kicker: {
    color: colors.neonCyan,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 10,
  },
  title: {
    color: colors.text,
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 52,
    letterSpacing: -1,
  },
  sub: {
    color: colors.muted,
    fontSize: 16,
    marginTop: 16,
    lineHeight: 22,
    maxWidth: 320,
  },
  actions: { paddingBottom: 8 },
});
