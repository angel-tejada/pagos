import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Registers the local-notification handler at startup.
import '../src/data/reminders';
import { LangProvider } from '../src/i18n';
import { DataProvider } from '../src/data/store';
import { ThemeContextProvider, ThemeControlProvider, useThemePreference } from '../src/theme';

export default function RootLayout() {
  /** Light by default; the user switches it in Options. */
  const { palette, scheme, setScheme } = useThemePreference();
  const control = { scheme, setScheme };

  return (
    <ThemeControlProvider value={control}>
      <ThemeContextProvider value={palette}>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.bg }}>
          <SafeAreaProvider>
            <DataProvider>
              <LangProvider>
                <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: palette.bg },
                  }}>
                  {/* The two tabs swap with no animation. A transition here
                      reads as the screen sliding or dropping on every tap. */}
                  <Stack.Screen name="index" options={{ animation: 'none' }} />
                  <Stack.Screen name="people" options={{ animation: 'none' }} />
                  <Stack.Screen name="person/[id]" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="entry" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                </Stack>
              </LangProvider>
            </DataProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ThemeContextProvider>
    </ThemeControlProvider>
  );
}
