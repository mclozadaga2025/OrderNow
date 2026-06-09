import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const LANGUAGE_STORAGE_KEY = 'ordernows.language';

export type AppLanguage = 'en' | 'vi';

interface LanguageContextValue {
  language: AppLanguage;
  locale: 'en-US' | 'vi-VN';
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  locale: 'en-US',
  setLanguage: () => {},
  toggleLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setCurrentLanguage] = useState<AppLanguage>('en');

  useEffect(() => {
    void AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((storedLanguage) => {
      if (storedLanguage === 'en' || storedLanguage === 'vi') {
        setCurrentLanguage(storedLanguage);
      }
    });
  }, []);

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    setCurrentLanguage(nextLanguage);
    void AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  }, [language, setLanguage]);

  const value = useMemo(
    () => ({
      language,
      locale: language === 'vi' ? ('vi-VN' as const) : ('en-US' as const),
      setLanguage,
      toggleLanguage,
    }),
    [language, setLanguage, toggleLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
