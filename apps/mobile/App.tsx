import 'react-native-gesture-handler';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
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
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { colors, assertStoreSafeEndpoints } from './src/theme';
import { loadRuntimeServerOverride } from './src/serverEndpoints';

assertStoreSafeEndpoints();

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

  useEffect(() => {
    void loadRuntimeServerOverride().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.bg0, justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.neonPink} />
      </View>
    );
  }

  return (
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
          </Stack.Navigator>
        </NavigationContainer>
      </GameProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
