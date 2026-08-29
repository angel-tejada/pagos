/**
 * El idioma de la app. / The app language.
 *
 * `useLang()` da el texto ya elegido: `t.owesMeNow`, `t.overpaidBy('$5.00')`.
 *
 * Por ahora el idioma vive solo en memoria y vuelve a español al cerrar la app.
 * Se guardará en el teléfono en el paso 2 (la capa de datos).
 * For now the language is memory-only; it gets saved to the device in step 2.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_LANG, dict, type Lang, type Strings } from './strings';

type LangValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Strings;
};

const LangContext = createContext<LangValue | null>(null);
const LANGUAGE_STORAGE_KEY = 'pagos_language_v1';

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'es' || saved === 'en') setLangState(saved);
      })
      .catch(() => undefined);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    void AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, next);
  }, []);

  const value = useMemo<LangValue>(() => ({ lang, setLang, t: dict[lang] }), [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangValue {
  const value = useContext(LangContext);
  if (!value) throw new Error('useLang debe usarse dentro de <LangProvider>');
  return value;
}

export type { Lang, Strings };
