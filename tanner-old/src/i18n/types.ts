// Utility types for nested keys
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

// Utility type for getting keys of specific type
type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Plural translation structure
type PluralTranslation = {
  zero?: string;
  one: string;
  other: string;
};

// Interpolation parameters
type InterpolationParams = Record<string, string | number>;

// Extended interpolation parameters for advanced formatting
type ExtendedInterpolationParams = Record<string, string | number | Date | boolean>;

// Formatter options for advanced interpolation
type FormatterOptions = {
  locale?: string;
  numberFormat?: Intl.NumberFormatOptions;
  dateFormat?: Intl.DateTimeFormatOptions;
  escapeHtml?: boolean;
};

// Translation resource types with nested structure
type TranslationResource = {
  common: {
    welcome: string;
    hello: string;
    goodbye: string;
    language: string;
    english: string;
    spanish: string;
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    create: string;
    update: string;
    search: string;
    filter: string;
    sort: string;
    home: string;
    about: string;
    contact: string;
    settings: string;
    profile: string;
    logout: string;
    login: string;
    register: string;
  };
  'main-page': {
    title: string;
    subtitle: string;
    description: string;
  };
  apple: PluralTranslation;
  'more-items': string; // with {{count}} interpolation
  'allowed-symbols': string; // with {{symbols}} interpolation
  greeting: string; // with {{name}} interpolation
};

// Supported languages
type SupportedLanguage = 'en' | 'es';

// Language configuration
type LanguageConfig = {
  code: SupportedLanguage;
  name: string;
  flag: string;
};

// i18n configuration type
type I18nConfig = {
  resources: {
    [K in SupportedLanguage]: TranslationResource;
  };
  fallbackLng: SupportedLanguage;
  detection: {
    order: string[];
    lookupLocalStorage: string;
    caches: string[];
  };
  interpolation: {
    escapeValue: boolean;
  };
  defaultNS: string;
  ns: string[];
  debug: boolean;
  supportedLngs: SupportedLanguage[];
  nonExplicitSupportedLngs: boolean;
};

// Translation keys
type TranslationKey = NestedKeyOf<TranslationResource>;
type PluralKey = KeysOfType<TranslationResource, PluralTranslation>;
type InterpolationKey = KeysOfType<TranslationResource, string>;

// Translation function overloads
type TFunction = {
  // Simple keys (no interpolation, no plural)
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

// Language switcher props
type LanguageSwitcherProps = {
  className?: string;
  variant?: 'select' | 'buttons';
};

// Export types
export type {
  TranslationResource,
  SupportedLanguage,
  LanguageConfig,
  I18nConfig,
  TranslationKey,
  PluralKey,
  InterpolationKey,
  TFunction,
  LanguageSwitcherProps,
  PluralTranslation,
  InterpolationParams,
  ExtendedInterpolationParams,
  FormatterOptions,
  NestedKeyOf,
  KeysOfType,
};
