import type { SupportedLanguage, PluralTranslation } from '../types';

// Plural rules for supported languages
const pluralRules: Record<SupportedLanguage, Intl.PluralRules> = {
  en: new Intl.PluralRules('en'),
  es: new Intl.PluralRules('es'),
};

/**
 * Get the correct plural form based on count and language
 */
export function getPluralForm(
  count: number,
  language: SupportedLanguage,
  translations: PluralTranslation
): string {
  const rule = pluralRules[language];
  const category = rule.select(count);
  
  // Map Intl.PluralRules categories to our translation keys
  switch (category) {
    case 'zero':
      return translations.zero || translations.other;
    case 'one':
      return translations.one;
    case 'two':
    case 'few':
    case 'many':
    case 'other':
    default:
      return translations.other;
  }
}

/**
 * Check if a translation object is a plural translation
 */
export function isPluralTranslation(value: any): value is PluralTranslation {
  return (
    typeof value === 'object' &&
    value !== null &&
    'one' in value &&
    'other' in value &&
    typeof value.one === 'string' &&
    typeof value.other === 'string'
  );
}

/**
 * Create a plural translation with count interpolation
 */
export function createPluralWithCount(
  pluralObj: PluralTranslation,
  count: number,
  language: SupportedLanguage
): string {
  const translation = getPluralForm(count, language, pluralObj);
  
  // Replace {{count}} with actual number
  return translation.replace(/\{\{count\}\}/g, count.toString());
}

/**
 * Validate a plural translation object
 */
export function validatePluralTranslation(obj: any): obj is PluralTranslation {
  if (!isPluralTranslation(obj)) {
    return false;
  }
  
  // Check required fields exist
  if (!obj.one || !obj.other) {
    return false;
  }
  
  // Check all values are strings
  for (const key in obj) {
    if (typeof obj[key] !== 'string') {
      return false;
    }
  }
  
  return true;
}

/**
 * Get available plural forms for a language
 */
export function getAvailablePluralForms(language: SupportedLanguage): string[] {
  const rule = pluralRules[language];
  const forms: string[] = [];
  
  // Test different numbers to find all forms
  const testNumbers = [0, 1, 2, 3, 4, 5, 10, 11, 20, 21, 100, 101, 1000];
  
  for (const num of testNumbers) {
    const form = rule.select(num);
    if (!forms.includes(form)) {
      forms.push(form);
    }
  }
  
  return forms;
}