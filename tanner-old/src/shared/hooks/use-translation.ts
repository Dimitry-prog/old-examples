import { useTranslation as useI18nTranslation } from 'react-i18next';
import type { 
  SupportedLanguage, 
  TranslationKey, 
  PluralKey, 
  InterpolationKey,
  InterpolationParams,
  ExtendedInterpolationParams,
  PluralTranslation 
} from '@/i18n/types';
import { getPluralForm, isPluralTranslation, createPluralWithCount } from '@/i18n/utils/pluralization';
import { safeInterpolate, advancedInterpolate, hasAdvancedFormatting } from '@/i18n/utils/interpolation';
import { getNestedValue, hasNestedKey } from '@/i18n/nested-keys';

type TranslationOptions = {
  count?: number;
  locale?: string;
  escapeHtml?: boolean;
} & ExtendedInterpolationParams;

export const useTranslation = (namespace = 'common') => {
  const { t: originalT, i18n, ready } = useI18nTranslation(namespace);

  // Enhanced translation function with overloads
  const t = ((key: TranslationKey, options?: TranslationOptions): string => {
    try {
      // Try to get translation using react-i18next first
      let rawTranslation = originalT(key, { returnObjects: true });
      
      // If not found and key contains dots, try nested key approach
      if (rawTranslation === key && key.includes('.')) {
        const resources = i18n.getResourceBundle(i18n.language, namespace);
        rawTranslation = getNestedValue(resources, key);
      }
      
      // Handle plural translations
      if (isPluralTranslation(rawTranslation) && options?.count !== undefined) {
        const currentLanguage = i18n.language as SupportedLanguage;
        const pluralForm = getPluralForm(
          options.count,
          currentLanguage,
          rawTranslation as PluralTranslation
        );
        
        // Apply interpolation to the selected plural form
        const locale = options.locale || i18n.language;
        const interpolationParams = { count: options.count, ...options };
        
        if (hasAdvancedFormatting(pluralForm)) {
          return advancedInterpolate(pluralForm, interpolationParams, locale);
        }
        
        return safeInterpolate(pluralForm, interpolationParams, options.escapeHtml);
      }
      
      // Handle regular string translations with interpolation
      if (typeof rawTranslation === 'string' && options) {
        const locale = options.locale || i18n.language;
        
        if (hasAdvancedFormatting(rawTranslation)) {
          return advancedInterpolate(rawTranslation, options, locale);
        }
        
        return safeInterpolate(rawTranslation, options, options.escapeHtml);
      }
      
      // Return simple translation
      return typeof rawTranslation === 'string' ? rawTranslation : String(rawTranslation);
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      return key; // Fallback to key itself
    }
  }) as {
    // Simple keys
    (key: Exclude<TranslationKey, PluralKey | InterpolationKey>): string;
    // Nested keys
    (key: TranslationKey): string;
    // Plural keys with count
    (key: PluralKey, options: { count: number }): string;
    // Interpolation keys with parameters
    (key: InterpolationKey, params: InterpolationParams): string;
    // Combined: plural with interpolation
    (key: PluralKey, options: { count: number } & InterpolationParams): string;
  };

  // Utility functions
  const hasTranslation = (key: TranslationKey): boolean => {
    const translation = originalT(key, { returnObjects: true });
    if (translation !== key) return true;
    
    // Check nested keys
    if (key.includes('.')) {
      const resources = i18n.getResourceBundle(i18n.language, namespace);
      return hasNestedKey(resources, key);
    }
    
    return false;
  };
  
  const getTranslationKeys = (): string[] => {
    const resources = i18n.getResourceBundle(i18n.language, namespace);
    return Object.keys(resources || {});
  };
  
  const isPlural = (key: TranslationKey): boolean => {
    const translation = originalT(key, { returnObjects: true });
    return isPluralTranslation(translation);
  };

  return {
    t,
    i18n,
    ready,
    language: i18n.language as SupportedLanguage,
    changeLanguage: (lng: SupportedLanguage) => i18n.changeLanguage(lng),
    isLanguage: (lng: SupportedLanguage) => i18n.language === lng,
    hasTranslation,
    getTranslationKeys,
    isPlural,
    // Utility methods for advanced usage
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) => 
      new Intl.NumberFormat(i18n.language, options).format(value),
    formatDate: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
      const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
      return new Intl.DateTimeFormat(i18n.language, options).format(date);
    },
  };
};
