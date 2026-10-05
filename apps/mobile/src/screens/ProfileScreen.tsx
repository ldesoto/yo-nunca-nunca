import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { Field, GlassCard, SectionLabel } from '../components/GlassCard';
import { colors, typography } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

type Profile = {
  name: string;
  avatar: string;
  gamesPlayed: number;
  gamesWon: number;
  yesAnswers: number;
};

const AVATARS = ['🦊', '🐯', '🐸', '🦄', '👽', '👻', '🐼', '🐙'];
const KEY = 'ynn.profile.v1';

const DEFAULT: Profile = {
  name: 'Jugador',
  avatar: '🦊',
  gamesPlayed: 0,
  gamesWon: 0,
  yesAnswers: 0,
};

export function ProfileScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<Profile>(DEFAULT);

  useEffect(() => {
    void AsyncStorage.getItem(KEY).then((raw) => {
      if (!raw) return;
      try {
        setProfile({ ...DEFAULT, ...JSON.parse(raw) });
      } catch {
        // ignore
      }
    });
  }, []);

  const save = async (next: Profile) => {
    setProfile(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  };

  return (
    <Screen scroll>
      <Text style={typography.title}>Perfil</Text>
      <GlassCard glow="pink" style={{ alignItems: 'center', marginTop: 8 }}>
        <Text style={styles.avatarHuge}>{profile.avatar}</Text>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.meta}>
          {profile.gamesPlayed} partidas · {profile.gamesWon} ganadas
        </Text>
      </GlassCard>

      <SectionLabel>Nombre local</SectionLabel>
      <Field
        value={profile.name}
        onChangeText={(name) => void save({ ...profile, name })}
        maxLength={20}
      />

      <SectionLabel>Avatar</SectionLabel>
      <View style={styles.avatars}>
        {AVATARS.map((a) => (
          <PartyButton
            key={a}
            label={a}
            variant={profile.avatar === a ? 'pink' : 'ghost'}
            onPress={() => void save({ ...profile, avatar: a })}
            style={{ minWidth: 64 }}
          />
        ))}
      </View>

      <GlassCard style={{ marginTop: 12 }}>
        <Text style={styles.stat}>Respuestas “Sí”: {profile.yesAnswers}</Text>
        <Text style={styles.statMuted}>
          Las stats se guardan en este dispositivo (sin cuenta obligatoria).
        </Text>
      </GlassCard>

      <PartyButton label="Volver" variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarHuge: { fontSize: 64, marginBottom: 8 },
  name: { color: colors.text, fontSize: 28, fontWeight: '900' },
  meta: { color: colors.muted, marginTop: 4, fontWeight: '600' },
  avatars: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  stat: { color: colors.text, fontWeight: '800', fontSize: 16 },
  statMuted: { color: colors.muted, marginTop: 8, lineHeight: 20 },
});
