import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
// Import translation resources
import enCommon from './resources/en/common.json';
import esCommon from './resources/es/common.json';
import type { I18nConfig } from './types';

const resources: I18nConfig['resources'] = {
  en: {
    common: enCommon,
  },
  es: {
    common: esCommon,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',

    // Detect user language
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Namespace configuration
    defaultNS: 'common',
    ns: ['common'],

    // Development settings
    debug: process.env.NODE_ENV === 'development',

    // Only load supported languages
    supportedLngs: ['en', 'es'],
    nonExplicitSupportedLngs: true,
  });

export default i18n;
