// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { COLORS } from '../constants/theme';
import { RAGProvider } from './context/RAGContext';

export default function Layout() {
  return (
    <RAGProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="map" />
        <Stack.Screen name="secretvault" />
        <Stack.Screen name="subscription" options={{ presentation: 'modal' }} />
        <Stack.Screen name="SurvivalManuals" />
        <Stack.Screen name="ChatScreen" />
      </Stack>
    </RAGProvider>
  );
}