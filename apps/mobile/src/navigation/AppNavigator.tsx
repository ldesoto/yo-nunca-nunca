import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { MostLikelyScreen } from '../screens/MostLikelyScreen';
import { TwoTruthsScreen } from '../screens/TwoTruthsScreen';
import { TruthOrDrinkScreen } from '../screens/TruthOrDrinkScreen';
import { t } from '../i18n';

export type RootStackParamList = {
  Home: undefined;
  MostLikely: undefined;
  TwoTruths: undefined;
  TruthOrDrink: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#1A1A1A' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: '#121212' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Party Games' }} />
      <Stack.Screen
        name="MostLikely"
        component={MostLikelyScreen}
        options={{ title: t('nav.mostLikely') }}
      />
      <Stack.Screen
        name="TwoTruths"
        component={TwoTruthsScreen}
        options={{ title: t('nav.twoTruths') }}
      />
      <Stack.Screen
        name="TruthOrDrink"
        component={TruthOrDrinkScreen}
        options={{ title: t('nav.truthOrDrink') }}
      />
    </Stack.Navigator>
  );
};
