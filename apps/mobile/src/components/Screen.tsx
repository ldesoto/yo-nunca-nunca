import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

export function Screen({ children, style, ...rest }: ViewProps) {
  return (
    <LinearGradient colors={[colors.bg0, colors.bg1, '#2A1050']} style={styles.fill}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.fill}>
        <View style={[styles.inner, style]} {...rest}>
          {children}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 18 },
});
