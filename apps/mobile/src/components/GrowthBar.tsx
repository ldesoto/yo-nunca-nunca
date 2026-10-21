import { StyleSheet, View } from 'react-native';
import { PartyButton } from './PartyButton';
import { SectionLabel } from './GlassCard';
import { inviteWhatsApp, shareApp } from '../growth';
import { t } from '../i18n';

export function GrowthBar({ onMoreGames }: { onMoreGames: () => void }) {
  return (
    <View style={styles.wrap}>
      <SectionLabel>{t('growth.title')}</SectionLabel>
      <PartyButton label={t('growth.invite')} variant="yes" onPress={() => void inviteWhatsApp()} />
      <View style={styles.row}>
        <PartyButton
          label={t('growth.share')}
          variant="cyan"
          style={styles.half}
          onPress={() => void shareApp()}
        />
        <PartyButton
          label={t('growth.moreGames')}
          variant="ghost"
          style={styles.half}
          onPress={onMoreGames}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
});
