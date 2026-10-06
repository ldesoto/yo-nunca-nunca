import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { NeverHaveIEverScreen } from '../screens/NeverHaveIEverScreen';
import { MostLikelyScreen } from '../screens/MostLikelyScreen';
import { TwoTruthsScreen } from '../screens/TwoTruthsScreen';
import { TruthOrDrinkScreen } from '../screens/TruthOrDrinkScreen';

export type RootStackParamList = {
  Home: undefined;
  NeverHaveIEver: undefined;
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
        contentStyle: { backgroundColor: '#121212' }
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Party Games' }} />
      <Stack.Screen name="NeverHaveIEver" component={NeverHaveIEverScreen} options={{ title: 'Yo Nunca Nunca' }} />
      <Stack.Screen name="MostLikely" component={MostLikelyScreen} options={{ title: '¿Quién es más probable?' }} />
      <Stack.Screen name="TwoTruths" component={TwoTruthsScreen} options={{ title: '2 Verdades y 1 Mentira' }} />
      <Stack.Screen name="TruthOrDrink" component={TruthOrDrinkScreen} options={{ title: 'Verdad o Bebida' }} />
    </Stack.Navigator>
  );
};
