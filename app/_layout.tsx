// app/_layout.tsx
import { Stack } from 'expo-router';
import { I18nextProvider } from 'react-i18next';
import { StatusBar } from 'react-native';
import { COLORS } from '../constants/theme';
import { RAGProvider } from './context/RAGContext';
import i18n from './i18n/i18n';
import { I18nBootstrap } from './i18n/I18nBootstrap';

export default function Layout() {
  return (
    <I18nextProvider i18n={i18n}>
      <I18nBootstrap>
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
      </I18nBootstrap>
    </I18nextProvider>
  );
}