'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en, TranslationKey } from './en';
import { hi } from './hi';

type Language = 'en' | 'hi';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Load from local storage on mount
    const saved = localStorage.getItem('startupiq_lang');
    if (saved === 'hi' || saved === 'en') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('startupiq_lang', lang);
  };

  const t = (key: TranslationKey): string => {
    if (language === 'hi') {
      return hi[key] || en[key] || key;
    }
    return en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
