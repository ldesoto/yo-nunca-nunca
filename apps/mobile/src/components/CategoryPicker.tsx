import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { isPremiumCategory } from '@ynn/shared';
import { CATEGORY_META, colors, fonts, type CategoryId } from '../theme';
import {
  isPremiumUnlocked,
  loadPremium,
  requirePremiumForCategory,
  subscribePremium,
} from '../premium';
import { track } from '../analytics';

export function CategoryPicker({
  selected,
  onChange,
  compact,
  onPremiumRequired,
}: {
  selected: CategoryId[];
  onChange: (next: CategoryId[]) => void;
  compact?: boolean;
  onPremiumRequired?: () => void;
}) {
  const [premium, setPremium] = useState(isPremiumUnlocked());

  useEffect(() => {
    void loadPremium().then(setPremium);
    return subscribePremium(setPremium);
  }, []);

  const toggle = (id: CategoryId) => {
    if (requirePremiumForCategory(id)) {
      onPremiumRequired?.();
      return;
    }
    if (id === 'todas') {
      onChange(['todas']);
      track('category_selected', { category: 'todas', multi: 1 });
      return;
    }
    const withoutAll = selected.filter((s) => s !== 'todas');
    const exists = withoutAll.includes(id);
    const next = exists
      ? withoutAll.filter((s) => s !== id)
      : [...withoutAll, id];
    const resolved = next.length ? next : (['todas'] as CategoryId[]);
    onChange(resolved);
    track('category_selected', { category: id, multi: resolved.length });
  };

  return (
    <View style={styles.wrap}>
      {CATEGORY_META.filter((c) =>
        compact ? c.id !== 'picante' && c.id !== 'sin_filtro' : true,
      ).map((cat) => {
        const active = selected.includes(cat.id);
        const locked = isPremiumCategory(cat.id) && !premium;
        return (
          <Pressable
            key={cat.id}
            onPress={() => toggle(cat.id)}
            style={[
              styles.chip,
              active && {
                backgroundColor: `${cat.tint}33`,
                borderColor: cat.tint,
              },
              locked && styles.chipLocked,
            ]}
          >
            <Text style={styles.emoji}>{cat.emoji}</Text>
            <Text style={[styles.text, active && { color: colors.text }]}>
              {cat.label}
            </Text>
            {locked ? <Text style={styles.lock}>✦</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  chipLocked: {
    opacity: 0.72,
    borderStyle: 'dashed',
  },
  emoji: { fontSize: 14 },
  text: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontWeight: '700',
    fontSize: 13,
  },
  lock: {
    color: colors.neonOrange,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 2,
  },
});
