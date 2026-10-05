import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_META, colors, fonts, type CategoryId } from '../theme';

export function CategoryPicker({
  selected,
  onChange,
  compact,
}: {
  selected: CategoryId[];
  onChange: (next: CategoryId[]) => void;
  compact?: boolean;
}) {
  const toggle = (id: CategoryId) => {
    if (id === 'todas') {
      onChange(['todas']);
      return;
    }
    const withoutAll = selected.filter((s) => s !== 'todas');
    const exists = withoutAll.includes(id);
    const next = exists
      ? withoutAll.filter((s) => s !== id)
      : [...withoutAll, id];
    onChange(next.length ? next : ['todas']);
  };

  return (
    <View style={styles.wrap}>
      {CATEGORY_META.filter((c) => (compact ? c.id !== 'picante' && c.id !== 'sin_filtro' : true)).map(
        (cat) => {
          const active = selected.includes(cat.id);
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
              ]}
            >
              <Text style={styles.emoji}>{cat.emoji}</Text>
              <Text style={[styles.text, active && { color: colors.text }]}>{cat.label}</Text>
            </Pressable>
          );
        },
      )}
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
  emoji: { fontSize: 14 },
  text: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontWeight: '700',
    fontSize: 13,
  },
});
