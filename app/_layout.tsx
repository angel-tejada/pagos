import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';

// Registers the local-notification handler at startup.
import '../src/data/reminders';
import { DeviceFrame } from '../src/components/DeviceFrame';
import { LangProvider } from '../src/i18n';
import { DataProvider } from '../src/data/store';
import { ThemeContextProvider, ThemeControlProvider, useThemePreference } from '../src/theme';

/** Only the browser preview gets the phone frame; native renders bare. */
function Framed({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return <DeviceFrame>{children}</DeviceFrame>;
}

/**
 * The frame already reserves the status bar and home indicator, so the web
 * build reports no insets of its own. Anything else double-insets and pushes
 * the header down into a gap. Native reads its real insets.
 */
const WEB_METRICS: Metrics = {
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
  frame: { x: 0, y: 0, width: 402, height: 874 },
};

export default function RootLayout() {
  /** Light by default; the user switches it in Options. */
  const { palette, scheme, setScheme } = useThemePreference();
  // Inter carries the whole interface; nothing renders in a fallback face.
  const [fontsReady] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  const control = { scheme, setScheme };

  if (!fontsReady) return null;

  return (
    <ThemeControlProvider value={control}>
      <ThemeContextProvider value={palette}>
        <Framed>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.bg }}>
            <SafeAreaProvider initialMetrics={Platform.OS === 'web' ? WEB_METRICS : undefined}>
              <DataProvider>
                <LangProvider>
                  <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: palette.bg },
                    }}>
                    <Stack.Screen name="index" options={{ animation: 'none' }} />
                    <Stack.Screen name="person/[id]" options={{ animation: 'slide_from_right' }} />
                    <Stack.Screen name="entry" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  </Stack>
                </LangProvider>
              </DataProvider>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </Framed>
      </ThemeContextProvider>
    </ThemeControlProvider>
  );
}
