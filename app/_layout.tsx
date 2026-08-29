import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LangProvider } from '../src/i18n';
import { DataProvider } from '../src/data/store';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <DataProvider>
          <LangProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
                animation: 'fade_from_bottom',
              }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="people" />
              <Stack.Screen name="person/[id]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="entry" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            </Stack>
          </LangProvider>
        </DataProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
