import * as Haptics from 'expo-haptics';
import { getSettings } from './settingsStore';
import { playSfx, type SfxName } from './audio';

type HapticKind = 'selection' | 'light' | 'medium' | 'success' | 'warning';

export async function feedback(opts: {
  sfx?: SfxName;
  haptic?: HapticKind;
}): Promise<void> {
  const s = getSettings();
  if (opts.sfx) void playSfx(opts.sfx);
  if (!opts.haptic || !s.haptics) return;
  try {
    switch (opts.haptic) {
      case 'selection':
        await Haptics.selectionAsync();
        break;
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
    }
  } catch {
    // unsupported platform
  }
}
