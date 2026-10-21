import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PartyButton } from '../components/PartyButton';
import { GlassCard } from '../components/GlassCard';
import { colors, typography } from '../theme';
import { OTHER_GAMES } from '../growthConfig';
import { openStoreListing } from '../growth';
import type { RootStackParamList } from '../navigation';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'MoreGames'>;

export function MoreGamesScreen({ navigation }: Props) {
  return (
    <Screen scroll>
      <Text style={styles.title}>{t('growth.more.title')}</Text>
      <Text style={styles.sub}>{t('growth.more.sub')}</Text>
      {OTHER_GAMES.map((g) => (
        <GlassCard key={g.id} glow="cyan" style={styles.card}>
          <View>
            <Text style={styles.name}>{t(`growth.game.${g.id}.name`)}</Text>
            <Text style={styles.desc}>{t(`growth.game.${g.id}.desc`)}</Text>
          </View>
          <PartyButton
            label={t('growth.more.install')}
            variant="orange"
            onPress={() => void openStoreListing(g.packageName)}
          />
        </GlassCard>
      ))}
      <PartyButton label={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: typography.title,
  sub: { ...typography.body, marginTop: 6, marginBottom: 10 },
  card: { marginTop: 12 },
  name: { color: colors.text, fontSize: 18, fontWeight: '800' },
  desc: { color: colors.muted, fontSize: 14, marginTop: 4, fontWeight: '500' },
});
