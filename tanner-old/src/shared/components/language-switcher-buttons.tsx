import { clsx } from 'clsx';
import { useTranslation } from '@/shared/hooks/use-translation';
import type { LanguageConfig, SupportedLanguage } from '@/i18n/types';

const LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', flag: 'EN' },
  { code: 'es', name: 'Español', flag: 'ES' },
];

export const LanguageSwitcherButtons = () => {
  const { language, changeLanguage, isLanguage } = useTranslation();

  const handleLanguageChange = (languageCode: SupportedLanguage) => {
    changeLanguage(languageCode);
  };

  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          onClick={() => handleLanguageChange(language.code)}
          className={clsx(
            'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            isLanguage(language.code)
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
          aria-pressed={isLanguage(language.code)}
        >
          <span>{language.flag}</span>
          <span>{language.name}</span>
        </button>
      ))}
    </div>
  );
};
