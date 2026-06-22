'use client';

import React from 'react';
import { useLanguage } from '../../lib/i18n/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLang = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <button
      onClick={toggleLang}
      className="flex items-center justify-center px-3 py-1.5 text-sm font-medium border border-gray-700 hover:border-gray-500 rounded-md bg-gray-900/50 text-gray-300 hover:text-white transition-colors"
      title="Toggle Language (English / Hindi)"
    >
      {language === 'en' ? 'EN | हिं' : 'हिं | EN'}
    </button>
  );
}
