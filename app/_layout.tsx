import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Registers the local-notification handler at startup.
import '../src/data/reminders';
import { LangProvider } from '../src/i18n';
import { DataProvider } from '../src/data/store';
import { ThemeContextProvider, useResolvedPalette } from '../src/theme';

export default function RootLayout() {
  /** Light and dark both ship; the device setting decides. */
  const { palette, scheme } = useResolvedPalette();

  return (
    <ThemeContextProvider value={palette}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.bg }}>
        <SafeAreaProvider>
          <DataProvider>
            <LangProvider>
              <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: palette.bg },
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
    </ThemeContextProvider>
  );
}
