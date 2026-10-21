import { createContext, useContext, useState, useEffect } from 'react';
import { locales, translate } from '../i18n/translations';

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    return localStorage.getItem('notecraft_locale') || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('notecraft_locale', locale);
    document.documentElement.lang = locale === 'zh-TW' ? 'zh-Hant' : locale;
  }, [locale]);

  const setLocale = (code) => {
    if (locales.some((l) => l.code === code)) setLocaleState(code);
  };

  const t = (key) => translate(locale, key);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, locales }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);
