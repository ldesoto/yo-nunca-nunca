import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { Field, GlassCard, SectionLabel } from '../components/GlassCard';
import { colors, typography } from '../theme';
import type { RootStackParamList } from '../navigation';
import {
  isPremiumUnlocked,
  loadPremium,
  subscribePremium,
} from '../premium';
import {
  DEFAULT_PROFILE,
  loadProfile,
  saveProfile,
  yesRate,
  type PlayerProfile,
} from '../profileStats';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const AVATARS = ['🦊', '🐯', '🐸', '🦄', '👽', '👻', '🐼', '🐙'];

export function ProfileScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_PROFILE);
  const [premium, setPremium] = useState(isPremiumUnlocked());

  useEffect(() => {
    void loadProfile().then(setProfile);
    void loadPremium().then(setPremium);
    return subscribePremium(setPremium);
  }, []);

  const save = async (next: PlayerProfile) => {
    setProfile(next);
    await saveProfile(next);
  };

  return (
    <Screen scroll>
      <Text style={typography.title}>Perfil</Text>
      <GlassCard glow="pink" style={{ alignItems: 'center', marginTop: 8 }}>
        <Text style={styles.avatarHuge}>{profile.avatar}</Text>
        <Text style={styles.name}>{profile.name}</Text>
        {premium ? <Text style={styles.premiumBadge}>✦ PREMIUM</Text> : null}
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
        {premium ? (
          <>
            <Text style={styles.stat}>% Sí (aprox.): {yesRate(profile)}%</Text>
            <Text style={styles.stat}>Mayoría: {profile.majorityCount}</Text>
            <Text style={styles.stat}>Minoría: {profile.minorityCount}</Text>
            <Text style={styles.stat}>Mejor score: {profile.bestScore}</Text>
            <Text style={styles.stat}>
              Racha: {profile.winStreak} (máx {profile.bestStreak})
            </Text>
            <Text style={styles.statMuted}>
              Stats avanzadas Premium — solo en este dispositivo.
            </Text>
          </>
        ) : (
          <Text style={styles.statMuted}>
            Activa Premium en Configuración para ver racha, mejor score y % de Sí.
          </Text>
        )}
      </GlassCard>

      <PartyButton label="Volver" variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarHuge: { fontSize: 64, marginBottom: 8 },
  name: { color: colors.text, fontSize: 28, fontWeight: '900' },
  premiumBadge: {
    marginTop: 6,
    color: colors.neonOrange,
    fontWeight: '900',
    letterSpacing: 1.2,
    fontSize: 12,
  },
  meta: { color: colors.muted, marginTop: 4, fontWeight: '600' },
  avatars: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  stat: { color: colors.text, fontWeight: '800', fontSize: 16, marginBottom: 6 },
  statMuted: { color: colors.muted, marginTop: 8, lineHeight: 20 },
});
