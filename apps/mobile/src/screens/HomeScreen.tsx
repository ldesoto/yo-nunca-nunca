import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { GlassCard } from '../components/GlassCard';
import { colors, typography } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={{ flex: 1 }}>
      <Animated.View entering={FadeInUp.duration(500)} style={styles.hero}>
        <Text style={typography.kicker}>PARTY GAME</Text>
        <Text style={typography.hero}>
          YO NUNCA{'\n'}
          <Text style={styles.titleAccent}>NUNCA</Text>
        </Text>
        <Text style={[typography.body, styles.sub]}>
          Responde en secreto. Revela con drama. Que gane el más atrevido.
        </Text>
        <GlassCard glow="pink" style={styles.badge}>
          <Text style={styles.badgeText}>2–12 jugadores · online o en la misma mesa</Text>
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(450)} style={styles.actions}>
        <PartyButton
          label="CREAR PARTIDA"
          subtitle="Sé el anfitrión"
          onPress={() => navigation.navigate('Create')}
        />
        <PartyButton
          label="UNIRSE"
          variant="cyan"
          subtitle="Con código de sala"
          onPress={() => navigation.navigate('Join')}
        />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <PartyButton
              label="SOLO"
              variant="ghost"
              onPress={() => navigation.navigate('Create', { solo: true })}
            />
          </View>
          <View style={{ flex: 1 }}>
            <PartyButton
              label="PERFIL"
              variant="ghost"
              onPress={() => navigation.navigate('Profile')}
            />
          </View>
        </View>
        <PartyButton
          label="CONFIGURACIÓN"
          variant="ghost"
          onPress={() => navigation.navigate('Settings')}
        />
      </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: 28, paddingBottom: 18 },
  titleAccent: { color: colors.neonPink },
  sub: { marginTop: 16, maxWidth: 320 },
  badge: { marginTop: 22, paddingVertical: 12 },
  badgeText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  actions: { marginTop: 'auto', paddingBottom: 4 },
  row: { flexDirection: 'row', gap: 10 },
});
