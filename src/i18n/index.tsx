/**
 * El idioma de la app. / The app language.
 *
 * `useLang()` da el texto ya elegido: `t.owesMeNow`, `t.overpaidBy('$5.00')`.
 *
 * Por ahora el idioma vive solo en memoria y vuelve a español al cerrar la app.
 * Se guardará en el teléfono en el paso 2 (la capa de datos).
 * For now the language is memory-only; it gets saved to the device in step 2.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_LANG, dict, type Lang, type Strings } from './strings';

type LangValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Strings;
};

const LangContext = createContext<LangValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);

  const value = useMemo<LangValue>(() => ({ lang, setLang, t: dict[lang] }), [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangValue {
  const value = useContext(LangContext);
  if (!value) throw new Error('useLang debe usarse dentro de <LangProvider>');
  return value;
}

export type { Lang, Strings };
