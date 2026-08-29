/**
 * El esqueleto de la app: una pila de pantallas.
 * The app skeleton: one stack of screens.
 *
 *   index        → la lista de personas / the list of people
 *   person/[id]  → una persona y su historial / one person and their history
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LangProvider } from '../src/i18n';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <LangProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.bg },
              headerTintColor: colors.text,
              headerTitleStyle: { color: colors.text },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: colors.bg },
            }}
          />
        </LangProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
