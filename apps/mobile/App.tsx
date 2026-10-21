import 'react-native-gesture-handler';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Image, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { GameProvider } from './src/GameContext';
import type { RootStackParamList } from './src/navigation';
import { HomeScreen } from './src/screens/HomeScreen';
import { CreateScreen } from './src/screens/CreateScreen';
import { JoinScreen } from './src/screens/JoinScreen';
import { LobbyScreen } from './src/screens/LobbyScreen';
import { PlayScreen } from './src/screens/PlayScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { MostLikelyScreen } from './src/screens/MostLikelyScreen';
import { TwoTruthsScreen } from './src/screens/TwoTruthsScreen';
import { TruthOrDrinkScreen } from './src/screens/TruthOrDrinkScreen';
import { CharadesScreen } from './src/screens/CharadesScreen';
import { BombScreen } from './src/screens/BombScreen';
import { MoreGamesScreen } from './src/screens/MoreGamesScreen';
import { trackSession } from './src/growth';
import { colors } from './src/theme';
import { loadRuntimeServerOverride } from './src/serverEndpoints';
import { loadSettings } from './src/settingsStore';
import { initAudio } from './src/audio';
import { initAds } from './src/ads';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AgeGate } from './src/components/AgeGate';
import { AGE_KEY } from './src/legal';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg0,
    card: colors.bg1,
    text: colors.text,
    primary: colors.neonPink,
    border: 'transparent',
  },
};

export default function App() {
  const [ready, setReady] = useState(false);
  const [ageOk, setAgeOk] = useState<boolean | null>(null);

  useEffect(() => {
    void trackSession();
    let cancelled = false;
    const minSplash = new Promise((r) => setTimeout(r, 900));
    void Promise.all([
      minSplash,
      loadRuntimeServerOverride().catch(() => {}),
      AsyncStorage.getItem(AGE_KEY).then((v) => setAgeOk(!!v)).catch(() => setAgeOk(false)),
      loadSettings()
        .then(() => initAudio())
        .catch(() => {
          // settings corruptos → app sigue
        }),
    ]).finally(() => {
      if (cancelled) return;
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // AdMob (con consentimiento UMP) solo tras pasar la puerta de edad y pintar la UI.
  useEffect(() => {
    if (!ready || !ageOk) return;
    const t = setTimeout(() => void initAds().catch(() => {}), 1500);
    return () => clearTimeout(t);
  }, [ready, ageOk]);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <Image
          source={require('./assets/icon.png')}
          style={styles.splashLogo}
          resizeMode="contain"
        />
        <Text style={styles.splashBrand}>EL CORO</Text>
      </View>
    );
  }

  if (!ageOk) {
    return <AgeGate onOk={() => setAgeOk(true)} />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.fill}>
        <GameProvider>
          <NavigationContainer theme={navTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Create" component={CreateScreen} />
              <Stack.Screen name="Join" component={JoinScreen} />
              <Stack.Screen name="Lobby" component={LobbyScreen} />
              <Stack.Screen name="Play" component={PlayScreen} />
              <Stack.Screen name="GameOver" component={GameOverScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="MostLikely" component={MostLikelyScreen} />
              <Stack.Screen name="TwoTruths" component={TwoTruthsScreen} />
              <Stack.Screen name="TruthOrDrink" component={TruthOrDrinkScreen} />
              <Stack.Screen name="Charades" component={CharadesScreen} />
              <Stack.Screen name="Bomb" component={BombScreen} />
              <Stack.Screen name="MoreGames" component={MoreGamesScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </GameProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  splash: {
    flex: 1,
    backgroundColor: '#0B0614',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  splashLogo: {
    width: 128,
    height: 128,
    borderRadius: 32,
  },
  splashBrand: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
