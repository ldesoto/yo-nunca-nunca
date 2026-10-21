import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Field } from '../components/GlassCard';
import { fonts } from '../theme';
import type { RootStackParamList } from '../navigation';
import {
  DEFAULT_PROFILE,
  loadProfile,
  saveProfile,
  type PlayerProfile,
} from '../profileStats';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const AVATARS = ['🦊', '🐯', '🐸', '🦄', '👽', '👻', '🐼', '🐙', '👑', '🔥', '🍾', '😈'];

export function ProfileScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    void loadProfile().then(setProfile);
  }, []);

  const save = async (next: PlayerProfile) => {
    setProfile(next);
    await saveProfile(next);
  };

  const displayName = profile.name.trim() || 'Jugador';

  return (
    <Screen scroll style={styles.pad}>
      <Pressable
        onPress={() => navigation.goBack()}
        style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}
        hitSlop={10}
      >
        <Text style={styles.backIcon}>✕</Text>
        <Text style={styles.backLabel}>Salir</Text>
      </Pressable>

      <Animated.View entering={FadeInUp.duration(420)} style={styles.heroWrap}>
        <LinearGradient
          colors={['#7C3AED', '#DB2777', '#F97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarHuge}>{profile.avatar}</Text>
            </View>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.tagline}>Así te ven en la fiesta</Text>
        </LinearGradient>
      </Animated.View>

      <Text style={styles.section}>Tu nombre</Text>
      <View style={styles.fieldWrap}>
        <Field
          value={profile.name}
          onChangeText={(name) => void save({ ...profile, name })}
          placeholder="¿Cómo te llaman en la fiesta?"
          maxLength={20}
        />
      </View>

      <Text style={styles.section}>Avatar</Text>
      <View style={styles.avatars}>
        {AVATARS.map((a) => {
          const active = profile.avatar === a;
          return (
            <Pressable
              key={a}
              onPress={() => void save({ ...profile, avatar: a })}
              style={[styles.avatarChip, active && styles.avatarChipOn]}
            >
              {active ? (
                <LinearGradient
                  colors={['#FDE047', '#F59E0B']}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
              <Text style={styles.avatarChipEmoji}>{a}</Text>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingBottom: 36 },
  back: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 72,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    marginBottom: 16,
  },
  backIcon: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  backLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  heroWrap: { marginBottom: 22 },
  heroCard: {
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginBottom: 14,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 50,
    backgroundColor: 'rgba(11,6,20,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHuge: { fontSize: 52 },
  name: {
    fontFamily: fonts.display,
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '600',
    fontSize: 13,
  },
  section: {
    marginTop: 8,
    marginBottom: 10,
    color: 'rgba(251,247,255,0.7)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  fieldWrap: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 8,
  },
  avatars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  avatarChip: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarChipOn: {
    borderColor: '#FACC15',
  },
  avatarChipEmoji: {
    fontSize: 26,
    zIndex: 1,
  },
});
