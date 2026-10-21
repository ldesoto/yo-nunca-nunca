import { useEffect } from 'react';
import {
  BackHandler,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PartyButton } from './PartyButton';
import { inviteWhatsApp, shareApp } from '../growth';
import { colors, fonts } from '../theme';
import { t } from '../i18n';

type Props = {
  visible: boolean;
  onClose: () => void;
  onProfile: () => void;
  onSettings: () => void;
  onMoreGames: () => void;
};

export function MoreSheet({
  visible,
  onClose,
  onProfile,
  onSettings,
  onMoreGames,
}: Props) {
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
        />
        <View style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.handle} />
          <Text style={styles.title}>{t('home.moreTitle')}</Text>

          <PartyButton
            label={t('growth.invite')}
            variant="yes"
            onPress={() => {
              void inviteWhatsApp();
            }}
          />
          <View style={styles.row}>
            <PartyButton
              label={t('growth.share')}
              variant="cyan"
              style={styles.half}
              onPress={() => {
                void shareApp();
              }}
            />
            <PartyButton
              label={t('growth.moreGames')}
              variant="ghost"
              style={styles.half}
              onPress={() => {
                onClose();
                onMoreGames();
              }}
            />
          </View>

          <View style={styles.divider} />

          <PartyButton
            label={t('home.tabProfile')}
            variant="ghost"
            onPress={() => {
              onClose();
              onProfile();
            }}
          />
          <PartyButton
            label={t('home.tabSettings')}
            variant="ghost"
            onPress={() => {
              onClose();
              onSettings();
            }}
          />

          <PartyButton label={t('common.cancel')} variant="orange" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: '#120A20',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.28)',
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.display,
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginVertical: 10,
  },
});
